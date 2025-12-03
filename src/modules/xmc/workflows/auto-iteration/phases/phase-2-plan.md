# Phase 2: 自动需求规划

> **工作流 ID**: phase-plan
> **触发命令**: `*phase-plan`
> **角色激活**: PM (产品经理) + PO (产品负责人)

---

## 阶段目标

基于需求分析报告，自动创建完整的 PRD 文档、史诗和用户故事，为后续架构设计和开发实现提供完整的需求规格。

---

## 输入要求

```yaml
inputs:
  required:
    - name: requirement_analysis
      description: Phase 1 输出的需求分析报告
      path: "requirement-analysis.md"

  auto_loaded:
    - name: business_kb
      description: 业务知识库
      path: "knowledge-base/business/"

    - name: project_context
      description: 项目上下文
      path: "**/project-context.md"
```

---

## 执行步骤

### Step 2.1: PRD 框架生成

**目标**: 创建 PRD 文档的基础结构

```yaml
task: generate_prd_framework
actions:
  - name: 提取产品信息
    from: requirement_analysis
    extract:
      - product_name
      - product_vision
      - target_users
      - success_metrics

  - name: 查询知识库
    queries:
      - "产品目标定义规范"
      - "成功指标设定标准"
      - "用户角色定义模板"

  - name: 生成 PRD 框架
    template: prd_template
```

---

### Step 2.2: 功能需求定义 (FRs)

**目标**: 将功能点转化为标准的功能需求

```yaml
task: define_functional_requirements
actions:
  - name: 遍历功能点
    for_each: feature in requirement_analysis.features
    do:
      - name: 生成 FR 描述
        template: |
          ### FR-{id}: {name}

          **描述**: {description}

          **用户故事**:
          As a {user_role},
          I want {action},
          So that {benefit}.

          **接受标准**:
          - Given {precondition}
          - When {action}
          - Then {expected_result}

          **优先级**: {priority}

          **知识库依据**: {kb_reference}

      - name: 验证业务规则一致性
        query_kb: "验证 FR 与业务规则一致"

      - name: 定义边界条件
        infer_from: knowledge_base + context
```

**FR 定义模板**:

```yaml
functional_requirement:
  id: "FR-001"
  name: "[功能名称]"
  description: "[详细描述]"

  user_story:
    role: "[用户角色]"
    want: "[期望的功能]"
    benefit: "[获得的价值]"

  acceptance_criteria:
    - given: "[前置条件]"
      when: "[用户操作]"
      then: "[预期结果]"

  priority: "P0|P1|P2"
  complexity: "Low|Medium|High"

  kb_references:
    - rule_id: "BR-XXX"
      source: "[来源文档]"

  dependencies:
    - "FR-002"

  out_of_scope:
    - "[明确排除的内容]"
```

---

### Step 2.3: 非功能需求定义 (NFRs)

**目标**: 定义性能、安全、可用性等非功能需求

```yaml
task: define_non_functional_requirements
actions:
  - name: 查询技术规范
    queries:
      - "性能要求标准"
      - "安全要求规范"
      - "可用性标准"
      - "可维护性要求"

  - name: 基于功能推断 NFR
    logic: |
      如果 FR 涉及 [用户登录]
      则需要 [安全 NFR: 密码加密、会话管理]

      如果 FR 涉及 [数据展示]
      则需要 [性能 NFR: 响应时间 < 2s]

  - name: 生成 NFR 列表
    categories:
      - performance
      - security
      - usability
      - reliability
      - maintainability
```

**NFR 定义模板**:

```yaml
non_functional_requirements:
  performance:
    - id: "NFR-PERF-001"
      name: "页面响应时间"
      requirement: "所有页面加载时间 < 2 秒"
      measurement: "使用性能监控工具测量"
      kb_reference: "tech-kb/performance-standards.md"

  security:
    - id: "NFR-SEC-001"
      name: "数据加密"
      requirement: "所有敏感数据传输使用 HTTPS"
      compliance: "OWASP Top 10"
      kb_reference: "tech-kb/security-standards.md"

  usability:
    - id: "NFR-USA-001"
      name: "响应式设计"
      requirement: "支持桌面和移动端访问"
      kb_reference: "tech-kb/ux-standards.md"

  reliability:
    - id: "NFR-REL-001"
      name: "系统可用性"
      requirement: "可用性 >= 99.9%"
      kb_reference: "tech-kb/sla-standards.md"
```

