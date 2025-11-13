const StateManager = require('../utils/state-manager');
const Validator = require('../utils/validator');

class WorkflowController {
  constructor(executionPlan) {
    this.executionPlan = executionPlan;
    this.stateManager = new StateManager();
    this.validator = new Validator();
    this.state = null;
  }

  /**
   * 启动工作流
   */
  async startWorkflow(workflowId, context = {}) {
    // 初始化状态
    this.state = {
      workflowId: workflowId,
      workflowName: this.executionPlan.metadata.name,
      status: 'in_progress',
      startTime: new Date().toISOString(),
      currentStepIndex: 0,
      completedSteps: [],
      context: context,
      errors: [],
      retries: {}
    };

    // 保存状态
    await this.stateManager.save(this.state);

    // 获取第一步
    const firstStepDef = this.executionPlan.steps[0];
    const firstStep = this.buildStepInstruction(firstStepDef);

    return {
      success: true,
      workflowId: workflowId,
      workflowName: this.executionPlan.metadata.name,
      totalSteps: this.executionPlan.steps.length,
      firstStep: firstStep
    };
  }

  /**
   * 步骤完成回调
   */
  async onStepComplete({ workflowId, stepId, status, outputs, duration }) {
    // 1. 验证步骤输出
    const stepDef = this.executionPlan.steps[this.state.currentStepIndex];
    const validationResult = await this.validator.validateOutputs(stepDef, outputs);

    if (!validationResult.passed) {
      return {
        success: false,
        action: 'fix_quality',
        issues: validationResult.issues,
        message: '步骤输出质量验证失败,请修复问题后重试'
      };
    }

    // 2. 记录完成步骤
    this.state.completedSteps.push({
      stepId: stepId,
      agent: stepDef.agent,
      status: status,
      outputs: outputs,
      duration: duration,
      completedAt: new Date().toISOString()
    });

    // 3. 移动到下一步
    this.state.currentStepIndex++;

    // 4. 保存状态
    await this.stateManager.save(this.state);

    // 5. 检查是否还有下一步
    if (this.state.currentStepIndex >= this.executionPlan.steps.length) {
      // 工作流完成
      this.state.status = 'completed';
      this.state.endTime = new Date().toISOString();
      await this.stateManager.save(this.state);

      return {
        success: true,
        hasNextStep: false,
        message: '🎉 工作流执行完成!',
        summary: this.generateSummary()
      };
    }

    // 6. 获取下一步指令
    const nextStepDef = this.executionPlan.steps[this.state.currentStepIndex];
    const nextStep = this.buildStepInstruction(nextStepDef);

    return {
      success: true,
      hasNextStep: true,
      nextStep: nextStep,
      progress: {
        currentStepIndex: this.state.currentStepIndex + 1,
        totalSteps: this.executionPlan.steps.length,
        percentComplete: Math.round(((this.state.currentStepIndex + 1) / this.executionPlan.steps.length) * 100)
      }
    };
  }

  /**
   * 步骤失败回调
   */
  async onStepFailed({ workflowId, stepId, error, errorDetails }) {
    const stepDef = this.executionPlan.steps[this.state.currentStepIndex];

    // 记录错误
    this.state.errors.push({
      stepId: stepId,
      error: error,
      errorDetails: errorDetails,
      timestamp: new Date().toISOString()
    });

    // 检查是否可以重试
    const maxRetries = stepDef.onFailure?.max_retries || 3;
    const currentRetries = this.state.retries[stepId] || 0;

    if (currentRetries < maxRetries) {
      // 可以重试
      this.state.retries[stepId] = currentRetries + 1;
      await this.stateManager.save(this.state);

      const retryStep = this.buildStepInstruction(stepDef);

      return {
        success: true,
        action: 'retry',
        retryCount: currentRetries + 1,
        maxRetries: maxRetries,
        retryStep: retryStep,
        message: `将进行第 ${currentRetries + 1} 次重试`
      };
    } else {
      // 达到最大重试次数,中止工作流
      this.state.status = 'failed';
      this.state.endTime = new Date().toISOString();
      await this.stateManager.save(this.state);

      return {
        success: false,
        action: 'abort',
        message: `步骤 "${stepId}" 执行失败,已达最大重试次数`,
        escalation: stepDef.onFailure?.escalation || '需要人工介入'
      };
    }
  }

  /**
   * 构建步骤执行指令
   */
  buildStepInstruction(stepDef) {
    // 从 detailed_steps 中提取命令和提示词
    const detailedSteps = stepDef.detailedSteps || [];

    // 找到第一个命令步骤(非智能体切换)
    const commandStep = detailedSteps.find(ds =>
      ds.command && ds.command.startsWith('*')
    );

    // 找到智能体切换步骤
    const agentSwitchStep = detailedSteps.find(ds =>
      ds.command && ds.command.startsWith('/')
    );

    return {
      stepId: stepDef.id,
      stepDescription: stepDef.description,
      agent: stepDef.agent,
      switchCommand: agentSwitchStep?.command || `/agent ${stepDef.agent}`,
      executeCommand: commandStep?.command || '',
      prompt: commandStep?.prompt_template || '',
      inputFiles: stepDef.requires || [],
      expectedOutputs: stepDef.outputs || [],
      detailedSteps: detailedSteps,
      estimatedDuration: stepDef.duration
    };
  }

  /**
   * 生成完成摘要
   */
  generateSummary() {
    const totalDuration = this.state.completedSteps.reduce((sum, step) => sum + (step.duration || 0), 0);
    const allOutputs = this.state.completedSteps.flatMap(step => step.outputs || []);

    return {
      workflowId: this.state.workflowId,
      workflowName: this.state.workflowName,
      status: this.state.status,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      totalDuration: totalDuration,
      totalDurationFormatted: this.formatDuration(totalDuration),
      totalSteps: this.state.completedSteps.length,
      outputs: allOutputs.map(o => o.file),
      errors: this.state.errors.length
    };
  }

  /**
   * 格式化时长
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    if (!this.state) {
      return {
        status: 'not_started',
        message: '协调器已启动,等待工作流开始'
      };
    }

    return {
      workflowId: this.state.workflowId,
      workflowName: this.state.workflowName,
      status: this.state.status,
      currentStepIndex: this.state.currentStepIndex + 1,
      totalSteps: this.executionPlan.steps.length,
      completedSteps: this.state.completedSteps.map(s => s.stepId),
      currentStep: this.executionPlan.steps[this.state.currentStepIndex]?.id,
      errors: this.state.errors.length,
      startTime: this.state.startTime
    };
  }

  /**
   * 中止工作流
   */
  async abort(workflowId, reason) {
    if (this.state) {
      this.state.status = 'aborted';
      this.state.abortReason = reason;
      this.state.endTime = new Date().toISOString();
      await this.stateManager.save(this.state);
    }
  }
}

module.exports = WorkflowController;
