# 工作流协调器使用指南

## 概述

工作流协调器是一个独立的Node.js程序,用于驱动XiaoMa-CLI工作流的完全自动化执行,消除AI决策延迟和人工确认步骤。

### 核心特点

- ✅ **程序化流程控制**:基于YAML定义的确定性执行流程
- ✅ **HTTP API通信**:与Claude Code通过RESTful API交互
- ✅ **质量门控**:自动验证每个步骤的输出文件
- ✅ **状态持久化**:支持从中断点恢复执行
- ✅ **失败重试**:可配置的自动重试机制
- ✅ **实时监控**:彩色日志输出,清晰展示执行进度

## 快速开始

### 1. 安装依赖

```bash
cd tools/workflow-coordinator
npm install
```

### 2. 启动协调器

```bash
# 启动协调器并加载指定工作流
node src/index.js start automated-requirements-analysis

# 或使用环境变量设置端口
COORDINATOR_PORT=3002 node src/index.js start automated-requirements-analysis
```

**输出示例**:
```
╔════════════════════════════════════════╗
║   XiaoMa 工作流协调器   ║
╚════════════════════════════════════════╝

📋 解析工作流: automated-requirements-analysis
✅ 工作流解析完成
   名称: 自动化需求分析和架构设计流程
   步骤数: 7
   类型: automated-requirements-analysis

🌐 启动HTTP服务...
✅ HTTP服务已启动: http://localhost:3001

⏳ 等待Claude Code连接...

提示: 在Claude Code中执行以下命令启动工作流:

  /workflow-helper
  *start-workflow automated-requirements-analysis

按 Ctrl+C 停止协调器
```

### 3. 在Claude Code中启动工作流

在Claude Code命令行中执行:

```
/workflow-helper
*start-workflow automated-requirements-analysis
```

工作流将自动执行,无需人工干预。

## 架构说明

### 组件关系

```
┌─────────────────────────────────────────────────────────────┐
│  工作流协调器 (Workflow Coordinator)                         │
│  - 位置: tools/workflow-coordinator                         │
│  - 端口: http://localhost:3001                              │
│  - 职责: 流程控制、状态管理、质量验证                       │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP API
┌─────────────────────────────────────────────────────────────┐
│  Claude Code + workflow-helper Agent                        │
│  - 智能体: xiaoma-core/agents/workflow-helper.md           │
│  - 职责: 执行命令、生成文档、报告结果                       │
└─────────────────────────────────────────────────────────────┘
```

### 执行流程

1. **启动阶段**:
   - 协调器解析YAML工作流定义
   - 启动HTTP服务器监听API请求
   - workflow-helper发送`/workflow/start`请求
   - 协调器返回第一步执行指令

2. **执行循环**:
   - workflow-helper切换智能体(如`/po`, `/architect`)
   - 执行智能体命令(如`*create-prd`, `*design-architecture`)
   - 生成文档和代码
   - 发送`/workflow/step-complete`报告完成
   - 协调器验证输出质量
   - 返回下一步指令或完成状态

3. **失败处理**:
   - workflow-helper发送`/workflow/step-failed`报告错误
   - 协调器判断是否可以重试
   - 返回重试指令或中止流程

4. **完成阶段**:
   - 所有步骤完成后返回工作流摘要
   - 显示总耗时、生成的文档列表
   - 状态保存到`.xiaoma-core/.coordinator-state.json`

## API 端点

### POST /workflow/start

启动工作流执行。

**请求**:
```json
{
  "workflowId": "automated-requirements-analysis-1699887766123",
  "context": {
    "userRequirement": "用户需求描述"
  }
}
```

**响应**:
```json
{
  "success": true,
  "workflowId": "automated-requirements-analysis-1699887766123",
  "workflowName": "自动化需求分析和架构设计流程",
  "totalSteps": 7,
  "firstStep": {
    "stepId": "需求分析",
    "agent": "po",
    "switchCommand": "/po",
    "executeCommand": "*create-prd",
    "prompt": "基于{{user_requirement}},创建详细的PRD文档...",
    "inputFiles": [],
    "expectedOutputs": ["docs/prd/prd.md"],
    "estimatedDuration": "10-15分钟"
  }
}
```

### POST /workflow/step-complete

报告步骤完成,获取下一步指令。

**请求**:
```json
{
  "workflowId": "automated-requirements-analysis-1699887766123",
  "stepId": "需求分析",
  "status": "completed",
  "outputs": [
    {
      "file": "docs/prd/prd.md",
      "exists": true,
      "size": 15234
    }
  ],
  "duration": 450000
}
```

