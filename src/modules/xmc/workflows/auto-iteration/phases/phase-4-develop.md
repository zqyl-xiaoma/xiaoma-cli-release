# Phase 4: 自动开发实现

> **工作流 ID**: phase-develop
> **触发命令**: `*phase-develop`
> **角色激活**: SM (Scrum Master) + DEV (开发者)

---

## 阶段目标

基于架构设计文档，自动执行 TDD 驱动的开发实现，包括 Sprint 规划、故事开发、代码审查的完整循环。

---

## 输入要求

```yaml
inputs:
  required:
    - name: architecture
      description: Phase 3 输出的架构设计文档
      path: "architecture.md"

    - name: stories
      description: 用户故事文件
      path: "stories/"

    - name: file_changes
      description: 文件变更清单
      path: "file-changes.csv"

  auto_loaded:
    - name: technical_kb
      description: 技术知识库
      path: "knowledge-base/technical/"

    - name: existing_codebase
      description: 现有代码库
      path: "{project-root}/"

    - name: project_context
      description: 项目上下文
      path: "**/project-context.md"
```

---

## 执行步骤

### Step 4.1: Sprint 规划 (SM 角色)

**目标**: 规划开发顺序和创建 Sprint 状态追踪

```yaml
task: sprint_planning
role: SM
actions:
  - name: 分析故事依赖
    analyze:
      - 技术依赖（基础组件优先）
      - 业务依赖（前置功能优先）
      - 文件依赖（共享文件冲突避免）

  - name: 排序故事
    criteria:
      - 优先级
      - 依赖关系
      - 风险程度

  - name: 创建 Sprint 状态文件
    output: sprint-status.yaml
```

**Sprint 状态文件**:

```yaml
# sprint-status.yaml
sprint:
  name: "Auto-Iteration Sprint"
  started_at: "[时间戳]"
  status: "in_progress"

stories:
  - id: "STORY-001"
    title: "[故事标题]"
    status: "todo"  # todo | in_progress | done
    story_points: 3
    dependencies: []
    assigned_order: 1

  - id: "STORY-002"
    title: "[故事标题]"
    status: "todo"
    story_points: 5
    dependencies: ["STORY-001"]
    assigned_order: 2

progress:
  total_stories: 5
  completed_stories: 0
  total_points: 21
  completed_points: 0
  completion_rate: 0%
```

---

### Step 4.2: 故事开发循环

**对于每个故事，执行以下完整循环**:

```
┌─────────────────────────────────────────────────────────────┐
│                    故事开发循环                              │
├─────────────────────────────────────────────────────────────┤
│  Step 4.2.1: 加载故事上下文                                  │
│  └─ 读取故事文件、架构设计、相关代码                          │
├─────────────────────────────────────────────────────────────┤
│  Step 4.2.2: 任务分解                                       │
│  └─ 将故事分解为可执行的任务和子任务                          │
├─────────────────────────────────────────────────────────────┤
│  Step 4.2.3: TDD 开发 (For Each Task)                       │
│  ├─ 🔴 Red: 编写失败的测试                                  │
│  ├─ 🟢 Green: 实现代码使测试通过                             │
│  └─ 🔵 Refactor: 重构优化代码                               │
├─────────────────────────────────────────────────────────────┤
│  Step 4.2.4: 代码审查                                       │
│  └─ 自动审查代码质量、规范合规性、安全性                      │
├─────────────────────────────────────────────────────────────┤
│  Step 4.2.5: 更新状态                                       │
│  └─ 标记故事完成，更新 sprint-status.yaml                    │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 4.2.1: 加载故事上下文

```yaml
task: load_story_context
actions:
  - name: 读取故事文件
    load:
      - 故事描述
      - 接受标准
      - 技术说明
      - 相关文件

  - name: 读取架构设计
    load:
      - 相关组件设计
      - API 设计
      - 数据模型

  - name: 分析现有代码
    scan:
      - 相关文件的当前内容
      - 依赖关系
      - 接口定义

  - name: 查询知识库
    query:
      - 相关编码规范
      - 实现模式
      - 测试规范
