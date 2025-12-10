# Phase 1: 自动需求分析

> **工作流 ID**: phase-analyze
> **触发命令**: `*phase-analyze`
> **角色激活**: Analyst (需求分析师)

---

## 阶段目标

将原始需求文档转化为结构化的需求分析报告，通过知识库匹配验证需求的完整性和一致性。

---

## 输入要求

```yaml
inputs:
  required:
    - name: requirement_document
      description: 产品经理提供的迭代需求文档
      format: markdown | text

  optional:
    - name: project_context
      description: 项目上下文文件
      path: "**/project-context.md"

    - name: business_kb
      description: 业务知识库
      path: "knowledge-base/business/"
```

---

## 执行步骤

### Step 1.1: 需求文档解析

**目标**: 从原始需求文档中提取结构化信息

```yaml
task: parse_requirement_document
actions:
  - name: 提取需求标题和概述
    extract:
      - 需求名称
      - 需求背景
      - 需求目标

  - name: 提取功能点
    extract:
      - 功能描述
      - 用户角色
      - 业务场景

  - name: 提取约束条件
    extract:
      - 时间约束
      - 技术约束
      - 业务约束

  - name: 提取验收标准
    extract:
      - 功能验收标准
      - 性能验收标准
```

**输出格式**:

```yaml
parsed_requirement:
  title: "[需求标题]"
  overview: "[需求概述]"

  features:
    - id: "F-001"
      name: "[功能名称]"
      description: "[功能描述]"
      user_role: "[用户角色]"
      scenario: "[业务场景]"

  constraints:
    time: "[时间约束]"
    technical: "[技术约束]"
    business: "[业务约束]"

  acceptance_criteria:
    - "[验收标准 1]"
    - "[验收标准 2]"
```

---

### Step 1.2: 业务知识库匹配

**目标**: 在知识库中查找与需求相关的业务规则

```yaml
task: match_business_knowledge
actions:
  - name: 提取业务关键词
    from: parsed_requirement
    extract: business_keywords

  - name: 查询知识库
    for_each: business_keyword
    query: |
      在业务知识库中查找与 "{keyword}" 相关的：
      - 业务规则
      - 领域模型
      - 业务流程

  - name: 匹配结果分析
    analyze:
      - 已匹配的规则数量
      - 匹配覆盖率
      - 未匹配的关键词
```

**输出格式**:

```yaml
knowledge_matching:
  total_keywords: 15
  matched_keywords: 12
  match_rate: 80%

  matched_rules:
    - keyword: "用户认证"
      rules:
        - id: "BR-001"
          name: "用户认证规则"
          source: "business-rules/auth.md"
          relevance: "high"

  unmatched_keywords:
    - keyword: "新功能X"
      suggestion: "需要创建新业务规则"
```

---

### Step 1.3: 隐含需求识别

**目标**: 基于知识库和上下文推断隐含需求

```yaml
task: identify_implicit_requirements
actions:
  - name: 基于业务规则推断
    logic: |
      如果需求涉及 [业务场景 A]
      且业务规则 [BR-XXX] 要求 [条件 Y]
      则隐含需求包括 [需求 Z]

  - name: 基于技术约束推断
    logic: |
      如果功能涉及 [技术能力 A]
      且技术规范要求 [规范 Y]
      则需要满足 [非功能需求 Z]

  - name: 基于用户场景推断
    logic: |
      如果用户场景包含 [场景 A]
      则需要考虑 [边界条件 B]
      和 [异常处理 C]
```

**输出格式**:

```yaml
implicit_requirements:
  - id: "IR-001"
    type: "business"
    description: "[隐含需求描述]"
    inference_basis: "[推断依据]"
    related_rule: "BR-XXX"
    confidence: "high"

  - id: "IR-002"
    type: "technical"
    description: "[隐含需求描述]"
    inference_basis: "[推断依据]"
    related_spec: "TS-XXX"
    confidence: "medium"
```

---

### Step 1.4: 需求一致性检查

**目标**: 验证需求与现有业务规则的一致性

```yaml
task: consistency_check
actions:
  - name: 检查业务冲突
    check: |
      需求中的业务逻辑是否与现有业务规则冲突？

  - name: 检查技术可行性
    check: |
      需求是否在技术约束范围内可实现？

  - name: 检查完整性
    check: |
      是否所有必要的业务规则都已覆盖？
```

**输出格式**:

