# PRD: 工作流协调器 (Workflow Coordinator)

> **版本**: 2.0.0
> **作者**: Claude Code
> **日期**: 2025-11-13
> **状态**: Draft
> **修订**: 基于正确的架构理解重新编写

---

## 1. 产品概述

### 1.1 背景

XiaoMa-CLI 当前通过 `workflow-executor` 智能体执行自动化工作流,但存在关键问题:
- AI 会在步骤间暂停询问用户"是否继续"
- 无法实现真正的端到端自动化
- 依赖 AI 判断而非程序逻辑控制流程

### 1.2 产品定位

开发一个**工作流协调器(Workflow Coordinator)**,作为外部进程运行,负责:
- 解析工作流YAML定义
- **监听** Claude Code 中智能体的执行结果
- **决策**下一步应该执行的步骤
- **发送指令**给 Claude Code 让其执行下一步

**关键理念**:
- ✅ Claude Code 负责执行(调用智能体、生成文档)
- ✅ 协调器负责流程控制(监听结果、决策下一步)
- ✅ 两者通过 HTTP API + 文件系统通信

### 1.3 核心价值

- **完全自动化**: 协调器驱动整个流程,无需人工干预
- **职责分离**: Claude Code专注执行,协调器专注控制流
- **可靠性高**: 程序化的流程控制,结果可预测
- **易于扩展**: 支持新增工作流和智能体

---

## 2. 系统架构

### 2.1 整体架构图

```
┌────────────────────────────────────────────────────────────────┐
│                     用户                                        │
│  - 启动工作流: xiaoma-coordinator start requirements-analysis  │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│          工作流协调器 (Workflow Coordinator)                    │
│          - 外部Node.js进程                                      │
│          - HTTP Server (端口3001)                               │
│                                                                 │
│  核心功能:                                                       │
│  1. 解析工作流YAML → 生成执行计划                               │
│  2. 启动HTTP服务,等待Claude Code回调                           │
│  3. 监听步骤完成事件 → 决策下一步                               │
│  4. 通过HTTP API返回下一步指令                                  │
│  5. 状态持久化和恢复                                            │
└────────────┬────────────────────────────┬──────────────────────┘
             │                            │
             │ HTTP API调用               │ 文件系统读写
             │                            │
             ↓                            ↓
┌────────────────────────────────────────────────────────────────┐
│                   Claude Code (IDE环境)                         │
│                                                                 │
│  智能体执行层:                                                   │
│  - /analyst → 需求分析                                          │
│  - /architect → 架构分析/设计                                   │
│  - /pm → PRD创建/Epic拆分                                       │
│  - /po, /sm, /dev, /qa → 用户故事开发                          │
│                                                                 │
│  工作流助手智能体 (新增):                                        │
│  - workflow-helper                                              │
│  - 负责与协调器通信                                             │
│  - 接收协调器指令并执行                                         │
│  - 报告步骤完成状态                                             │
└────────────────────────────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────────────┐
│                      文件系统                                    │
│  - 工作流定义: xiaoma-core/workflows/*.yaml                     │
│  - 输入文档: docs/req.txt                                       │
│  - 输出文档: docs/prd/, docs/epics/, docs/architecture/        │
│  - 协调器状态: .xiaoma-core/.coordinator-state.json            │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 通信协议设计

#### 协议1: HTTP API (主要通信方式)

**协调器提供的API**:

```yaml
API端点设计:

1. POST /workflow/start
   描述: 启动工作流,获取第一步指令
   请求体:
     {
       "workflowId": "requirements-analysis",
       "context": {
         "projectRoot": "/path/to/project"
       }
     }
   响应体:
     {
       "success": true,
       "workflowId": "requirements-analysis",
       "workflowName": "自动化需求分析和架构设计流程",
       "firstStep": {
         "stepId": "requirements_analysis_and_elicitation",
         "agent": "analyst",
         "command": "/analyst",
         "prompt": "执行需求分析...",
         "inputFiles": ["docs/req.txt"],
         "expectedOutputs": ["docs/requirements/requirements-analysis.md"]
       }
     }