```

**故事上下文格式**:

```xml
<story-context>
  <story id="STORY-001">
    <title>[故事标题]</title>
    <description>[故事描述]</description>

    <acceptance-criteria>
      <criterion id="AC-001">
        <given>[前置条件]</given>
        <when>[用户操作]</when>
        <then>[预期结果]</then>
      </criterion>
    </acceptance-criteria>

    <technical-guidance>
      <architecture-reference>
        [架构设计中的相关部分]
      </architecture-reference>

      <files-to-create>
        <file path="src/services/xxx.ts" type="service"/>
        <file path="tests/services/xxx.test.ts" type="test"/>
      </files-to-create>

      <files-to-modify>
        <file path="src/routes/index.ts" change="添加路由"/>
      </files-to-modify>

      <coding-standards>
        [从知识库获取的编码规范]
      </coding-standards>
    </technical-guidance>
  </story>
</story-context>
```

---

### Step 4.2.2: 任务分解

```yaml
task: decompose_tasks
actions:
  - name: 基于接受标准分解
    for_each: acceptance_criterion
    generate:
      - 测试任务
      - 实现任务

  - name: 基于文件分解
    for_each: file_to_create_or_modify
    generate:
      - 文件创建/修改任务

  - name: 排序任务
    order_by:
      - 依赖关系
      - 测试优先
```

**任务分解格式**:

```yaml
tasks:
  - id: "TASK-001"
    type: "test"
    description: "编写 preferenceService 单元测试"
    file: "tests/services/preferenceService.test.ts"
    acceptance_criterion: "AC-001"
    subtasks:
      - id: "SUBTASK-001-1"
        description: "测试 getPreferences 成功场景"
      - id: "SUBTASK-001-2"
        description: "测试 getPreferences 用户不存在场景"

  - id: "TASK-002"
    type: "implementation"
    description: "实现 preferenceService"
    file: "src/services/preferenceService.ts"
    depends_on: ["TASK-001"]
    subtasks:
      - id: "SUBTASK-002-1"
        description: "实现 getPreferences 方法"
      - id: "SUBTASK-002-2"
        description: "实现 updatePreference 方法"
```

---

### Step 4.2.3: TDD 开发

**对于每个任务，执行 TDD 循环**:

#### 🔴 Red Phase: 编写失败的测试

```yaml
task: write_failing_test
actions:
  - name: 查询测试规范
    query_kb:
      - "单元测试规范"
      - "测试命名规范"
      - "断言规范"

  - name: 生成测试代码
    based_on:
      - 接受标准
      - 编码规范
      - 测试模板

  - name: 运行测试
    expect: "FAIL"
    verify: "测试失败原因是功能未实现"
```

**测试代码模板**:

```typescript
// tests/services/preferenceService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PreferenceService } from '@/services/preferenceService';
import { mockUserRepository, mockPreferenceRepository } from '@/tests/mocks';

describe('PreferenceService', () => {
  let service: PreferenceService;

  beforeEach(() => {
    service = new PreferenceService(
      mockUserRepository,
      mockPreferenceRepository
    );
  });

  describe('getPreferences', () => {
    it('should return user preferences when user exists', async () => {
      // Arrange
      const userId = 'user-123';
      mockUserRepository.findById.mockResolvedValue({ id: userId });
      mockPreferenceRepository.findByUserId.mockResolvedValue([
        { key: 'theme', value: 'dark' }
      ]);

      // Act
      const result = await service.getPreferences(userId);

      // Assert
      expect(result).toEqual([{ key: 'theme', value: 'dark' }]);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getPreferences('invalid-id'))
        .rejects.toThrow('UserNotFoundError');
    });
  });
});
```

#### 🟢 Green Phase: 实现代码

```yaml
task: implement_code
actions:
  - name: 查询实现规范
    query_kb:
      - "编码规范"
      - "架构模式"
      - "错误处理规范"

  - name: 生成实现代码
    based_on:
      - 测试用例
      - 架构设计
      - 编码规范

  - name: 运行测试
    expect: "PASS"
    retry_if_fail: 3
```

**实现代码模板**:

```typescript
// src/services/preferenceService.ts
import { Injectable } from '@/decorators';
import { UserRepository, PreferenceRepository } from '@/repositories';
import { UserNotFoundError } from '@/errors';
import { UserPreference } from '@/types';

@Injectable()
export class PreferenceService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly preferenceRepository: PreferenceRepository
  ) {}

  async getPreferences(userId: string): Promise<UserPreference[]> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }

    return this.preferenceRepository.findByUserId(userId);
  }

  async updatePreference(
    userId: string,
    key: string,
    value: string
  ): Promise<UserPreference> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(`User with id ${userId} not found`);
    }

    return this.preferenceRepository.upsert(userId, key, value);
  }
}
```

#### 🔵 Refactor Phase: 重构优化

```yaml
task: refactor_code
actions:
  - name: 检查代码质量
    checks:
      - 重复代码
      - 过长方法
      - 复杂度

  - name: 应用优化
    optimizations:
      - 提取公共方法
      - 简化逻辑
      - 改进命名

  - name: 运行测试
    expect: "PASS"
    verify: "重构后测试仍然通过"