```yaml
consistency_check:
  conflicts:
    - type: "business"
      description: "[冲突描述]"
      requirement: "F-001"
      rule: "BR-XXX"
      resolution: "[建议解决方案]"

  feasibility_issues:
    - description: "[可行性问题]"
      constraint: "[相关约束]"
      mitigation: "[缓解措施]"

  completeness:
    coverage_rate: 85%
    missing_areas:
      - "[缺失的业务领域]"
```

---

### Step 1.5: 生成分析报告

**目标**: 输出结构化的需求分析报告

```markdown
# 需求分析报告

## 1. 需求概述

### 1.1 需求标题
[从需求文档提取]

### 1.2 需求背景
[从需求文档提取]

### 1.3 需求目标
[从需求文档提取]

---

## 2. 功能点清单

| ID | 功能点 | 用户角色 | 优先级 | 知识库匹配 |
|----|-------|---------|-------|-----------|
| F-001 | [功能名称] | [角色] | P0 | ✅ BR-001 |
| F-002 | [功能名称] | [角色] | P1 | ✅ BR-002 |

---

## 3. 业务规则匹配

### 3.1 已匹配的业务规则

| 规则 ID | 规则名称 | 关联功能 | 来源 |
|--------|---------|---------|------|
| BR-001 | [规则名称] | F-001 | [文档路径] |

### 3.2 新增业务规则建议

| 建议 ID | 规则描述 | 关联功能 | 原因 |
|--------|---------|---------|------|
| NBR-001 | [规则描述] | F-003 | [原因] |

---

## 4. 隐含需求

### 4.1 业务隐含需求
| ID | 描述 | 推断依据 | 置信度 |
|----|------|---------|-------|
| IR-001 | [描述] | [依据] | 高 |

### 4.2 技术隐含需求
| ID | 描述 | 推断依据 | 置信度 |
|----|------|---------|-------|
| IR-002 | [描述] | [依据] | 中 |

---

## 5. 约束和风险

### 5.1 约束条件
- **时间约束**: [描述]
- **技术约束**: [描述]
- **业务约束**: [描述]

### 5.2 识别的风险
| 风险 ID | 描述 | 影响 | 缓解措施 |
|--------|------|-----|---------|
| R-001 | [描述] | [影响] | [措施] |

---

## 6. 一致性检查结果

### 6.1 业务冲突
[无冲突 / 冲突列表]

### 6.2 可行性评估
[可行 / 问题列表]

### 6.3 完整性评估
- 覆盖率: XX%
- 缺失领域: [列表]

---

## 7. Phase 2 输入准备

### 7.1 结构化功能列表
[为 PRD 创建准备的功能列表]

### 7.2 建议的 NFR
[基于分析建议的非功能需求]

### 7.3 优先级建议
[基于业务价值和依赖关系的优先级建议]
```

---

## 质量门禁

```yaml
quality_gates:
  - name: 功能点识别完整性
    check: "所有需求文档中的功能点都已识别"
    threshold: 100%

  - name: 业务规则匹配率
    check: "功能点与业务规则的匹配率"
    threshold: ">= 70%"
    action_if_fail: "扩大知识库搜索范围"

  - name: 无严重业务冲突
    check: "不存在无法解决的业务冲突"
    threshold: "0 个严重冲突"
    action_if_fail: "标记为需确认，继续执行"

  - name: 分析报告完整性
    check: "分析报告包含所有必要章节"
    threshold: 100%
```

---

## 阻塞处理

```yaml
blocking_handlers:
  - scenario: "业务规则匹配率低于 50%"
    action:
      - 扩大关键词搜索范围
      - 使用同义词和相关词
      - 如仍无法匹配，标记为"需要补充知识库"

  - scenario: "发现严重业务冲突"
    action:
      - 记录冲突详情
      - 尝试从知识库查找解决方案
      - 如无解决方案，标记为"需业务确认"
      - 继续执行其他无依赖任务

  - scenario: "需求文档信息不完整"
    action:
      - 列出缺失信息
      - 尝试从项目上下文推断
      - 如无法推断，使用默认假设并标记
```

---

## 状态更新

阶段完成后更新 `auto-iteration-status.yaml`:

```yaml
phases:
  phase_1_analyze:
    status: "completed"
    started_at: "[时间戳]"
    completed_at: "[时间戳]"
    outputs:
      - "requirement-analysis.md"
    metrics:
      features_identified: 8
      kb_match_rate: 85%
      implicit_requirements: 5
      conflicts_found: 0
      risks_identified: 2
    next_phase: "phase_2_plan"
```
