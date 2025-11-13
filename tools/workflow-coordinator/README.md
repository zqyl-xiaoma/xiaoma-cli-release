# XiaoMa 工作流协调器

工作流协调器是一个外部进程,负责驱动Claude Code中的工作流自动执行。

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动协调器
npm start start requirements-analysis

# 3. 在Claude Code中执行
# /workflow-helper
# *start-workflow requirements-analysis
```

## 架构

```
协调器 (Node.js进程)
    ↕️  HTTP API
Claude Code (执行智能体)
```

## 功能

- ✅ 解析工作流YAML定义
- ✅ HTTP服务器接收Claude Code回调
- ✅ 步骤流程控制和决策
- ✅ 状态持久化和恢复
- ✅ 质量门控验证

## 相关文档

- [PRD文档](../../docs/prd/workflow-coordinator-prd.md)
- [实现指南](../../docs/architecture/workflow-coordinator-implementation.md)
