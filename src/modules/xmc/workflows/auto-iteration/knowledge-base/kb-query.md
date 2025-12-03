# 知识库查询工作流

> **工作流 ID**: kb-query
> **触发命令**: `*kb-query`
> **智能体**: Phoenix (全自动化迭代开发编排器)

---

## 查询机制

知识库查询是全自动迭代开发的核心能力，用于在执行过程中自动获取业务规则和技术规范。

```
┌─────────────────────────────────────────────────────────────┐
│                     知识库查询流程                           │
├─────────────────────────────────────────────────────────────┤
│  1. 接收查询请求                                             │
│     └─ 查询关键词 / 查询问题 / 查询上下文                     │
├─────────────────────────────────────────────────────────────┤
│  2. 关键词提取                                               │
│     └─ 从查询中提取核心关键词                                │
├─────────────────────────────────────────────────────────────┤
│  3. 索引匹配                                                 │
│     ├─ 在 kb-index.yaml 中查找匹配文档                       │
│     └─ 按相关度排序                                         │
├─────────────────────────────────────────────────────────────┤
│  4. 文档读取                                                 │
│     └─ 读取匹配文档的相关内容                                │
├─────────────────────────────────────────────────────────────┤
│  5. 答案提取                                                 │
│     ├─ 从文档中提取与查询相关的答案                          │
│     └─ 格式化为结构化输出                                    │
├─────────────────────────────────────────────────────────────┤
│  6. 返回结果                                                 │
│     ├─ 找到: 返回答案 + 来源引用                             │
│     └─ 未找到: 返回推断答案 + 标记为推断                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 查询类型

### 1. 业务规则查询

```yaml
query_type: business_rule
example_queries:
  - "用户注册需要满足什么条件？"
  - "订单取消的业务规则是什么？"
  - "VIP 用户有哪些特权？"

response_format:
  rule_id: "BR-001"
  rule_name: "用户注册规则"
  rule_content: |
    1. 邮箱必须唯一
    2. 密码长度至少 8 位
    3. 必须同意服务条款
  source: "business-rules/user-management.md"
  confidence: "high"  # high | medium | low | inferred
```

### 2. 技术规范查询

```yaml
query_type: technical_spec
example_queries:
  - "API 响应格式规范是什么？"
  - "数据库字段命名规范？"
  - "错误处理应该怎么做？"

response_format:
  spec_id: "TS-001"
  spec_name: "API 响应格式规范"
  spec_content: |
    所有 API 响应必须包含：
    - code: 状态码
    - message: 消息
    - data: 数据
  code_example: |
    {
      "code": 200,
      "message": "success",
      "data": {}
    }
  source: "api-specs/response-format.md"
  confidence: "high"
```

### 3. 架构模式查询

```yaml
query_type: architecture_pattern
example_queries:
  - "数据访问层应该使用什么模式？"
  - "服务层的设计原则？"
  - "前端状态管理方案？"

response_format:
  pattern_name: "Repository Pattern"
  description: "将数据访问逻辑封装在仓储类中"
  implementation_guide: |
    1. 定义仓储接口
    2. 实现具体仓储类
    3. 通过依赖注入使用
  code_example: |
    interface UserRepository {
      findById(id: string): User;
      save(user: User): void;
    }
  source: "architecture-patterns/repository-pattern.md"
  confidence: "high"
```

### 4. 代码规范查询

```yaml
query_type: coding_standard
example_queries:
  - "变量命名规范？"
  - "函数长度限制？"
  - "注释规范？"

response_format:
  standard_name: "命名规范"
  rules:
    - "变量使用 camelCase"
    - "常量使用 UPPER_SNAKE_CASE"
    - "类名使用 PascalCase"
  examples:
    correct: "const userName = 'John';"
    incorrect: "const user_name = 'John';"
  source: "coding-standards/naming-conventions.md"
  confidence: "high"
```

---

## 自动查询触发

在全自动迭代开发过程中，以下场景会自动触发知识库查询：

### Phase 1 - 需求分析

```yaml
auto_queries:
  - trigger: "解析到业务术语"
    query: "查询术语定义"
    kb_type: "business"

  - trigger: "识别到业务流程"
    query: "查询业务流程规则"
    kb_type: "business"

  - trigger: "发现潜在约束"
    query: "查询相关业务规则"
    kb_type: "business"
