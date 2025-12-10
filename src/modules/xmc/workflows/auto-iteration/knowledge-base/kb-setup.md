# 知识库配置工作流

> **工作流 ID**: kb-setup
> **触发命令**: `*kb-setup`
> **智能体**: Phoenix (全自动化迭代开发编排器)

---

## 知识库架构

全自动迭代开发依赖两类知识库来驱动决策：

```
知识库架构
├── 📚 业务知识库 (Business Knowledge Base)
│   ├── 业务规则 (business-rules/)
│   ├── 领域模型 (domain-models/)
│   ├── 业务流程 (business-processes/)
│   └── 术语表 (glossary/)
│
└── 🔧 技术知识库 (Technical Knowledge Base)
    ├── 代码规范 (coding-standards/)
    ├── 架构模式 (architecture-patterns/)
    ├── 技术栈文档 (tech-stack/)
    ├── API 规范 (api-specs/)
    └── 测试规范 (testing-standards/)
```

---

## 知识库配置

### 方式一：使用 project-context.md（推荐）

在项目根目录创建或更新 `project-context.md`：

```markdown
# Project Context

## 知识库配置

### 业务知识库
路径: ./docs/knowledge-base/business/
索引文件: ./docs/knowledge-base/business/index.md

### 技术知识库
路径: ./docs/knowledge-base/technical/
索引文件: ./docs/knowledge-base/technical/index.md

### 项目特定规范
路径: ./docs/project-standards/
```

### 方式二：使用配置文件

创建 `auto-iteration-config.yaml`：

```yaml
# auto-iteration-config.yaml
knowledge_base:
  business:
    path: "./docs/knowledge-base/business/"
    index: "./docs/knowledge-base/business/index.md"
    patterns:
      - "**/*.md"
      - "**/*.yaml"

  technical:
    path: "./docs/knowledge-base/technical/"
    index: "./docs/knowledge-base/technical/index.md"
    patterns:
      - "**/*.md"
      - "**/*.yaml"

  project:
    path: "./docs/project-standards/"
    patterns:
      - "**/*.md"

search:
  max_results: 10
  similarity_threshold: 0.7
  fallback_to_inference: true
```

---

## 知识库目录结构模板

### 业务知识库结构

```
docs/knowledge-base/business/
├── index.md                    # 业务知识库索引
├── business-rules/
│   ├── index.md               # 业务规则索引
│   ├── user-management.md     # 用户管理规则
│   ├── order-processing.md    # 订单处理规则
│   └── payment-rules.md       # 支付规则
├── domain-models/
│   ├── index.md               # 领域模型索引
│   ├── user-model.md          # 用户领域模型
│   └── order-model.md         # 订单领域模型
├── business-processes/
│   ├── index.md               # 业务流程索引
│   └── checkout-flow.md       # 结账流程
└── glossary/
    └── terms.md               # 业务术语表
```

### 技术知识库结构

```
docs/knowledge-base/technical/
├── index.md                    # 技术知识库索引
├── coding-standards/
│   ├── index.md               # 编码规范索引
│   ├── naming-conventions.md  # 命名规范
│   ├── code-style.md          # 代码风格
│   └── error-handling.md      # 错误处理规范
├── architecture-patterns/
│   ├── index.md               # 架构模式索引
│   ├── mvc-pattern.md         # MVC 模式
│   ├── repository-pattern.md  # 仓储模式
│   └── service-layer.md       # 服务层模式
├── tech-stack/
│   ├── index.md               # 技术栈索引
│   ├── frontend-stack.md      # 前端技术栈
│   ├── backend-stack.md       # 后端技术栈
│   └── database.md            # 数据库技术
├── api-specs/
│   ├── index.md               # API 规范索引
│   ├── rest-conventions.md    # RESTful 规范
│   └── response-format.md     # 响应格式规范
└── testing-standards/
    ├── index.md               # 测试规范索引
    ├── unit-testing.md        # 单元测试规范
    └── integration-testing.md # 集成测试规范
```

---

## 知识库文档模板