**响应(有下一步)**:
```json
{
  "success": true,
  "hasNextStep": true,
  "nextStep": {
    "stepId": "架构设计",
    "agent": "architect",
    "switchCommand": "/architect",
    "executeCommand": "*design-architecture",
    ...
  },
  "progress": {
    "currentStepIndex": 2,
    "totalSteps": 7,
    "percentComplete": 29
  }
}
```

**响应(工作流完成)**:
```json
{
  "success": true,
  "hasNextStep": false,
  "message": "🎉 工作流执行完成!",
  "summary": {
    "workflowId": "automated-requirements-analysis-1699887766123",
    "workflowName": "自动化需求分析和架构设计流程",
    "status": "completed",
    "totalDuration": 2730000,
    "totalDurationFormatted": "45分钟30秒",
    "totalSteps": 7,
    "outputs": [
      "docs/prd/prd.md",
      "docs/architecture/architecture.md",
      ...
    ],
    "errors": 0
  }
}
```

**响应(验证失败)**:
```json
{
  "success": false,
  "action": "fix_quality",
  "issues": [
    {
      "level": "error",
      "message": "输出文件不存在: docs/prd/prd.md"
    }
  ],
  "message": "步骤输出质量验证失败,请修复问题后重试"
}
```

### POST /workflow/step-failed

报告步骤失败。

**请求**:
```json
{
  "workflowId": "automated-requirements-analysis-1699887766123",
  "stepId": "架构设计",
  "error": "模板文件未找到",
  "errorDetails": {
    "missingFile": "templates/architecture.md"
  }
}
```

**响应(重试)**:
```json
{
  "success": true,
  "action": "retry",
  "retryCount": 1,
  "maxRetries": 3,
  "retryStep": { ... },
  "message": "将进行第 1 次重试"
}
```

**响应(中止)**:
```json
{
  "success": false,
  "action": "abort",
  "message": "步骤 \"架构设计\" 执行失败,已达最大重试次数",
  "escalation": "需要人工介入:请检查架构模板完整性"
}
```

### GET /workflow/status

查询当前工作流状态。

**响应**:
```json
{
  "workflowId": "automated-requirements-analysis-1699887766123",
  "workflowName": "自动化需求分析和架构设计流程",
  "status": "in_progress",
  "currentStepIndex": 3,
  "totalSteps": 7,
  "completedSteps": ["需求分析", "架构设计"],
  "currentStep": "详细模块设计",
  "errors": 0,
  "startTime": "2023-11-13T10:22:46.123Z"
}
```

### POST /workflow/abort

中止工作流执行。

**请求**:
```json
{
  "workflowId": "automated-requirements-analysis-1699887766123",
  "reason": "用户取消"
}
```

**响应**:
```json
{
  "success": true,
  "message": "工作流已中止,状态已保存"
}
```

### GET /health

健康检查端点。

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-13T15:30:00.000Z"
}
```

## 目录结构

```
tools/workflow-coordinator/
├── src/
│   ├── index.js                  # 主入口,CLI接口
│   ├── api/
│   │   └── server.js             # HTTP服务器,API端点实现
│   ├── controller/
│   │   └── workflow-controller.js # 工作流控制器,核心逻辑
│   ├── parser/
│   │   └── workflow-parser.js    # YAML工作流解析器
│   └── utils/
│       ├── state-manager.js      # 状态持久化管理
│       └── validator.js          # 输出质量验证
├── test/
│   ├── integration-test.js       # 集成测试
│   └── quick-test.js             # 快速测试
├── package.json                  # 项目配置
├── .env.example                  # 环境变量示例
├── README.md                     # 项目说明
└── USAGE.md                      # 使用指南(本文档)
```

## 配置

### 环境变量

创建`.env`文件:

```bash
# 协调器HTTP服务器端口
COORDINATOR_PORT=3001
```

### 工作流定义

工作流定义文件位于`xiaoma-core/workflows/`,使用YAML格式。

**示例**:
```yaml
workflow:
  id: automated-requirements-analysis
  name: "自动化需求分析和架构设计流程"
  type: automated-requirements-analysis

  sequence:
    - step: requirements_analysis
      agent: po
      duration: "10-15分钟"
      detailed_steps:
        - command: "/po"
          description: "切换到产品经理智能体"
        - command: "*create-prd"
          description: "创建PRD文档"
      validation_criteria:
        - file_created: "docs/prd/prd.md"
      on_failure:
        max_retries: 3
        escalation: "请检查PRD模板完整性"

    - step: architecture_design
      agent: architect
      duration: "15-20分钟"
      ...