```

### Phase 2 - 需求规划

```yaml
auto_queries:
  - trigger: "定义功能需求"
    query: "查询相关业务规则验证需求合理性"
    kb_type: "business"

  - trigger: "定义非功能需求"
    query: "查询技术规范确定 NFR 标准"
    kb_type: "technical"
```

### Phase 3 - 架构设计

```yaml
auto_queries:
  - trigger: "选择技术方案"
    query: "查询推荐的架构模式"
    kb_type: "technical"

  - trigger: "设计数据模型"
    query: "查询数据建模规范"
    kb_type: "technical"

  - trigger: "设计 API"
    query: "查询 API 设计规范"
    kb_type: "technical"
```

### Phase 4 - 开发实现

```yaml
auto_queries:
  - trigger: "编写代码"
    query: "查询代码规范"
    kb_type: "technical"

  - trigger: "实现业务逻辑"
    query: "查询业务规则确保实现正确"
    kb_type: "business"

  - trigger: "编写测试"
    query: "查询测试规范"
    kb_type: "technical"
```

---

## 查询结果处理

### 找到匹配结果

```yaml
result_found:
  action: "使用知识库内容作为决策依据"
  output:
    answer: "[从知识库提取的答案]"
    source: "[来源文档路径]"
    confidence: "high"
    decision_record: |
      决策: [具体决策]
      依据: [知识库来源]
      时间: [时间戳]
```

### 部分匹配结果

```yaml
partial_match:
  action: "使用匹配内容 + 推断补充"
  output:
    answer: "[部分匹配内容 + 推断内容]"
    source: "[来源文档路径]"
    inferred_parts: "[推断的部分]"
    confidence: "medium"
    decision_record: |
      决策: [具体决策]
      依据: [知识库来源] + [推断逻辑]
      时间: [时间戳]
```

### 未找到匹配

```yaml
no_match:
  action: "使用推断或默认值"
  output:
    answer: "[基于上下文推断的答案]"
    inference_basis: "[推断依据]"
    confidence: "low"
    flag: "需要后续验证"
    decision_record: |
      决策: [具体决策]
      依据: 推断 - [推断逻辑]
      标记: 需人工确认
      时间: [时间戳]
```

---

## 手动查询使用

当用户执行 `*kb-query` 时：

```markdown
## 知识库查询

请输入你的查询：

**查询类型**（可选）:
- `business` - 业务知识库
- `technical` - 技术知识库
- `all` - 全部（默认）

**查询内容**:
[在此输入你的问题或关键词]

---

### 查询结果

**查询**: [用户输入的查询]
**类型**: [查询类型]

**结果**:

| 来源 | 相关度 | 内容摘要 |
|-----|-------|---------|
| [文档路径] | 高 | [内容摘要] |

**详细内容**:

[从知识库提取的详细内容]

**知识库引用**:
- 来源: [文档路径]
- 章节: [章节名称]
- 置信度: [高/中/低]
```

---

## 查询优化策略

### 1. 关键词扩展

```yaml
keyword_expansion:
  original: "用户登录"
  expanded:
    - "用户登录"
    - "用户认证"
    - "身份验证"
    - "登录流程"
    - "认证机制"
```

### 2. 上下文关联

```yaml
context_association:
  current_phase: "架构设计"
  current_task: "API 设计"
  related_queries:
    - "API 设计规范"
    - "RESTful 最佳实践"
    - "接口安全规范"
```

### 3. 历史查询学习

```yaml
query_history:
  - query: "用户认证方式"
    result: "found"
    source: "tech-stack/auth.md"
    useful: true

  - query: "JWT 最佳实践"
    result: "not_found"
    fallback: "使用默认 JWT 配置"
    note: "建议添加到知识库"
```

---

## 知识库维护建议

执行过程中会自动记录以下建议：

```yaml
kb_maintenance_suggestions:
  new_entries:
    - topic: "微服务通信模式"
      reason: "多次查询未找到匹配"
      suggested_content: "[推断的内容]"

  updates:
    - document: "api-specs/response-format.md"
      reason: "规范已过时"
      suggested_change: "[建议的更新]"

  missing_coverage:
    - area: "性能优化规范"
      frequency: 5
      priority: "high"
```