### 业务规则文档模板

```markdown
# [业务规则名称]

## 规则 ID
BR-001

## 规则描述
[详细描述业务规则]

## 适用场景
- 场景 1
- 场景 2

## 规则逻辑
```
IF [条件]
THEN [结果]
ELSE [替代结果]
```

## 示例
### 示例 1: [场景名称]
- **输入**: [输入数据]
- **预期输出**: [输出数据]

## 例外情况
- 例外 1: [描述]

## 相关规则
- BR-002: [相关规则名称]

## 变更历史
| 日期 | 版本 | 变更内容 | 作者 |
|------|------|---------|------|
```

### 技术规范文档模板

```markdown
# [技术规范名称]

## 规范 ID
TS-001

## 规范描述
[详细描述技术规范]

## 适用范围
- 适用于: [描述]
- 不适用于: [描述]

## 规范内容

### 1. [规范项 1]
[详细说明]

**正确示例**:
```javascript
// 正确的代码示例
```

**错误示例**:
```javascript
// 错误的代码示例
```

### 2. [规范项 2]
[详细说明]

## 检查清单
- [ ] 检查项 1
- [ ] 检查项 2

## 相关规范
- TS-002: [相关规范名称]

## 参考资料
- [参考链接]
```

---

## 知识库索引格式

每个知识库目录需要一个 `index.md` 文件作为索引：

```markdown
# [知识库名称] 索引

## 快速导航

### 按分类
- [分类 1](#分类-1)
- [分类 2](#分类-2)

### 按关键词
| 关键词 | 文档 | 描述 |
|-------|------|------|
| 用户认证 | user-auth.md | 用户认证相关规则 |
| 订单处理 | order-processing.md | 订单处理流程 |

## 分类 1
### [文档名称 1](./path/to/doc1.md)
简要描述...

### [文档名称 2](./path/to/doc2.md)
简要描述...

## 分类 2
...
```

---

## 执行配置命令

当用户执行 `*kb-setup` 时：

```markdown
## 知识库配置向导

我将帮助你配置全自动迭代开发所需的知识库。

### 第一步：确认知识库位置

请确认以下知识库路径是否正确：

**业务知识库**:
- 路径: `{检测到的路径或默认路径}`
- 状态: {已存在/不存在}

**技术知识库**:
- 路径: `{检测到的路径或默认路径}`
- 状态: {已存在/不存在}

### 第二步：扫描知识库

正在扫描知识库内容...

**扫描结果**:
- 业务规则文档: X 个
- 技术规范文档: Y 个
- 总计可索引文档: Z 个

### 第三步：构建索引

正在构建知识库索引...

**索引构建完成**:
- 业务关键词: XX 个
- 技术关键词: YY 个
- 索引文件: `{xiaoma_folder}/auto-iteration/kb-index.yaml`

### 配置完成

知识库已配置完成，可以开始使用 `*auto-iterate` 执行全自动迭代开发。
```

---

## 知识库索引文件格式

构建的索引文件 `kb-index.yaml`：

```yaml
# kb-index.yaml
version: "1.0"
built_at: "2024-01-15T10:00:00Z"

business_kb:
  path: "./docs/knowledge-base/business/"
  documents:
    - path: "business-rules/user-management.md"
      keywords: ["用户", "认证", "权限", "角色"]
      type: "business-rule"
    - path: "domain-models/user-model.md"
      keywords: ["用户", "实体", "属性"]
      type: "domain-model"

technical_kb:
  path: "./docs/knowledge-base/technical/"
  documents:
    - path: "coding-standards/naming-conventions.md"
      keywords: ["命名", "变量", "函数", "类"]
      type: "coding-standard"
    - path: "architecture-patterns/repository-pattern.md"
      keywords: ["仓储", "数据访问", "持久化"]
      type: "architecture-pattern"

keyword_index:
  "用户认证":
    - "business-rules/user-management.md"
    - "tech-stack/auth-stack.md"
  "数据验证":
    - "coding-standards/validation.md"
    - "business-rules/data-validation.md"
```