2. POST /workflow/step-complete
   描述: 报告步骤完成,获取下一步指令
   请求体:
     {
       "workflowId": "requirements-analysis",
       "stepId": "requirements_analysis_and_elicitation",
       "status": "success",
       "outputs": [
         {
           "file": "docs/requirements/requirements-analysis.md",
           "exists": true,
           "size": 25600
         }
       ],
       "duration": 1200000,  // 毫秒
       "errors": []
     }
   响应体:
     {
       "success": true,
       "hasNextStep": true,
       "nextStep": {
         "stepId": "analyze_existing_architecture",
         "agent": "architect",
         "command": "/architect",
         "prompt": "分析现有架构...",
         "inputFiles": ["src/", "pom.xml"],
         "expectedOutputs": ["docs/architecture/current-architecture-analysis.md"]
       },
       "progress": {
         "currentStepIndex": 2,
         "totalSteps": 6,
         "percentComplete": 33
       }
     }

3. POST /workflow/step-failed
   描述: 报告步骤失败,协调器决策是否重试
   请求体:
     {
       "workflowId": "requirements-analysis",
       "stepId": "create_brownfield_prd",
       "error": "文件写入失败",
       "errorDetails": "..."
     }
   响应体:
     {
       "success": true,
       "action": "retry",  // 或 "abort"
       "retryStep": {
         "stepId": "create_brownfield_prd",
         "agent": "pm",
         "command": "/pm",
         "prompt": "...",
         "retryCount": 1,
         "maxRetries": 3
       }
     }

4. GET /workflow/status
   描述: 查询当前工作流状态
   响应体:
     {
       "workflowId": "requirements-analysis",
       "status": "in_progress",
       "currentStepIndex": 3,
       "totalSteps": 6,
       "completedSteps": ["step1", "step2"],
       "currentStep": "step3",
       "startTime": "2025-11-13T10:00:00Z",
       "duration": 3600000
     }

5. POST /workflow/abort
   描述: 中止当前工作流
   请求体:
     {
       "workflowId": "requirements-analysis",
       "reason": "用户取消"
     }
   响应体:
     {
       "success": true,
       "message": "工作流已中止,状态已保存"
     }
```

#### 协议2: 文件系统 (辅助通信方式)

用于协调器无法实时监听的场景:

```
文件路径约定:

1. 协调器状态文件
   路径: .xiaoma-core/.coordinator-state.json
   用途: 保存工作流执行状态
   格式:
   {
     "workflowId": "requirements-analysis",
     "status": "in_progress",
     "currentStepIndex": 3,
     "completedSteps": [...],
     "nextStep": {...}
   }

2. 步骤执行结果文件
   路径: .xiaoma-core/.step-result-{stepId}.json
   用途: Claude Code写入步骤执行结果
   格式:
   {
     "stepId": "requirements_analysis",
     "status": "success",
     "outputs": [...],
     "duration": 1200000,
     "timestamp": "2025-11-13T10:20:00Z"
   }

3. 下一步指令文件
   路径: .xiaoma-core/.next-instruction.json
   用途: 协调器写入,Claude Code读取
   格式:
   {
     "stepId": "analyze_existing_architecture",
     "agent": "architect",
     "command": "/architect",
     "prompt": "...",
     "inputFiles": [...]
   }
