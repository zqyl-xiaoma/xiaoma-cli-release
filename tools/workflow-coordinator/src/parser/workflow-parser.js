const fs = require('fs-extra');
const yaml = require('js-yaml');
const path = require('path');

class WorkflowParser {
  constructor() {
    // 工作流目录相对于项目根目录
    // 从 tools/workflow-coordinator/src/parser 向上找到项目根目录
    const projectRoot = path.resolve(__dirname, '../../../..');
    this.workflowsDir = path.join(projectRoot, 'xiaoma-core/workflows');
  }

  /**
   * 解析工作流YAML文件
   * @param {string} workflowName - 工作流名称
   * @returns {Promise<Object>} 执行计划
   */
  async parse(workflowName) {
    // 1. 查找工作流文件
    const workflowFile = this.findWorkflowFile(workflowName);

    if (!workflowFile) {
      throw new Error(`工作流文件未找到: ${workflowName}\n查找路径: ${this.workflowsDir}`);
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
        type: workflowDef.workflow.type,
        projectTypes: workflowDef.workflow.project_types || []
      },
      steps: workflowDef.workflow.sequence.map(step => this.parseStep(step)),
      qualityGates: workflowDef.workflow.quality_gates || {},
      errorHandling: workflowDef.workflow.error_handling || {}
    };

    return executionPlan;
  }

  /**
   * 解析单个步骤
   */
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
      onSuccess: stepYaml.on_success,
      onFailure: stepYaml.on_failure
    };
  }

  /**
   * 从步骤定义中提取输出文件列表
   */
  extractOutputs(stepYaml) {
    const outputs = [];

    // 从validation_criteria提取file_created
    if (stepYaml.validation_criteria) {
      stepYaml.validation_criteria.forEach(criterion => {
        if (typeof criterion === 'string' && criterion.includes('file_created:')) {
          const filePath = criterion.split('file_created:')[1].trim().replace(/["']/g, '');
          outputs.push({ file: filePath });
        }
      });
    }

    // 从detailed_steps的output字段提取
    if (stepYaml.detailed_steps) {
      stepYaml.detailed_steps.forEach(detailStep => {
        if (detailStep.output && detailStep.output.file) {
          outputs.push({ file: detailStep.output.file });
        }
        if (detailStep.output_files && Array.isArray(detailStep.output_files)) {
          detailStep.output_files.forEach(file => {
            outputs.push({ file: file });
          });
        }
      });
    }

    return outputs;
  }

  /**
   * 查找工作流文件
   */
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

  /**
   * 验证工作流定义
   */
  validate(workflowDef) {
    if (!workflowDef.workflow) {
      throw new Error('无效的工作流定义: 缺少 workflow 字段');
    }

    if (!workflowDef.workflow.id) {
      throw new Error('无效的工作流定义: 缺少 workflow.id');
    }

    if (!workflowDef.workflow.sequence || !Array.isArray(workflowDef.workflow.sequence)) {
      throw new Error('无效的工作流定义: 缺少 workflow.sequence 或格式错误');
    }

    if (workflowDef.workflow.sequence.length === 0) {
      throw new Error('无效的工作流定义: workflow.sequence 为空');
    }
  }
}

module.exports = WorkflowParser;
