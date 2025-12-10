# 知识库接口层

> 本文档定义知识库的访问接口，支持前期 RAG 文件模式和后期 MCP 服务模式的无缝切换。

---

## 接口配置

### 知识库模式配置

在执行全自动迭代开发前，需要配置知识库模式：

```yaml
# auto-iteration-config.yaml
knowledge_base:
  # 模式: rag | mcp
  mode: "rag"

  # RAG 模式配置（前期）
  rag:
    file_path: "{project-root}/docs/rag/rag.md"
    search_strategy: "keyword_match"  # keyword_match | semantic

  # MCP 模式配置（后期）
  mcp:
    server: "knowledge-base-mcp"
    endpoint: "mcp__kb__query"
    timeout: 30000
```

---

## RAG 文件模式（前期实现）

### 数据源

**文件路径**: `{project-root}/docs/rag/rag.md`

### 文件结构要求

RAG 文件必须按以下结构组织，以支持关键词匹配检索：

```markdown
# 知识库 - RAG 文档

## 业务知识

### 业务术语
<!-- KB-TYPE: business_term -->
<!-- KB-KEYWORDS: 术语名1, 术语名2 -->

#### 术语: {术语名}
**定义**: ...
**使用场景**: ...
**相关规则**: ...

### 业务规则
<!-- KB-TYPE: business_rule -->
<!-- KB-KEYWORDS: 关键词1, 关键词2 -->

#### 规则: BR-001 {规则名称}
**描述**: ...
**适用场景**: ...
**规则逻辑**: ...

### 业务流程
<!-- KB-TYPE: business_process -->
<!-- KB-KEYWORDS: 流程名1, 流程名2 -->

#### 流程: {流程名}
**步骤**: ...
**前置条件**: ...
**输出**: ...

---

## 技术知识

### 技术栈规范
<!-- KB-TYPE: tech_spec -->
<!-- KB-KEYWORDS: 前端, 后端, 数据库 -->

### 编码规范
<!-- KB-TYPE: coding_standard -->
<!-- KB-KEYWORDS: 命名, 格式, 注释 -->

### 架构模式
<!-- KB-TYPE: architecture_pattern -->
<!-- KB-KEYWORDS: MVC, Repository, Service -->

### API 规范
<!-- KB-TYPE: api_spec -->
<!-- KB-KEYWORDS: RESTful, 响应格式, 错误码 -->

### 测试规范
<!-- KB-TYPE: testing_standard -->
<!-- KB-KEYWORDS: 单元测试, 集成测试, 覆盖率 -->
```

### RAG 查询执行流程

```yaml
rag_query_flow:
  step_1_load_file:
    action: "读取 docs/rag/rag.md 文件内容"

  step_2_extract_keywords:
    action: "从查询问题中提取关键词"
    example:
      query: "请查询用户认证相关的业务规则"
      keywords: ["用户", "认证", "业务规则"]

  step_3_match_sections:
    action: "在 RAG 文件中查找匹配的章节"
    logic: |
      1. 查找包含 KB-KEYWORDS 匹配的章节
      2. 查找标题或内容包含关键词的章节
      3. 按匹配度排序

  step_4_extract_content:
    action: "提取匹配章节的完整内容"

  step_5_format_response:
    action: "格式化为标准响应格式"
```

### RAG 查询指令

在工作流中，使用以下格式调用 RAG 查询：

```markdown
## 知识库查询

**调用点**: KBC-1.2 (业务规则验证)

**查询问题**:
```
请查询与以下功能相关的业务规则：
- 功能描述: 用户偏好设置
- 涉及实体: User, UserPreference
- 业务场景: 用户修改个人偏好
```

**执行动作**:
1. 读取 `{project-root}/docs/rag/rag.md`
2. 提取关键词: ["用户", "偏好", "设置", "业务规则"]
3. 在文件中搜索匹配内容
4. 返回匹配结果

**查询结果**:
[从 RAG 文件中提取的相关内容]

**来源**: docs/rag/rag.md#业务规则-用户偏好
**匹配度**: 高/中/低
```

---

## MCP 服务模式（后期实现）

### MCP 服务调用格式