```

---

## 3. 核心功能需求

### 3.1 工作流协调器 (外部进程)

#### F1: 工作流解析和执行计划生成

**功能描述**: 解析工作流YAML,生成完整的执行计划

**输入**:
- 工作流名称(如 `requirements-analysis`)
- 工作流YAML文件路径

**输出**:
- 执行计划对象,包含:
  - 步骤序列
  - 每个步骤的智能体、命令、提示词
  - 输入输出文件
  - 验证标准

**核心逻辑**:
```javascript
class WorkflowCoordinator {
  async parseWorkflow(workflowName) {
    // 1. 加载YAML
    const yamlContent = await fs.readFile(`xiaoma-core/workflows/${workflowName}.yaml`);
    const workflowDef = yaml.parse(yamlContent);

    // 2. 构建执行计划
    const plan = {
      metadata: workflowDef.workflow,
      steps: workflowDef.workflow.sequence.map(step => ({
        id: step.step,
        agent: step.agent,
        detailedSteps: step.detailed_steps,
        requires: step.requires,
        outputs: this.extractOutputs(step),
        validationCriteria: step.validation_criteria
      }))
    };

    return plan;
  }
}
```

---

#### F2: HTTP服务器

**功能描述**: 启动HTTP服务,接收Claude Code的回调请求

**核心接口**:
- `POST /workflow/start` - 启动工作流
- `POST /workflow/step-complete` - 步骤完成
- `POST /workflow/step-failed` - 步骤失败
- `GET /workflow/status` - 查询状态
- `POST /workflow/abort` - 中止工作流

**实现方式**:
```javascript
const express = require('express');

class CoordinatorServer {
  constructor(coordinator) {
    this.app = express();
    this.coordinator = coordinator;
    this.setupRoutes();
  }

  setupRoutes() {
    // 启动工作流
    this.app.post('/workflow/start', async (req, res) => {
      const { workflowId, context } = req.body;
      const result = await this.coordinator.startWorkflow(workflowId, context);
      res.json(result);
    });

    // 步骤完成回调
    this.app.post('/workflow/step-complete', async (req, res) => {
      const { workflowId, stepId, status, outputs } = req.body;
      const nextStep = await this.coordinator.onStepComplete(workflowId, stepId, outputs);
      res.json(nextStep);
    });

    // 其他路由...
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`协调器HTTP服务已启动: http://localhost:${port}`);
    });
  }
}
```

---

#### F3: 步骤流程控制

**功能描述**: 根据当前步骤完成状态,决策下一步执行什么

**核心逻辑**:

```javascript
class WorkflowCoordinator {
  async onStepComplete(workflowId, stepId, outputs) {
    // 1. 加载当前状态
    const state = this.loadState(workflowId);

    // 2. 验证步骤完成质量
    const validationResult = this.validateStepOutputs(stepId, outputs);
    if (!validationResult.passed) {
      // 质量不达标,返回重试指令或修正建议
      return {
        success: false,
        action: 'fix',
        issues: validationResult.issues
      };
    }

    // 3. 更新状态
    state.completedSteps.push({
      stepId: stepId,
      outputs: outputs,
      completedAt: Date.now()
    });
    state.currentStepIndex++;

    // 4. 保存状态
    this.saveState(workflowId, state);

    // 5. 获取下一步
    const nextStepDef = this.executionPlan.steps[state.currentStepIndex];

    if (!nextStepDef) {
      // 工作流完成
      return {
        success: true,
        hasNextStep: false,
        message: '工作流已完成',
        summary: this.generateSummary(state)
      };
    }

    // 6. 构建下一步指令
    const nextStep = this.buildStepInstruction(nextStepDef, state);

    return {
      success: true,
      hasNextStep: true,
      nextStep: nextStep,
      progress: {
        currentStepIndex: state.currentStepIndex,
        totalSteps: this.executionPlan.steps.length,
        percentComplete: Math.round(state.currentStepIndex / this.executionPlan.steps.length * 100)
      }
    };
  }