---

### Step 2.4: 史诗创建

**目标**: 将功能需求按模块组织为史诗

```yaml
task: create_epics
actions:
  - name: 功能分组
    logic: |
      基于以下维度将 FR 分组为 Epic:
      - 功能模块相似性
      - 用户旅程阶段
      - 技术组件依赖

  - name: 定义史诗
    for_each: group
    do:
      - 命名史诗
      - 描述业务价值
      - 计算故事点总和
      - 确定依赖关系

  - name: 排序史诗
    criteria:
      - 业务优先级
      - 技术依赖
      - 风险程度
```

**史诗模板**:

```yaml
epic:
  id: "EPIC-001"
  name: "[史诗名称]"
  description: "[史诗描述]"

  business_value: |
    [这个史诗为业务带来的价值]

  functional_requirements:
    - "FR-001"
    - "FR-002"
    - "FR-003"

  total_story_points: 21
  priority: 1

  dependencies:
    predecessors: []
    successors: ["EPIC-002"]

  risks:
    - "[风险描述]"

  success_criteria:
    - "[成功标准]"
```

---

### Step 2.5: 用户故事分解

**目标**: 将史诗分解为可实现的用户故事

```yaml
task: decompose_stories
actions:
  - name: 应用 INVEST 原则
    criteria:
      I: "Independent - 故事相互独立"
      N: "Negotiable - 可协商细节"
      V: "Valuable - 有业务价值"
      E: "Estimable - 可估算"
      S: "Small - 足够小（1-3天完成）"
      T: "Testable - 可测试"

  - name: 分解 FR 为故事
    for_each: fr in epic.functional_requirements
    do:
      - 按用户操作步骤分解
      - 按数据流程分解
      - 按异常处理分解

  - name: 定义接受标准
    format: "Given-When-Then"

  - name: 估算故事点
    scale: [1, 2, 3, 5, 8]
```

**用户故事模板**:

```yaml
story:
  id: "STORY-001"
  epic_id: "EPIC-001"
  title: "[故事标题]"

  user_story: |
    As a [用户角色],
    I want [功能/操作],
    So that [获得的价值].

  description: |
    [详细描述]

  acceptance_criteria:
    - id: "AC-001"
      given: "[前置条件]"
      when: "[用户操作]"
      then: "[预期结果]"

  story_points: 3
  priority: "P0|P1|P2"

  technical_notes: |
    [技术实现提示]

  dependencies:
    - "STORY-002"

  related_files:
    - "[可能涉及的文件路径]"

  kb_references:
    - "[相关知识库文档]"
```

---

### Step 2.6: PO 验收标准审核

**目标**: 以 PO 视角验证需求的业务价值

```yaml
task: po_review
actions:
  - name: 业务价值验证
    check: |
      每个史诗和故事是否有明确的业务价值？
      价值描述是否可量化？

  - name: 优先级合理性
    check: |
      优先级排序是否符合业务需求？
      高优先级项是否确实最重要？

  - name: 接受标准完整性
    check: |
      每个故事是否有明确的接受标准？
      接受标准是否可验证？

  - name: 范围边界清晰
    check: |
      是否明确了不在范围内的内容？
      是否存在范围蔓延风险？
```

---

### Step 2.7: 生成 PRD 文档

**输出完整的 PRD 文档**:

```markdown
# 产品需求文档 (PRD)

## 文档信息
- **版本**: 1.0
- **创建日期**: [日期]
- **状态**: 已审核
- **知识库版本**: [版本号]

---

## 1. 产品概述

### 1.1 产品背景
[从需求分析报告提取]

### 1.2 产品目标
[从需求分析报告提取]

### 1.3 目标用户
| 用户角色 | 描述 | 主要需求 |
|---------|------|---------|

### 1.4 成功指标
| 指标 | 目标值 | 测量方式 |
|-----|-------|---------|

---

## 2. 功能需求 (FRs)

### FR-001: [功能名称]

**描述**: [详细描述]

**用户故事**:
> As a [角色], I want [功能], So that [价值].

**接受标准**:
| AC ID | Given | When | Then |
|-------|-------|------|------|
| AC-001 | [条件] | [操作] | [结果] |

**优先级**: P0
**知识库依据**: BR-001, BR-002

---

[更多 FR...]

---

## 3. 非功能需求 (NFRs)

### 3.1 性能需求
| NFR ID | 需求 | 标准 | 测量方式 |
|--------|-----|-----|---------|

### 3.2 安全需求
| NFR ID | 需求 | 标准 | 合规要求 |
|--------|-----|-----|---------|

### 3.3 可用性需求
| NFR ID | 需求 | 标准 |
|--------|-----|-----|

---

## 4. 史诗和故事概览

### 4.1 史诗列表
| Epic ID | 名称 | 故事数 | 总点数 | 优先级 |
|---------|-----|-------|-------|-------|

### 4.2 依赖关系图
```mermaid
graph LR
    EPIC-001 --> EPIC-002
    EPIC-002 --> EPIC-003
```

---

## 5. 约束和假设

### 5.1 约束条件
- [约束 1]
- [约束 2]

### 5.2 假设
- [假设 1]
- [假设 2]

---

## 6. 风险和缓解

| 风险 ID | 描述 | 影响 | 概率 | 缓解措施 |
|--------|------|-----|-----|---------|

---

## 7. 附录

### 7.1 术语表
| 术语 | 定义 |
|-----|-----|

### 7.2 知识库引用
| 引用 ID | 文档 | 章节 |
|--------|-----|-----|
```

---

## 质量门禁

```yaml
quality_gates:
  - name: PRD 完整性
    check: "PRD 包含所有必要章节"
    threshold: 100%

  - name: FR 覆盖率
    check: "所有功能点都已转化为 FR"
    threshold: 100%

  - name: 接受标准完整性
    check: "每个 FR 都有至少一个接受标准"
    threshold: 100%

  - name: 故事分解合理性
    check: "每个故事点数 <= 8"
    threshold: 100%

  - name: INVEST 原则符合度
    check: "所有故事符合 INVEST 原则"
    threshold: ">= 90%"
```

---

## 阻塞处理

```yaml
blocking_handlers:
  - scenario: "无法确定优先级"
    action:
      - 查询知识库获取优先级规则
      - 基于业务价值和技术依赖推断
      - 如仍无法确定，使用默认优先级 P1

  - scenario: "接受标准定义困难"
    action:
      - 查询知识库获取类似功能的接受标准
      - 基于功能描述推断
      - 标记为"需细化"

  - scenario: "故事点估算困难"
    action:
      - 与类似历史故事对比
      - 使用中位数估算（3点）
      - 标记为"需重新估算"
```

---

## 输出文件

```yaml
outputs:
  - file: "prd.md"
    description: "完整的 PRD 文档"

  - directory: "epics/"
    files:
      - "epic-001.md"
      - "epic-002.md"

  - directory: "stories/"
    files:
      - "story-001.md"
      - "story-002.md"

  - file: "requirement-traceability.csv"
    description: "需求追溯矩阵"
```

---

## 状态更新

```yaml
phases:
  phase_2_plan:
    status: "completed"
    started_at: "[时间戳]"
    completed_at: "[时间戳]"
    outputs:
      - "prd.md"
      - "epics/"
      - "stories/"
    metrics:
      total_frs: 12
      total_nfrs: 8
      total_epics: 3
      total_stories: 15
      total_story_points: 45
    next_phase: "phase_3_design"
```