当 MCP 知识库服务上线后，查询将通过 MCP 调用：

```yaml
mcp_call:
  service: "knowledge-base-mcp"
  method: "query"
  parameters:
    question: "{查询问题}"
    context:
      phase: "{当前阶段}"
      call_point: "{调用点 ID}"
      keywords: ["{关键词列表}"]
    options:
      knowledge_type: "business" | "technical" | "all"
      max_results: 5
      include_related: true
```

### MCP 响应格式

```yaml
mcp_response:
  success: true
  data:
    answer: "知识库返回的答案内容"
    sources:
      - document: "业务规则文档"
        section: "用户偏好规则"
        confidence: 0.95
        content: "具体内容..."
    related_topics:
      - topic: "用户权限管理"
        relevance: 0.8
    suggestions:
      - "可能还需要查询用户权限规则"
  metadata:
    query_time: "120ms"
    knowledge_version: "2024-01-15"
```

### MCP 查询指令

```markdown
## 知识库查询 (MCP)

**调用点**: KBC-1.2 (业务规则验证)

**MCP 调用**:
```
mcp__kb__query({
  question: "请查询与用户偏好设置相关的业务规则",
  context: {
    phase: "phase_1_analyze",
    call_point: "KBC-1.2",
    keywords: ["用户", "偏好", "设置"]
  },
  options: {
    knowledge_type: "business",
    max_results: 5
  }
})
```

**等待 MCP 响应...**

**响应结果**:
[MCP 服务返回的结果]
```

---

## 统一查询接口

无论使用 RAG 模式还是 MCP 模式，工作流中的查询接口保持一致：

### 查询请求格式

```yaml
kb_query_request:
  call_point: "KBC-X.X"           # 调用点 ID
  question: "查询问题"             # 完整的查询问题
  context:
    phase: "phase_X"              # 当前阶段
    task: "当前任务"
    related_content: "相关上下文"
  knowledge_type: "business|technical|all"
  required: true|false            # 是否必须找到答案
```

### 查询响应格式

```yaml
kb_query_response:
  status: "found|not_found|partial"
  answer: "答案内容"
  sources:
    - source: "来源文档/章节"
      confidence: "high|medium|low"
  fallback_used: true|false       # 是否使用了回退策略
  decision_basis: "决策依据说明"
```

---

## 回退策略

当知识库查询未找到匹配内容时，按以下策略处理：

```yaml
fallback_strategy:
  level_1_expand_search:
    description: "扩大搜索范围"
    actions:
      - 使用同义词搜索
      - 扩大关键词范围
      - 搜索相关主题

  level_2_infer:
    description: "基于上下文推断"
    actions:
      - 从相似知识推断
      - 从通用最佳实践推断
      - 标记为"推断结果"

  level_3_default:
    description: "使用默认值"
    actions:
      - 使用行业标准默认值
      - 使用保守的实现方式
      - 标记为"待确认"

  level_4_flag:
    description: "标记为需人工确认"
    condition: "required = true 且前三级都未解决"
    actions:
      - 记录详细的查询信息
      - 继续执行其他任务
      - 在最终报告中列出待确认项
```

---

## 查询日志

所有知识库查询都会记录到执行日志：

```yaml
kb_query_log:
  - id: "Q-001"
    timestamp: "2024-01-15T10:15:30Z"
    call_point: "KBC-1.2"
    phase: "phase_1_analyze"
    question: "查询问题..."
    keywords: ["关键词1", "关键词2"]
    mode: "rag"  # rag | mcp
    result:
      status: "found"
      sources: ["docs/rag/rag.md#section"]
      confidence: "high"
    decision: "基于查询结果，决定..."
    duration_ms: 150
```

---

## 模式切换

从 RAG 模式切换到 MCP 模式只需修改配置：

```yaml
# 切换前 (RAG 模式)
knowledge_base:
  mode: "rag"
  rag:
    file_path: "{project-root}/docs/rag/rag.md"

# 切换后 (MCP 模式)
knowledge_base:
  mode: "mcp"
  mcp:
    server: "knowledge-base-mcp"
    endpoint: "mcp__kb__query"
```

工作流代码无需修改，查询接口自动适配。