  buildStepInstruction(stepDef, state) {
    // 从 detailed_steps 中提取执行指令
    const detailedSteps = stepDef.detailedSteps || [];

    // 找到第一个需要执行的命令步骤
    const commandStep = detailedSteps.find(ds =>
      ds.command && (ds.command.startsWith('/') || ds.command.startsWith('*'))
    );

    return {
      stepId: stepDef.id,
      agent: stepDef.agent,
      command: commandStep?.command || `/agent ${stepDef.agent}`,
      prompt: commandStep?.prompt_template || '',
      inputFiles: stepDef.requires || [],
      expectedOutputs: stepDef.outputs || [],
      detailedSteps: detailedSteps  // 完整的详细步骤列表
    };
  }
}
```

---

#### F4: 状态持久化和恢复

**功能描述**: 保存工作流执行状态,支持中断恢复

**状态文件结构**:
```json
{
  "workflowId": "requirements-analysis",
  "workflowName": "自动化需求分析和架构设计流程",
  "status": "in_progress",
  "startTime": "2025-11-13T10:00:00Z",
  "currentStepIndex": 3,
  "completedSteps": [
    {
      "stepId": "requirements_analysis_and_elicitation",
      "agent": "analyst",
      "outputs": ["docs/requirements/requirements-analysis.md"],
      "startTime": "2025-11-13T10:01:00Z",
      "endTime": "2025-11-13T10:20:00Z",
      "duration": 1140000
    },
    {
      "stepId": "analyze_existing_architecture",
      "agent": "architect",
      "outputs": ["docs/architecture/current-architecture-analysis.md"],
      "startTime": "2025-11-13T10:20:00Z",
      "endTime": "2025-11-13T10:35:00Z",
      "duration": 900000
    }
  ],
  "errors": [],
  "retries": {}
}
```

**恢复逻辑**:
```javascript
async resumeWorkflow(workflowId) {
  // 1. 加载状态
  const state = this.loadState(workflowId);

  if (!state) {
    throw new Error('未找到可恢复的工作流状态');
  }

  // 2. 验证已完成步骤的输出文件
  for (const completedStep of state.completedSteps) {
    for (const outputFile of completedStep.outputs) {
      if (!fs.existsSync(outputFile)) {
        throw new Error(`输出文件缺失: ${outputFile}`);
      }
    }
  }

  // 3. 获取下一步指令
  const nextStepDef = this.executionPlan.steps[state.currentStepIndex];
  const nextStep = this.buildStepInstruction(nextStepDef, state);

  return {
    success: true,
    resumeFrom: state.currentStepIndex,
    nextStep: nextStep
  };
}
```

---

#### F5: 质量门控验证

**功能描述**: 验证步骤输出是否符合质量标准

**验证维度**:
1. 文件完整性: 所有声明的输出文件都已生成
2. 文件非空: 文件大小 > 0
3. 格式正确: Markdown/YAML/SQL格式验证

**实现**:
```javascript
validateStepOutputs(stepId, outputs) {
  const stepDef = this.executionPlan.steps.find(s => s.id === stepId);
  const issues = [];

  // 1. 检查所有预期输出文件
  for (const expectedOutput of stepDef.outputs || []) {
    const actualOutput = outputs.find(o => o.file === expectedOutput.file);

    if (!actualOutput) {
      issues.push({
        level: 'error',
        message: `输出文件未生成: ${expectedOutput.file}`
      });
      continue;
    }

    if (!actualOutput.exists) {
      issues.push({
        level: 'error',
        message: `输出文件不存在: ${expectedOutput.file}`
      });
    }

    if (actualOutput.size === 0) {
      issues.push({
        level: 'error',
        message: `输出文件为空: ${expectedOutput.file}`
      });
    }
  }

  // 2. 根据validation_criteria验证
  for (const criterion of stepDef.validationCriteria || []) {
    // 实现具体的验证逻辑
  }

  return {
    passed: issues.filter(i => i.level === 'error').length === 0,
    issues: issues
  };
}
```

---

### 3.2 Claude Code集成层

#### F6: workflow-helper 智能体

**功能描述**: Claude Code中的新智能体,负责与协调器通信

**智能体定义** (`xiaoma-core/agents/workflow-helper.md`):

```yaml
agent:
  name: workflow-helper
  id: workflow-helper
  title: 工作流助手
  role: 与工作流协调器通信,自动执行工作流步骤

