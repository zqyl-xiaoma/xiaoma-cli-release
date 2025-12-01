# 生成知识库查询问题清单任务

## 任务概述

根据需求文档(req.txt)生成结构化的知识库查询问题清单，并保存到项目的 `docs/rag/` 目录下。

## 输入

- **req_file**: 需求文档路径（默认: req.txt）

## 输出

- **输出目录**: `docs/rag/`
- **主文件**: `docs/rag/_questions.md` - 完整的问题清单
- **解析结果**: `docs/rag/_requirement-parsing.yaml` - 需求解析结果

## 执行流程

### 步骤 1: 环境准备

```yaml
执行动作:
  - 检查需求文档是否存在
  - 如果 docs/rag/ 目录不存在，创建该目录
  - 如果目录已存在，询问用户是否覆盖现有文件
```

### 步骤 2: 读取需求文档

```yaml
执行动作:
  - 读取指定的需求文档 {req_file}
  - 如果文件不存在，提示用户并终止
  - 显示文档摘要信息（字数、段落数等）
```

### 步骤 3: 需求文档深度解析

按照 `rag-questions-tmpl.yaml` 模板的第一阶段进行解析，提取以下要素：

```yaml
解析内容:
  业务领域:
    - 主领域识别
    - 子领域/模块识别

  功能点:
    - 功能名称和描述
    - 输入/输出定义
    - 涉及的实体

  用户角色:
    - 角色名称
    - 操作列表
    - 权限级别

  数据实体:
    - 实体名称和属性
    - 实体间关系（一对一/一对多/多对一/多对多）
    - 关联字段

  业务流程:
    - 流程名称和触发条件
    - 步骤详情（序号、名称、执行者、前置步骤、触发条件、输入/输出数据）
    - 异常分支

  技术组件:
    - 组件名称
    - 用途描述

  模糊点:
    - 位置标记
    - 内容描述
    - 可能的理解方式
```

**交互点**: 展示解析结果，请用户确认或补充修正

### 步骤 4: 生成问题清单

基于解析结果，按照 `rag-questions-tmpl.yaml` 模板生成四类问题：

#### A. 业务知识问题
- A1-业务规则详解（P0）
- A2-业务流程详解（P0）- 重点：步骤间关联、节点详情
- A3-数据关联关系详解（P0）- 重点：一对一/一对多/多对多
- A4-边界情况与异常处理（P1）

#### B. 技术知识问题
- B1-整体项目技术架构（P0）
- B2-中间件使用规范（P0）- 要求提供代码Demo
- B3-Java编码规范（P0）
- B4-SQL规范（P0）
- B5-数据模型（P0）
- B6-接口规范（P1）
- B7-代码实现模式（P1）

#### C. 历史追溯问题
- C1-历史需求（P1）
- C2-决策记录（P2）
- C3-已知问题（P1）

#### D. 约束条件问题
- D1-技术约束（P1）
- D2-安全合规（P0）
- D3-性能要求（P1）
- D4-团队规范（P2）

**交互点**: 展示生成的问题清单，请用户确认或调整

### 步骤 5: 问题优先级排序

```yaml
优先级规则:
  P0_阻塞级:
    - 缺失会导致完全无法理解需求
    - 涉及核心业务规则
    - 影响架构决策
    - 涉及安全合规

  P1_重要级:
    - 影响需求完整性
    - 涉及边界情况处理
    - 影响实现方案选择
    - 涉及性能要求

  P2_补充级:
    - 有助于优化实现
    - 提供额外上下文
    - 历史参考信息
```

### 步骤 6: 保存问题清单

将生成的问题清单保存到 `docs/rag/_questions.md`，格式如下：

