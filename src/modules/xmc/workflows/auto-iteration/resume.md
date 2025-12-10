# 恢复执行工作流

> **工作流 ID**: resume
> **触发命令**: `*resume`
> **智能体**: Phoenix (全自动化迭代开发编排器)

---

## 功能说明

从上次中断的位置恢复执行全自动迭代开发流程。支持：
- 阶段级恢复：从某个阶段重新开始
- 任务级恢复：从某个任务继续执行
- 故事级恢复：从某个故事继续开发

---

## 执行指令

当用户输入 `*resume` 时：

```yaml
task: resume_execution
actions:
  - name: 读取状态文件
    file: "auto-iteration-status.yaml"

  - name: 确定恢复点
    analyze:
      - 最后完成的阶段
      - 当前进行中的任务
      - 上次执行的位置

  - name: 验证恢复条件
    check:
      - 必要文件是否存在
      - 依赖是否满足
      - 知识库是否可用

  - name: 恢复执行
    continue_from: last_checkpoint
```

---

## 恢复场景

### 场景 1: 阶段中断

```yaml
scenario: phase_interrupted
example:
  last_state:
    phase: "phase_3_design"
    status: "in_progress"
    task: "API 设计"

  resume_action:
    - 加载 Phase 3 上下文
    - 从 "API 设计" 任务继续
    - 完成后继续后续任务

  output: |
    ## 恢复执行

    检测到上次执行在 Phase 3 (架构设计) 中断。

    **中断位置**: API 设计
    **已完成任务**: 现有架构分析、技术方案设计、数据模型设计
    **待完成任务**: API 设计、技术决策记录、文件变更清单

    正在从 "API 设计" 任务继续执行...
```

### 场景 2: 故事开发中断

```yaml
scenario: story_development_interrupted
example:
  last_state:
    phase: "phase_4_develop"
    current_story: "STORY-003"
    story_status: "in_progress"
    current_task: "TASK-002"
    tdd_phase: "green"

  resume_action:
    - 加载 STORY-003 上下文
    - 从 TASK-002 的 Green Phase 继续
    - 运行测试验证当前状态
    - 继续实现

  output: |
    ## 恢复执行

    检测到上次执行在 Phase 4 (开发实现) 中断。

    **当前故事**: STORY-003 - 偏好导入
    **当前任务**: TASK-002 - 实现 importService
    **TDD 阶段**: Green (实现代码)

    正在验证当前状态...
    - 测试文件存在: ✅
    - 部分实现存在: ✅
    - 测试状态: 2/5 通过

    正在从 TASK-002 继续实现...
```

### 场景 3: 测试失败后恢复

```yaml
scenario: test_failure_recovery
example:
  last_state:
    phase: "phase_5_test"
    status: "blocked"
    blocking_reason: "3 tests failed"
    failed_tests:
      - "preferenceService.test.ts:45"
      - "preferenceService.test.ts:67"
      - "importController.test.ts:23"

  resume_action:
    - 分析失败测试
    - 查询知识库获取解决方案
    - 返回 Phase 4 修复代码
    - 重新运行测试

  output: |
    ## 恢复执行

    检测到上次执行在 Phase 5 (测试验证) 因测试失败而阻塞。

    **失败测试**:
    1. preferenceService.test.ts:45 - 断言失败
    2. preferenceService.test.ts:67 - 超时
    3. importController.test.ts:23 - 未捕获异常

    **恢复策略**:
    1. 分析失败原因
    2. 返回 Phase 4 修复相关代码
    3. 重新运行测试验证

    正在分析失败原因...
```

---

## 恢复前检查

```yaml
pre_resume_checks:
  - name: 状态文件检查
    check: "auto-iteration-status.yaml 存在且有效"
    if_fail: "无法恢复，请重新开始执行"

  - name: 产出物检查
    check: "已生成的产出物完整"
    if_fail: "部分产出物丢失，需要重新生成"

  - name: 知识库检查
    check: "知识库可访问"
    if_fail: "知识库不可用，部分功能受限"

  - name: 代码库检查
    check: "代码库状态一致"
    if_fail: "检测到代码变更，需要人工确认"
```

---

## 恢复选项

```markdown
## 恢复选项

检测到可以从以下位置恢复：

### 选项 1: 从当前位置继续（推荐）
- **位置**: Phase 4 - STORY-003 - TASK-002
- **描述**: 从上次中断的确切位置继续
- **命令**: `*resume`

### 选项 2: 从阶段开始重新执行
- **位置**: Phase 4 开始
- **描述**: 重新执行整个 Phase 4
- **命令**: `*resume --phase=4`

### 选项 3: 从故事开始重新执行
- **位置**: STORY-003 开始
- **描述**: 重新执行当前故事
- **命令**: `*resume --story=STORY-003`

### 选项 4: 跳过当前任务
- **位置**: STORY-003 - TASK-003
- **描述**: 跳过当前任务，继续下一个
- **命令**: `*resume --skip-task`
- **警告**: 可能导致功能不完整

请选择恢复选项，或直接输入 `*resume` 从当前位置继续。
```

---

## 恢复执行流程

```
┌─────────────────────────────────────────────────────────────┐
│                      恢复执行流程                            │
├─────────────────────────────────────────────────────────────┤
│  1. 读取状态文件                                             │
│     └─ 确定上次执行位置                                      │
├─────────────────────────────────────────────────────────────┤
│  2. 预恢复检查                                               │
│     ├─ 验证产出物完整性                                      │
│     ├─ 验证代码库状态                                        │
│     └─ 验证知识库可用性                                      │
├─────────────────────────────────────────────────────────────┤
│  3. 加载上下文                                               │
│     ├─ 加载阶段上下文                                        │
│     ├─ 加载任务上下文                                        │
│     └─ 加载知识库索引                                        │
├─────────────────────────────────────────────────────────────┤
│  4. 恢复执行                                                 │
│     └─ 从断点继续执行                                        │
├─────────────────────────────────────────────────────────────┤
│  5. 更新状态                                                 │
│     └─ 记录恢复执行信息                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 状态更新

恢复执行时更新状态文件：

```yaml
execution:
  status: "in_progress"
  resumed_at: "[时间戳]"
  resume_count: 1
  resume_from:
    phase: "phase_4_develop"
    story: "STORY-003"
    task: "TASK-002"

resume_history:
  - timestamp: "[时间戳]"
    from_phase: "phase_4_develop"
    from_task: "TASK-002"
    reason: "manual_resume"
```