persona:
  role: 工作流自动化助手
  focus: 执行协调器下发的指令,报告执行结果
  core_principles:
    - 严格按照协调器指令执行
    - 自动切换智能体
    - 自动报告步骤完成状态
    - 不询问用户,完全自动化

commands:
  - start-workflow {workflow-name}: 启动工作流
  - execute-next-step: 执行下一步(由协调器指示)
  - report-complete: 报告当前步骤完成
  - report-failed: 报告当前步骤失败
  - status: 查询当前工作流状态
```

**核心功能**:

```javascript
// workflow-helper 的执行逻辑

class WorkflowHelper {
  constructor() {
    this.coordinatorURL = 'http://localhost:3001';
  }

  // 命令: *start-workflow requirements-analysis
  async startWorkflow(workflowName) {
    console.log(`启动工作流: ${workflowName}`);

    // 1. 调用协调器API
    const response = await fetch(`${this.coordinatorURL}/workflow/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflowId: workflowName,
        context: {
          projectRoot: process.cwd()
        }
      })
    });

    const result = await response.json();

    if (!result.success) {
      console.error('启动失败:', result.error);
      return;
    }

    console.log(`工作流: ${result.workflowName}`);
    console.log(`总步骤数: ${result.firstStep ? '多步骤' : '未知'}`);

    // 2. 执行第一步
    await this.executeStep(result.firstStep);
  }

  // 执行单个步骤
  async executeStep(stepInstruction) {
    console.log(`\n执行步骤: ${stepInstruction.stepId}`);
    console.log(`智能体: ${stepInstruction.agent}`);
    console.log(`命令: ${stepInstruction.command}`);

    const startTime = Date.now();

    try {
      // 3. 切换智能体(如果需要)
      if (stepInstruction.command.startsWith('/')) {
        console.log(`切换到智能体: ${stepInstruction.agent}`);
        // 在Claude Code中切换智能体
        // (这里需要实际的智能体切换实现)
      }

      // 4. 执行命令和prompt
      console.log(`\n提示词:\n${stepInstruction.prompt}\n`);

      // 这里Claude Code会实际执行智能体命令
      // 比如 Analyst 执行需求分析,生成文档等
      // 执行完成后,需要收集输出文件信息

      // 5. 等待步骤完成(实际由智能体执行)
      // 假设智能体执行完成后,我们能获取到输出信息

      const outputs = this.collectStepOutputs(stepInstruction.expectedOutputs);

      // 6. 报告步骤完成
      await this.reportStepComplete({
        workflowId: stepInstruction.workflowId || 'current',
        stepId: stepInstruction.stepId,
        status: 'success',
        outputs: outputs,
        duration: Date.now() - startTime
      });

    } catch (error) {
      console.error(`步骤执行失败: ${error.message}`);

      // 报告失败
      await this.reportStepFailed({
        workflowId: stepInstruction.workflowId || 'current',
        stepId: stepInstruction.stepId,
        error: error.message
      });
    }
  }

  // 报告步骤完成
  async reportStepComplete(result) {
    console.log(`\n报告步骤完成: ${result.stepId}`);

    const response = await fetch(`${this.coordinatorURL}/workflow/step-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });

    const nextStep = await response.json();

    if (!nextStep.success) {
      console.error('协调器响应失败:', nextStep.error);
      return;
    }

    if (!nextStep.hasNextStep) {
      console.log('\n🎉 工作流执行完成!');
      console.log(nextStep.message);
      return;
    }

    // 自动执行下一步(关键:不询问用户!)
    console.log(`\n进度: ${nextStep.progress.percentComplete}% (${nextStep.progress.currentStepIndex}/${nextStep.progress.totalSteps})`);
    console.log('→ 自动进入下一步骤...\n');

