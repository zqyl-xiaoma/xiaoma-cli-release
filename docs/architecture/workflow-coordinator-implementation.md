# 工作流协调器 - 完整实现指南

> **版本**: 2.0.0
> **日期**: 2025-11-13
> **相关文档**: [PRD文档](../prd/workflow-coordinator-prd.md)

---

## 目录

1. [快速开始](#1-快速开始)
2. [协调器端实现](#2-协调器端实现)
3. [Claude Code端实现](#3-claude-code端实现)
4. [完整示例](#4-完整示例)
5. [测试和调试](#5-测试和调试)

---

## 1. 快速开始

### 1.1 项目初始化

```bash
# 1. 创建协调器项目
cd tools/
mkdir workflow-coordinator
cd workflow-coordinator

# 2. 初始化npm项目
npm init -y

# 3. 安装依赖
npm install express js-yaml fs-extra chalk cors dotenv

# 4. 安装开发依赖
npm install --save-dev nodemon jest

# 5. 创建目录结构
mkdir -p src/{api,parser,controller,utils}
mkdir -p test
```

### 1.2 项目结构

```
tools/workflow-coordinator/
├── src/
│   ├── index.js                    # 主入口
│   ├── api/
│   │   └── server.js               # HTTP服务器
│   ├── parser/
│   │   └── workflow-parser.js      # 工作流解析器
│   ├── controller/
│   │   └── workflow-controller.js  # 工作流控制器
│   └── utils/
│       ├── state-manager.js        # 状态管理
│       └── validator.js            # 验证器
├── test/
├── package.json
└── README.md

xiaoma-core/agents/
└── workflow-helper.md              # 新增智能体
```

---

## 2. 协调器端实现

### 2.1 主入口 (src/index.js)

```javascript
#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const WorkflowParser = require('./parser/workflow-parser');
const WorkflowController = require('./controller/workflow-controller');
const CoordinatorServer = require('./api/server');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const workflowName = args[1];

  if (command === 'start' && workflowName) {
    console.log(chalk.blue(`\n🚀 启动工作流协调器\n`));

    try {
      // 1. 解析工作流
      console.log(chalk.cyan(`📋 解析工作流: ${workflowName}`));
      const parser = new WorkflowParser();
      const executionPlan = await parser.parse(workflowName);

      console.log(chalk.green(`✅ 工作流解析完成: ${executionPlan.metadata.name}`));
      console.log(chalk.gray(`   步骤数: ${executionPlan.steps.length}`));

      // 2. 创建控制器
      const controller = new WorkflowController(executionPlan);

      // 3. 启动HTTP服务
      console.log(chalk.cyan(`\n🌐 启动HTTP服务...`));
      const server = new CoordinatorServer(controller);
      const port = process.env.COORDINATOR_PORT || 3001;

      await server.start(port);

      console.log(chalk.green(`✅ HTTP服务已启动: http://localhost:${port}`));
      console.log(chalk.yellow(`\n⏳ 等待Claude Code连接...\n`));
      console.log(chalk.gray(`   提示: 在Claude Code中执行以下命令启动工作流:`));
      console.log(chalk.gray(`   /workflow-helper`));
      console.log(chalk.gray(`   *start-workflow ${workflowName}\n`));

    } catch (error) {
      console.error(chalk.red(`\n❌ 启动失败: ${error.message}\n`));
      console.error(error.stack);
      process.exit(1);
    }

  } else {
    // 显示帮助
    console.log(chalk.blue(`\n工作流协调器\n`));
    console.log(`用法:`);
    console.log(`  xiaoma-coordinator start <workflow-name>     启动工作流协调器`);
    console.log(``);
    console.log(`示例:`);
    console.log(`  xiaoma-coordinator start requirements-analysis`);
    console.log(``);
  }
}

main();
```

---

### 2.2 HTTP服务器 (src/api/server.js)

```javascript
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');

class CoordinatorServer {
  constructor(controller) {
    this.app = express();
    this.controller = controller;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(cors());

    // 请求日志
    this.app.use((req, res, next) => {
      console.log(chalk.gray(`[${new Date().toISOString()}] ${req.method} ${req.path}`));
      next();
    });
  }

  setupRoutes() {
    // API: 启动工作流
    this.app.post('/workflow/start', async (req, res) => {
      try {
        const { workflowId, context } = req.body;

        console.log(chalk.cyan(`\n📥 收到启动请求: ${workflowId}`));

        const result = await this.controller.startWorkflow(workflowId, context);

        console.log(chalk.green(`✅ 返回第一步指令: ${result.firstStep.stepId}`));

        res.json(result);
      } catch (error) {
        console.error(chalk.red(`❌ 启动失败: ${error.message}`));
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 步骤完成回调
    this.app.post('/workflow/step-complete', async (req, res) => {
      try {
        const { workflowId, stepId, status, outputs, duration } = req.body;

        console.log(chalk.cyan(`\n📥 步骤完成: ${stepId}`));
        console.log(chalk.gray(`   耗时: ${Math.round(duration / 1000)}秒`));
        console.log(chalk.gray(`   输出: ${outputs.length}个文件`));

        const result = await this.controller.onStepComplete({
          workflowId,
          stepId,
          status,
          outputs,
          duration
        });

        if (result.hasNextStep) {
          console.log(chalk.green(`✅ 返回下一步指令: ${result.nextStep.stepId}`));
          console.log(chalk.yellow(`   进度: ${result.progress.percentComplete}% (${result.progress.currentStepIndex}/${result.progress.totalSteps})`));
        } else {
          console.log(chalk.green.bold(`\n🎉 工作流执行完成!\n`));
        }

        res.json(result);
      } catch (error) {
        console.error(chalk.red(`❌ 处理失败: ${error.message}`));
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 步骤失败回调
    this.app.post('/workflow/step-failed', async (req, res) => {
      try {
        const { workflowId, stepId, error, errorDetails } = req.body;

        console.log(chalk.red(`\n❌ 步骤失败: ${stepId}`));
        console.log(chalk.red(`   错误: ${error}`));

        const result = await this.controller.onStepFailed({
          workflowId,
          stepId,
          error,
          errorDetails
        });

        res.json(result);
      } catch (error) {
        console.error(chalk.red(`❌ 处理失败: ${error.message}`));
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 查询状态
    this.app.get('/workflow/status', (req, res) => {
      const status = this.controller.getStatus();
      res.json(status);
    });

    // API: 中止工作流
    this.app.post('/workflow/abort', async (req, res) => {
      try {
        const { workflowId, reason } = req.body;

        console.log(chalk.yellow(`\n⏸️ 中止工作流: ${reason}`));

        await this.controller.abort(workflowId, reason);

        res.json({
          success: true,
          message: '工作流已中止'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });
  }

  async start(port) {
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        resolve();
      });
    });
  }

  async stop() {
    if (this.server) {
      await this.server.close();
    }
  }
}

module.exports = CoordinatorServer;
```

---

### 2.3 工作流控制器 (src/controller/workflow-controller.js)

```javascript
const fs = require('fs-extra');
const path = require('path');
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
    const totalDuration = this.state.completedSteps.reduce((sum, step) => sum + step.duration, 0);
    const allOutputs = this.state.completedSteps.flatMap(step => step.outputs);

    return {
      workflowId: this.state.workflowId,
      workflowName: this.state.workflowName,
      status: this.state.status,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      totalDuration: totalDuration,
      totalSteps: this.state.completedSteps.length,
      outputs: allOutputs.map(o => o.file),
      errors: this.state.errors.length
    };
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      workflowId: this.state?.workflowId,
      status: this.state?.status || 'not_started',
      currentStepIndex: this.state?.currentStepIndex,
      totalSteps: this.executionPlan.steps.length,
      completedSteps: this.state?.completedSteps.map(s => s.stepId) || [],
      errors: this.state?.errors.length || 0
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
```

---

### 2.4 工作流解析器 (src/parser/workflow-parser.js)

```javascript
const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');

class WorkflowParser {
  constructor() {
    this.workflowsDir = path.join(process.cwd(), '../../xiaoma-core/workflows');
  }

  async parse(workflowName) {
    // 1. 查找工作流文件
    const workflowFile = this.findWorkflowFile(workflowName);

    if (!workflowFile) {
      throw new Error(`工作流文件未找到: ${workflowName}`);
    }

    // 2. 读取并解析YAML
    const yamlContent = await fs.readFile(workflowFile, 'utf-8');
    const workflowDef = yaml.load(yamlContent);

    // 3. 验证工作流定义
    this.validate(workflowDef);

    // 4. 构建执行计划
    const executionPlan = {
      metadata: {
        id: workflowDef.workflow.id,
        name: workflowDef.workflow.name,
        description: workflowDef.workflow.description,
        type: workflowDef.workflow.type
      },
      steps: workflowDef.workflow.sequence.map(step => this.parseStep(step)),
      qualityGates: workflowDef.workflow.quality_gates || {},
      errorHandling: workflowDef.workflow.error_handling || {}
    };

    return executionPlan;
  }

  parseStep(stepYaml) {
    return {
      id: stepYaml.step,
      description: stepYaml.action || stepYaml.step,
      agent: stepYaml.agent,
      duration: stepYaml.duration,
      requires: stepYaml.requires || [],
      detailedSteps: stepYaml.detailed_steps || [],
      validationCriteria: stepYaml.validation_criteria || [],
      outputs: this.extractOutputs(stepYaml),
      onFailure: stepYaml.on_failure
    };
  }

  extractOutputs(stepYaml) {
    const outputs = [];

    // 从validation_criteria提取
    if (stepYaml.validation_criteria) {
      stepYaml.validation_criteria.forEach(criterion => {
        if (typeof criterion === 'string' && criterion.includes('file_created:')) {
          const filePath = criterion.split('file_created:')[1].trim().replace(/["']/g, '');
          outputs.push({ file: filePath });
        }
      });
    }

    // 从detailed_steps提取
    if (stepYaml.detailed_steps) {
      stepYaml.detailed_steps.forEach(detailStep => {
        if (detailStep.output && detailStep.output.file) {
          outputs.push({ file: detailStep.output.file });
        }
      });
    }

    return outputs;
  }

  findWorkflowFile(workflowName) {
    const possibleNames = [
      `${workflowName}.yaml`,
      `${workflowName}.yml`,
      `automated-${workflowName}.yaml`,
      `automated-${workflowName}.yml`
    ];

    for (const name of possibleNames) {
      const filePath = path.join(this.workflowsDir, name);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }

  validate(workflowDef) {
    if (!workflowDef.workflow) {
      throw new Error('无效的工作流定义: 缺少 workflow 字段');
    }

    if (!workflowDef.workflow.sequence || !Array.isArray(workflowDef.workflow.sequence)) {
      throw new Error('无效的工作流定义: 缺少 sequence 字段');
    }

    if (workflowDef.workflow.sequence.length === 0) {
      throw new Error('无效的工作流定义: sequence 为空');
    }
  }
}

module.exports = WorkflowParser;
```

---

### 2.5 状态管理器 (src/utils/state-manager.js)

```javascript
const fs = require('fs-extra');
const path = require('path');

class StateManager {
  constructor() {
    this.stateDir = path.join(process.cwd(), '../../.xiaoma-core');
    this.stateFile = path.join(this.stateDir, '.coordinator-state.json');
  }

  async save(state) {
    await fs.ensureDir(this.stateDir);
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2), 'utf-8');
  }

  async load() {
    if (!fs.existsSync(this.stateFile)) {
      return null;
    }

    const content = await fs.readFile(this.stateFile, 'utf-8');
    return JSON.parse(content);
  }

  async clear() {
    if (fs.existsSync(this.stateFile)) {
      await fs.remove(this.stateFile);
    }
  }
}

module.exports = StateManager;
```

---

### 2.6 验证器 (src/utils/validator.js)

```javascript
const fs = require('fs-extra');

class Validator {
  async validateOutputs(stepDef, actualOutputs) {
    const issues = [];

    // 验证所有预期输出文件
    for (const expectedOutput of stepDef.outputs || []) {
      const filePath = expectedOutput.file;
      const actualOutput = actualOutputs.find(o => o.file === filePath);

      if (!actualOutput) {
        issues.push({
          level: 'error',
          message: `输出文件未报告: ${filePath}`
        });
        continue;
      }

      if (!actualOutput.exists) {
        issues.push({
          level: 'error',
          message: `输出文件不存在: ${filePath}`
        });
        continue;
      }

      if (actualOutput.size === 0) {
        issues.push({
          level: 'warning',
          message: `输出文件为空: ${filePath}`
        });
      }
    }

    return {
      passed: issues.filter(i => i.level === 'error').length === 0,
      issues: issues
    };
  }
}

module.exports = Validator;
```

---

## 3. Claude Code端实现

### 3.1 workflow-helper智能体定义

**文件**: `xiaoma-core/agents/workflow-helper.md`

```markdown
# Workflow Helper - 工作流助手 🤖

> **核心使命: 与工作流协调器通信,自动执行工作流步骤**

---

激活通知: 此文件包含您完整的智能体操作指南。

关键提示: 请阅读此文件中的完整YAML块以理解您的操作参数,并严格遵循您的激活指令:

## 完整的智能体定义

\`\`\`yaml
activation-instructions:
  - 步骤1: 阅读整个文件
  - 步骤2: 采用下面'agent'和'persona'部分中定义的角色
  - 步骤3: 向用户打招呼,显示可用命令
  - 步骤4: 等待用户执行命令

agent:
  name: workflow-helper
  id: workflow-helper
  title: Workflow Helper
  icon: 🤖
  role: 工作流自动化助手,负责与工作流协调器通信
  expertise: 工作流执行、智能体协调、HTTP通信

persona:
  role: 工作流自动化助手
  style: 自动化、高效、精确、无需确认
  identity: 专注于执行工作流协调器下发的指令,自动完成所有步骤
  focus: 与协调器通信、智能体切换、状态报告
  core_principles:
    - 严格按照协调器指令执行
    - 自动切换智能体
    - 自动报告步骤完成状态
    - 绝不询问用户是否继续
    - 完全自动化执行

commands:
  - help: 显示可用命令
  - start-workflow {workflow-name}: 启动工作流
  - status: 查询当前工作流状态
  - abort: 中止当前工作流

configuration:
  coordinator_url: "http://localhost:3001"
\`\`\`

---

## 工作原理

1. **用户启动**: 用户执行 `*start-workflow requirements-analysis`
2. **调用协调器**: 通过HTTP API请求第一步指令
3. **执行步骤**: 切换智能体,执行命令,生成文档
4. **报告完成**: 调用协调器API报告步骤完成
5. **获取下一步**: 协调器返回下一步指令
6. **自动循环**: 重复步骤3-5直到工作流完成

---

## 命令说明

### *start-workflow {workflow-name}

启动指定的工作流

**示例**:
\`\`\`
*start-workflow requirements-analysis
\`\`\`

**执行流程**:
1. 调用 POST http://localhost:3001/workflow/start
2. 获取第一步指令
3. 自动执行第一步
4. 报告完成并获取下一步
5. 循环执行直到完成

---

### *status

查询当前工作流执行状态

**示例**:
\`\`\`
*status
\`\`\`

---

### *abort

中止当前工作流

**示例**:
\`\`\`
*abort
\`\`\`

---

## 实现细节

### 命令: *start-workflow

当用户执行此命令时,你需要:

\`\`\`javascript
// 1. 调用协调器API启动工作流
const response = await fetch('http://localhost:3001/workflow/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflowId: workflowName,
    context: { projectRoot: process.cwd() }
  })
});

const result = await response.json();

// 2. 获取第一步指令
const firstStep = result.firstStep;

// 3. 执行第一步
await executeStep(firstStep);
\`\`\`

### 执行步骤逻辑

\`\`\`javascript
async function executeStep(stepInstruction) {
  console.log(\`\\n执行步骤: \${stepInstruction.stepId}\`);
  console.log(\`智能体: \${stepInstruction.agent}\`);

  const startTime = Date.now();

  // 1. 切换智能体(如果需要)
  if (stepInstruction.switchCommand) {
    console.log(\`切换到: \${stepInstruction.agent}\`);
    // 这里需要实际的智能体切换
    // 比如: /analyst, /architect, /pm等
  }

  // 2. 执行命令
  console.log(\`执行命令: \${stepInstruction.executeCommand}\`);
  console.log(\`\\n提示词:\\n\${stepInstruction.prompt}\\n\`);

  // 3. 等待智能体执行完成并生成文档
  // (这部分由实际的智能体执行,比如Analyst生成需求分析文档)

  // 4. 收集输出文件信息
  const outputs = stepInstruction.expectedOutputs.map(output => ({
    file: output.file || output,
    exists: fs.existsSync(output.file || output),
    size: fs.existsSync(output.file || output) ? fs.statSync(output.file || output).size : 0
  }));

  // 5. 报告步骤完成
  const completeResponse = await fetch('http://localhost:3001/workflow/step-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowId: 'current',
      stepId: stepInstruction.stepId,
      status: 'success',
      outputs: outputs,
      duration: Date.now() - startTime
    })
  });

  const nextStepResult = await completeResponse.json();

  // 6. 检查是否有下一步
  if (nextStepResult.hasNextStep) {
    console.log(\`\\n进度: \${nextStepResult.progress.percentComplete}%\`);
    console.log(\`→ 自动进入下一步骤...\\n\`);

    // 7. 自动执行下一步(关键:不询问用户!)
    await executeStep(nextStepResult.nextStep);
  } else {
    console.log(\`\\n🎉 工作流执行完成!\`);
    console.log(nextStepResult.message);
  }
}
\`\`\`

---

## 重要提示

1. **完全自动化**: 步骤间绝不询问用户"是否继续"
2. **自动切换智能体**: 根据协调器指令自动切换
3. **自动报告状态**: 每个步骤完成后立即报告
4. **错误处理**: 如果步骤失败,报告给协调器处理

---

祝你工作愉快! 🤖
```

---

## 4. 完整示例

### 4.1 启动协调器

**终端1: 启动协调器**

```bash
cd tools/workflow-coordinator

# 安装依赖(首次)
npm install

# 启动协调器
node src/index.js start requirements-analysis

# 输出:
# 🚀 启动工作流协调器
#
# 📋 解析工作流: requirements-analysis
# ✅ 工作流解析完成: 自动化需求分析和架构设计流程
#    步骤数: 6
#
# 🌐 启动HTTP服务...
# ✅ HTTP服务已启动: http://localhost:3001
#
# ⏳ 等待Claude Code连接...
#
#    提示: 在Claude Code中执行以下命令启动工作流:
#    /workflow-helper
#    *start-workflow requirements-analysis
```

### 4.2 在Claude Code中执行

**终端2: Claude Code**

```bash
# 1. 切换到workflow-helper智能体
/workflow-helper

# 2. 启动工作流
*start-workflow requirements-analysis
```

**预期输出**:

```
工作流助手已激活 🤖

启动工作流: requirements-analysis

📡 调用协调器API...
✅ 连接成功: 自动化需求分析和架构设计流程
   总步骤数: 6

执行步骤: requirements_analysis_and_elicitation
智能体: analyst
切换到: analyst

提示词:
我需要对产品经理提供的需求文档进行深度分析和澄清。

(Analyst智能体执行需求分析,生成文档...)

✅ 步骤完成: requirements_analysis_and_elicitation
   输出: docs/requirements/requirements-analysis.md (25.6 KB)

📡 报告步骤完成...
✅ 协调器响应成功

进度: 16% (1/6)
→ 自动进入下一步骤...

执行步骤: analyze_existing_architecture
智能体: architect
切换到: architect

提示词:
请分析当前项目的后端架构。

(Architect智能体执行架构分析...)

✅ 步骤完成: analyze_existing_architecture
   输出: docs/architecture/current-architecture-analysis.md (18.4 KB)

进度: 33% (2/6)
→ 自动进入下一步骤...

(继续执行剩余步骤...)

🎉 工作流执行完成!

总耗时: 1小时48分钟
完成步骤: 6
生成文档: 10个
```

**协调器端同步输出**:

```
📥 收到启动请求: requirements-analysis
✅ 返回第一步指令: requirements_analysis_and_elicitation

📥 步骤完成: requirements_analysis_and_elicitation
   耗时: 1140秒
   输出: 1个文件
✅ 返回下一步指令: analyze_existing_architecture
   进度: 16% (1/6)

📥 步骤完成: analyze_existing_architecture
   耗时: 900秒
   输出: 1个文件
✅ 返回下一步指令: create_brownfield_prd
   进度: 33% (2/6)

(...)

🎉 工作流执行完成!
```

---

## 5. 测试和调试

### 5.1 测试协调器API

```bash
# 测试启动工作流
curl -X POST http://localhost:3001/workflow/start \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"requirements-analysis","context":{}}'

# 测试步骤完成
curl -X POST http://localhost:3001/workflow/step-complete \
  -H "Content-Type: application/json" \
  -d '{
    "workflowId":"requirements-analysis",
    "stepId":"requirements_analysis_and_elicitation",
    "status":"success",
    "outputs":[{"file":"docs/requirements/requirements-analysis.md","exists":true,"size":25600}],
    "duration":1140000
  }'

# 测试查询状态
curl http://localhost:3001/workflow/status

# 测试健康检查
curl http://localhost:3001/health
```

### 5.2 调试技巧

1. **启用详细日志**:
```javascript
// 在coordinator中添加
console.log(JSON.stringify(stepInstruction, null, 2));
```

2. **查看状态文件**:
```bash
cat .xiaoma-core/.coordinator-state.json | jq
```

3. **模拟步骤执行**:
创建测试脚本模拟Claude Code的请求

---

## 6. package.json配置

```json
{
  "name": "xiaoma-workflow-coordinator",
  "version": "1.0.0",
  "description": "工作流协调器 - 驱动XiaoMa-CLI工作流自动执行",
  "main": "src/index.js",
  "bin": {
    "xiaoma-coordinator": "src/index.js"
  },
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest"
  },
  "keywords": ["workflow", "automation", "coordinator"],
  "author": "XiaoMa Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "js-yaml": "^4.1.0",
    "fs-extra": "^11.1.1",
    "chalk": "^5.3.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  }
}
```

---

## 附录

### A. 常见问题

**Q: 协调器无法连接?**
A: 检查端口3001是否被占用,可以修改环境变量`COORDINATOR_PORT`

**Q: workflow-helper无法调用协调器API?**
A: 确认协调器已启动,检查URL是否正确: http://localhost:3001

**Q: 步骤执行后无法获取输出文件?**
A: 确认智能体已正确生成文档,检查文件路径是否正确

**Q: 如何添加新的工作流?**
A: 在`xiaoma-core/workflows/`目录下创建新的YAML文件即可

---

**文档完成!** 🎉

现在你可以:
1. 按照此指南实现协调器
2. 创建workflow-helper智能体
3. 测试完整的工作流自动执行