```markdown
# 知识库查询问题清单

## 元信息
- 源文档: {req_file}
- 生成时间: {timestamp}
- 总问题数: {total_count}
- P0问题: {p0_count} | P1问题: {p1_count} | P2问题: {p2_count}

---

## P0 阻塞级问题（必须回答）

### A. 业务知识

#### 1. [A1-001] {问题标题}
- **关联需求**: "{相关需求描述}"
- **预期答案类型**: {答案类型}
- **子问题**:
  - {子问题1}
  - {子问题2}
  - ...

### B. 技术知识

#### 1. [B1-001] {问题标题}
- **关联需求**: "{相关需求描述}"
- **预期答案类型**: {答案类型}
- **子问题**:
  - {子问题1}
  - {子问题2}
  - ...
- **注意**: 请提供相关代码示例

---

## P1 重要级问题（强烈建议回答）

...

---

## P2 补充级问题（可选回答）

...

---

## 下一步操作指引

完成问题清单生成后，请按以下步骤继续：

1. **查询知识库**: 将上述问题发送给知识库MCP获取答案
2. **知识落地**: 使用 `*land-knowledge` 命令将答案保存到 `docs/rag/` 对应子目录
3. **生成PRD**: 使用 `*create-prd-from-rag` 命令基于知识生成PRD文档
```

### 步骤 7: 保存解析结果

将需求解析结果保存到 `docs/rag/_requirement-parsing.yaml`：

```yaml
# 需求解析结果
# 生成时间: {timestamp}
# 源文档: {req_file}

requirement_parsing:
  business_domain: {domain}
  sub_domains: [{sub_domains}]

  features:
    - name: {feature_name}
      description: {description}
      input: {input}
      output: {output}
      entities: [{entities}]

  roles:
    - name: {role_name}
      actions: [{actions}]
      permission_level: {level}

  entities:
    - name: {entity_name}
      attributes: [{attributes}]
      relationships:
        - target: {target_entity}
          type: {one-to-one|one-to-many|many-to-one|many-to-many}
          field: {field_name}

  processes:
    - name: {process_name}
      trigger: {trigger_condition}
      steps:
        - index: {n}
          name: {step_name}
          actor: {actor}
          previous_step: {prev}
          trigger_from_previous: {condition}
          input_data: {input}
          output_data: {output}
          data_changes: {changes}
      exception_branches: [{branches}]

  tech_components:
    - name: {component}
      purpose: {purpose}

  ambiguities:
    - location: {loc}
      content: {content}
      interpretations: [{interpretations}]
```

### 步骤 8: 生成目录结构

创建后续知识落地所需的目录结构：

```bash
docs/rag/
├── _questions.md              # 问题清单（本任务生成）
├── _requirement-parsing.yaml  # 需求解析结果（本任务生成）
├── _index.md                  # 知识索引（后续生成）
├── business/                  # 业务知识目录
├── technical/                 # 技术知识目录
│   ├── middleware/           # 中间件规范
│   ├── coding-standards/     # 编码规范
│   └── sql-standards/        # SQL规范
├── history/                   # 历史信息目录
└── constraints/               # 约束条件目录
```

### 步骤 9: 完成提示

```yaml
完成输出:
  - 显示生成的文件列表和路径
  - 显示问题统计信息（各类别数量）
  - 提供下一步操作建议
```

---

## 交互模式说明

本任务支持两种模式：

### 交互模式（默认）
- 每个关键步骤后暂停，等待用户确认
- 允许用户调整解析结果和问题清单
- 适合首次使用或复杂需求

### YOLO模式
- 一次性完成所有步骤
- 自动使用默认值
- 适合熟悉流程后快速生成

可通过 `*yolo` 命令切换模式。

---

## 依赖模板

- `rag-questions-tmpl.yaml` - 问题生成模板

## 输出文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 问题清单 | `docs/rag/_questions.md` | 完整的知识库查询问题 |
| 解析结果 | `docs/rag/_requirement-parsing.yaml` | 需求文档解析的结构化结果 |

## 后续命令

- `*land-knowledge` - 将知识库返回的内容结构化存储
- `*create-prd-from-rag` - 基于RAG知识生成PRD