    // 执行下一步
    await this.executeStep(nextStep.nextStep);
  }

  // 收集步骤输出
  collectStepOutputs(expectedOutputs) {
    const outputs = [];

    for (const expected of expectedOutputs) {
      const filePath = expected.file || expected;

      outputs.push({
        file: filePath,
        exists: fs.existsSync(filePath),
        size: fs.existsSync(filePath) ? fs.statSync(filePath).size : 0
      });
    }

    return outputs;
  }
}
```

---

#### F7: MCP工具集成(可选增强)

如果需要更深度的集成,可以开发MCP工具:

```typescript
// mcp-server-workflow-coordinator/index.ts

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({
  name: 'workflow-coordinator',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// 工具1: 启动工作流
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'start_workflow') {
    const { workflowName } = request.params.arguments;

    // 调用协调器API
    const response = await fetch('http://localhost:3001/workflow/start', {
      method: 'POST',
      body: JSON.stringify({ workflowId: workflowName })
    });

    const result = await response.json();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }

  // 工具2: 报告步骤完成
  if (request.params.name === 'report_step_complete') {
    const { stepId, outputs } = request.params.arguments;

    const response = await fetch('http://localhost:3001/workflow/step-complete', {
      method: 'POST',
      body: JSON.stringify({ stepId, outputs })
    });

    const result = await response.json();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
});

// 启动MCP服务器
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 4. 使用流程

### 4.1 完整执行流程

```
用户执行命令:
┌──────────────────────────────────────────────────┐
│ xiaoma-coordinator start requirements-analysis  │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
1. 协调器启动
┌──────────────────────────────────────────────────┐
│ - 解析工作流YAML                                  │
│ - 生成执行计划                                    │
│ - 启动HTTP服务(端口3001)                         │
│ - 等待Claude Code连接                            │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
2. 用户在Claude Code中启动工作流
┌──────────────────────────────────────────────────┐
│ 在Claude Code CLI中执行:                         │
│ /workflow-helper                                 │
│ *start-workflow requirements-analysis            │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
3. workflow-helper调用协调器API
┌──────────────────────────────────────────────────┐
│ POST http://localhost:3001/workflow/start        │
│ 请求体: { workflowId: "requirements-analysis" }  │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
4. 协调器返回第一步指令
┌──────────────────────────────────────────────────┐
│ {                                                 │
│   firstStep: {                                    │
│     stepId: "requirements_analysis",              │
│     agent: "analyst",                             │
│     command: "/analyst",                          │
│     prompt: "执行需求分析..."                     │
│   }                                               │
│ }                                                 │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
5. workflow-helper执行第一步
┌──────────────────────────────────────────────────┐
│ - 切换到 Analyst 智能体                           │
│ - 执行需求分析                                    │
│ - 生成 docs/requirements/requirements-analysis.md│
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
6. workflow-helper报告步骤完成
┌──────────────────────────────────────────────────┐
│ POST http://localhost:3001/workflow/step-complete│
│ 请求体: {                                         │
│   stepId: "requirements_analysis",                │
│   status: "success",                              │
│   outputs: [{ file: "docs/...", exists: true }]  │
│ }                                                 │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
7. 协调器决策下一步
┌──────────────────────────────────────────────────┐
│ - 验证步骤1输出质量                               │
│ - 更新状态                                        │
│ - 返回步骤2指令                                   │
│ {                                                 │
│   nextStep: {                                     │
│     stepId: "analyze_architecture",               │
│     agent: "architect",                           │
│     command: "/architect",                        │
│     prompt: "分析架构..."                         │
│   }                                               │
│ }                                                 │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
8. workflow-helper自动执行步骤2
┌──────────────────────────────────────────────────┐
│ - 不询问用户,直接执行                             │
│ - 切换到 Architect 智能体                         │
│ - 执行架构分析                                    │
│ - 生成架构文档                                    │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
9. 循环执行步骤3-6
┌──────────────────────────────────────────────────┐
│ PM 创建PRD → PM 拆分Epic → Architect 设计架构    │
└──────────────────┬───────────────────────────────┘
                   │
                   ↓
10. 工作流完成
┌──────────────────────────────────────────────────┐
│ 协调器返回: { hasNextStep: false }               │
│ workflow-helper显示: 🎉 工作流执行完成!          │
└──────────────────────────────────────────────────┘
```