```

---

### Step 4.2.4: 代码审查

```yaml
task: code_review
actions:
  - name: 功能正确性审查
    checks:
      - 是否满足所有接受标准
      - 边界情况是否处理
      - 异常处理是否完善

  - name: 代码质量审查
    checks:
      - 代码是否清晰可读
      - 命名是否规范
      - 是否有代码重复
      - 是否遵循项目规范

  - name: 安全性审查
    checks:
      - 是否存在注入风险
      - 敏感数据是否正确处理
      - 认证授权是否正确

  - name: 性能审查
    checks:
      - 是否有明显性能问题
      - 数据库查询是否优化
      - 是否有内存泄漏风险

  - name: 测试覆盖审查
    checks:
      - 测试是否充分
      - 是否覆盖边界情况
      - 测试是否可维护
```

**代码审查报告**:

```yaml
code_review:
  story_id: "STORY-001"
  status: "APPROVED"  # APPROVED | CHANGES_REQUESTED
  reviewed_at: "[时间戳]"

  checks:
    functionality:
      status: "PASS"
      comments: []

    code_quality:
      status: "PASS"
      comments:
        - file: "src/services/preferenceService.ts"
          line: 25
          type: "suggestion"
          message: "考虑使用更具描述性的变量名"

    security:
      status: "PASS"
      comments: []

    performance:
      status: "PASS"
      comments: []

    test_coverage:
      status: "PASS"
      coverage: 95%
      comments: []

  summary:
    total_issues: 1
    critical: 0
    major: 0
    minor: 1
    suggestions: 1

  decision: "APPROVED"
  decision_reason: "代码质量良好，所有测试通过，无安全问题"
```

---

### Step 4.2.5: 更新状态

```yaml
task: update_status
actions:
  - name: 标记故事完成
    update:
      story_status: "done"
      completed_at: "[时间戳]"

  - name: 更新 Sprint 进度
    update:
      completed_stories: +1
      completed_points: +story_points
      completion_rate: recalculate

  - name: 记录执行日志
    log:
      - 故事 ID
      - 完成时间
      - 创建的文件
      - 修改的文件
      - 测试结果
      - 审查结果
```

---

## 并行开发策略

当故事之间没有依赖关系时，可以并行开发：

```yaml
parallel_development:
  enabled: true
  max_parallel_stories: 3

  conflict_detection:
    - 文件冲突检测
    - 依赖冲突检测

  merge_strategy:
    - 先完成的故事先合并
    - 检测合并冲突
    - 自动解决简单冲突
    - 复杂冲突按顺序处理
```

---

## 阻塞处理

```yaml
blocking_handlers:
  - scenario: "测试持续失败"
    max_retries: 3
    actions:
      - 分析失败原因
      - 查询知识库获取解决方案
      - 调整实现方式重试
      - 如仍失败，标记为"需人工介入"

  - scenario: "代码审查不通过"
    actions:
      - 自动修复可自动修复的问题
      - 重新提交审查
      - 如仍不通过，记录问题继续执行

  - scenario: "依赖故事未完成"
    actions:
      - 等待依赖故事完成
      - 或跳过执行其他无依赖故事
```

---

## 质量门禁

```yaml
quality_gates:
  per_story:
    - name: 测试全部通过
      threshold: 100%
    - name: 代码审查通过
      threshold: "APPROVED"
    - name: 测试覆盖率
      threshold: ">= 80%"

  sprint_level:
    - name: 所有故事完成
      threshold: 100%
    - name: 无严重问题
      threshold: "0 critical issues"
```

---

## 状态更新

```yaml
phases:
  phase_4_develop:
    status: "completed"
    started_at: "[时间戳]"
    completed_at: "[时间戳]"
    outputs:
      - "sprint-status.yaml"
      - "实现的代码文件"
      - "测试文件"
      - "code-review-reports/"
    metrics:
      stories_completed: 5
      total_points_completed: 21
      files_created: 12
      files_modified: 8
      tests_written: 45
      test_coverage: 87%
      code_review_pass_rate: 100%
    next_phase: "phase_5_test"
```