```

## 测试

### 运行快速测试

```bash
# 先启动协调器
node src/index.js start automated-requirements-analysis

# 在另一个终端运行测试
npm test
# 或
node test/quick-test.js
```

**测试输出示例**:
```
╔════════════════════════════════════════╗
║   工作流协调器快速测试   ║
╚════════════════════════════════════════╝

1. 健康检查...
   ✓ 状态: ok

2. 启动工作流...
   ✓ 工作流: 自动化需求分析和架构设计流程
   - ID: test-1763048289115
   - 总步骤: 7
   - 第一步: pre_workflow_validation

3. 查询初始状态...
   ✓ 状态: in_progress
   - 当前步骤: pre_workflow_validation
   - 进度: 1/7

4. 模拟完成所有步骤...
   步骤 1: pre_workflow_validation
      ✓ 完成 (进度: 14%)
   步骤 2: requirements_analysis_and_elicitation
      ✓ 完成 (进度: 29%)
   ...

╔════════════════════════════════════════╗
║   测试全部通过! ✓   ║
╚════════════════════════════════════════╝
```

### API测试模式

启动简单的测试服务器:

```bash
node src/index.js test-api
```

使用curl测试:

```bash
curl -X POST http://localhost:3001/workflow/start \
  -H "Content-Type: application/json" \
  -d '{"workflowId":"test"}'
```

## 故障排查

### 协调器无法启动

**问题**: 端口被占用

```
Error: listen EADDRINUSE: address already in use :::3001
```

**解决**:
```bash
# 查找占用端口的进程
lsof -i :3001

# 杀死进程
kill -9 <PID>

# 或更换端口
COORDINATOR_PORT=3002 node src/index.js start automated-requirements-analysis
```

### 工作流文件未找到

**问题**:
```
❌ 启动失败
错误: 工作流文件未找到: automated-requirements-analysis
```

**解决**:
- 确认工作流文件存在于`xiaoma-core/workflows/`
- 检查文件名是否正确
- 支持的文件格式: `.yaml`, `.yml`

### 质量验证失败

**问题**:
```
❌ 步骤输出质量验证失败

问题:
- [错误] 输出文件不存在: docs/prd/prd.md
```

**解决**:
- 检查智能体是否正确生成了文件
- 确认文件路径与工作流定义一致
- 查看Claude Code日志了解生成失败原因

### Claude Code连接失败

**问题**: workflow-helper无法连接到协调器

```
❌ 无法连接到协调器
请确认协调器已启动: http://localhost:3001
```

**解决**:
- 确认协调器正在运行
- 检查端口是否正确
- 确认防火墙设置

## 与workflow-executor的对比

| 特性 | workflow-executor (旧) | workflow-helper + Coordinator (新) |
|------|----------------------|-----------------------------------|
| 控制方式 | AI驱动决策 | 程序化流程控制 |
| 人工干预 | 需要确认 | 完全自动化 |
| 执行速度 | 较慢(AI思考时间) | 更快(确定性流程) |
| 可恢复性 | 不支持 | 支持状态持久化 |
| 质量验证 | 依赖AI判断 | 程序化验证规则 |
| 监控能力 | 基础 | 详细日志和进度追踪 |
| 错误处理 | 手动 | 自动重试机制 |

## 最佳实践

1. **先测试后生产**:在测试环境验证工作流定义
2. **保留日志**:协调器日志对问题诊断很有帮助
3. **定期备份状态**:`.xiaoma-core/.coordinator-state.json`文件很重要
4. **合理设置重试次数**:避免无限重试
5. **监控执行时间**:长时间卡住可能表示有问题
6. **验证输出质量**:在工作流定义中添加详细的validation_criteria

## 未来增强

- [ ] 支持并行执行多个步骤
- [ ] 添加Web UI监控面板
- [ ] 集成通知系统(邮件/Slack)
- [ ] 支持工作流版本管理
- [ ] 添加性能指标收集
- [ ] 支持条件分支(if/else)
- [ ] 支持循环步骤(for/while)

## 技术支持

- GitHub Issues: https://github.com/anthropics/xiaoma-cli/issues
- 文档: docs/architecture/workflow-coordinator-implementation.md
- PRD: docs/prd/workflow-coordinator-prd.md