### 4.2 用户操作步骤

```bash
# 终端1: 启动协调器
cd tools/workflow-coordinator
node src/index.js start requirements-analysis

# 输出:
# ✅ 工作流解析完成: 自动化需求分析和架构设计流程
# ✅ HTTP服务已启动: http://localhost:3001
# ⏳ 等待Claude Code连接...

# 终端2: Claude Code
# 打开Claude Code,切换到项目目录,执行:
/workflow-helper
*start-workflow requirements-analysis

# 协调器会自动驱动整个流程:
# ✅ 步骤 1/6: Analyst 需求分析 (预计15-25分钟)
# → 自动进入下一步骤...
# ✅ 步骤 2/6: Architect 架构分析 (预计10-20分钟)
# → 自动进入下一步骤...
# ✅ 步骤 3/6: PM 创建 PRD (预计20-30分钟)
# → 自动进入下一步骤...
# ✅ 步骤 4/6: PM 拆分模块 (预计变动)
# → 自动进入下一步骤...
# ✅ 步骤 5/6: Architect 架构设计 (预计30-40分钟)
# → 自动进入下一步骤...
# ✅ 步骤 6/6: 生成完成报告
# 🎉 工作流执行完成!
```

---

## 5. 技术架构

### 5.1 协调器技术栈

**编程语言**: Node.js (JavaScript)

**核心依赖**:
```json
{
  "dependencies": {
    "express": "^4.18.0",        // HTTP服务器
    "js-yaml": "^4.1.0",          // YAML解析
    "fs-extra": "^11.0.0",        // 文件系统增强
    "chalk": "^5.0.0",            // 彩色输出
    "dotenv": "^16.0.0"           // 环境变量
  },
  "devDependencies": {
    "jest": "^29.0.0",            // 测试
    "nodemon": "^3.0.0"           // 开发热重载
  }
}
```

### 5.2 Claude Code集成

**方式1: workflow-helper智能体**
- 新增智能体定义文件
- 使用 fetch API 调用协调器
- 自动切换智能体和执行命令

**方式2: MCP工具(可选)**
- 开发MCP Server
- 提供工具: `start_workflow`, `report_complete`
- Claude Code通过MCP协议调用

---

## 6. 开发计划

### 6.1 阶段1: 协调器MVP (2-3周)

**目标**: 实现基础的协调器功能

**任务**:
1. 工作流YAML解析
2. HTTP服务器和API端点
3. 步骤流程控制逻辑
4. 状态持久化

**验收**:
- ✅ 能解析现有工作流YAML
- ✅ HTTP API正常工作
- ✅ 能正确返回下一步指令

---

### 6.2 阶段2: Claude Code集成 (2-3周)

**目标**: 实现workflow-helper智能体

**任务**:
1. 创建workflow-helper智能体定义
2. 实现HTTP API调用逻辑
3. 实现智能体切换和命令执行
4. 实现步骤结果收集和报告

**验收**:
- ✅ workflow-helper能调用协调器API
- ✅ 能自动切换智能体
- ✅ 能报告步骤完成

---

### 6.3 阶段3: 端到端测试 (1-2周)

**目标**: 完整执行需求分析工作流

**任务**:
1. 端到端集成测试
2. 错误处理和重试机制
3. 质量门控验证
4. 用户体验优化

**验收**:
- ✅ 能完整执行requirements-analysis工作流
- ✅ 全程自动化,无需人工干预
- ✅ 生成所有预期文档

---

### 6.4 阶段4: 增强功能 (1-2周)

**目标**: 添加高级功能

**任务**:
1. MCP集成(可选)
2. 进度监控和可视化
3. 工作流恢复功能
4. 文档和示例

**验收**:
- ✅ 支持中断恢复
- ✅ 实时进度监控
- ✅ 文档完善

---

## 7. 验收标准

### 7.1 核心功能验收

#### 场景1: 完整执行需求分析工作流

**前置条件**:
- 协调器已启动
- Claude Code中workflow-helper已激活
- docs/req.txt文件存在

**执行**:
```bash
# 在Claude Code中:
/workflow-helper
*start-workflow requirements-analysis
```

**预期结果**:
- ✅ 协调器成功启动并返回第一步指令
- ✅ workflow-helper自动执行所有6个步骤
- ✅ 步骤间无需人工确认,自动连续执行
- ✅ 生成所有预期文档:
  - docs/requirements/requirements-analysis.md
  - docs/architecture/current-architecture-analysis.md
  - docs/prd/brownfield-iteration-prd.md
  - docs/epics/Epic-*.md
  - docs/architecture/iteration-backend-design.md
  - docs/architecture/db-migration-scripts.sql
- ✅ 总耗时 ≤ 3小时

---

#### 场景2: 工作流中断恢复

**执行**:
1. 启动工作流
2. 在步骤3完成后手动中止
3. 重新启动: `*resume-workflow`

**预期结果**:
- ✅ 协调器能检测到未完成的工作流
- ✅ 验证已完成步骤的输出完整性
- ✅ 从步骤4继续执行
- ✅ 成功完成剩余步骤

---

#### 场景3: 步骤失败和重试

**执行**:
模拟步骤执行失败(如文件写入失败)

**预期结果**:
- ✅ workflow-helper报告失败
- ✅ 协调器决策重试
- ✅ 自动重试(最多3次)
- ✅ 重试成功后继续下一步

---

### 7.2 非功能验收

- ✅ 协调器启动时间 ≤ 3秒
- ✅ API响应时间 ≤ 100ms
- ✅ 状态保存时间 ≤ 50ms
- ✅ HTTP服务稳定性: 无崩溃
- ✅ 内存占用 ≤ 100MB

---

## 8. 风险和缓解

### 8.1 技术风险

#### 风险1: Claude Code与协调器通信不稳定

**影响**: 步骤完成无法及时报告,工作流阻塞

**缓解措施**:
1. 实现HTTP + 文件系统双通道通信
2. 添加心跳机制
3. 超时自动重试

#### 风险2: 智能体切换失败

**影响**: 无法执行下一步

**缓解措施**:
1. 验证智能体是否存在
2. 提供降级方案(使用当前智能体)
3. 详细的错误日志

---

### 8.2 集成风险

#### 风险3: Claude Code API限制

**影响**: 无法实现某些功能

**缓解措施**:
1. 使用多种通信方式
2. 文件系统作为备用方案
3. 与Claude Code团队沟通

---

## 9. 后续计划

### 9.1 短期(3个月内)

- ✅ 完成协调器MVP
- ✅ 完成Claude Code集成
- ✅ 支持requirements-analysis工作流
- ✅ 支持story-development工作流

### 9.2 中期(6个月内)

- 🔄 支持自定义工作流
- 🔄 可视化进度监控
- 🔄 Web界面管理
- 🔄 多项目并行执行

### 9.3 长期(1年内)

- 🔄 AI驱动的智能协调
- 🔄 工作流模板市场
- 🔄 团队协作功能
- 🔄 云端托管服务

---

## 附录

### A. API完整规范

见第2.2节"通信协议设计"

### B. workflow-helper智能体完整定义

见第3.2节"F6: workflow-helper智能体"

### C. 错误代码表

```
E1001: 工作流文件未找到
E1002: 工作流定义格式错误
E1003: 步骤执行失败
E1004: 输出文件验证失败
E1005: 协调器API调用失败
E1006: 状态文件损坏
E1007: 智能体切换失败
```

---

**文档状态**: Draft
**版本**: 2.0.0
**最后更新**: 2025-11-13
**下次审查**: 待定
