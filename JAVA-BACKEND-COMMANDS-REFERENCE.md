# 📋 Java 后端迭代开发 - Agent 命令使用参考

> **重要说明**：本文档是《JAVA-BACKEND-ITERATION-GUIDE.md》的补充，明确每个步骤是否需要执行专用命令。

---

## 🎯 命令使用的三种情况

### ✅ **情况 1：必须使用专用命令**
Agent 有明确的专用命令，**必须**在 Prompt 结尾明确指出要执行的命令。

### 📝 **情况 2：无需专用命令**
Agent 没有对应的专用命令，通过详细的 Prompt 描述让 Agent 理解任务并执行。

### 🔧 **情况 3：加载配置文件**
特殊的 Agent（如 xiaoma-master）需要加载 YAML 配置文件来执行复杂任务。

---

## 📊 完整步骤命令对照表

### **阶段 1：需求理解和 PRD 创建**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 1.1 分析现有架构 | Architect | ❌ 不需要 | 无 | 通过详细 Prompt 描述分析任务 |
| 1.2 创建 Brownfield PRD | PM | ✅ **需要** | `*create-brownfield-prd` | 必须在 Prompt 结尾明确执行此命令 |
| 1.2 验证 PRD 质量 | PM | ❌ 不需要 | 无 | 通过 Prompt 要求 Agent 自我审查 |
| 1.3 创建史诗 | PM | ✅ **需要** | `*create-epic` | 必须在 Prompt 结尾明确执行此命令 |

---

### **阶段 2：技术架构设计**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 2.1 后端架构增量设计 | Architect | ✅ **需要** | `*create-backend-architecture` | 必须在 Prompt 结尾明确执行此命令 |
| 2.1 架构评审 | Architect | ❌ 不需要 | 无 | 通过 Prompt 要求 Agent 自我评审 |

---

### **阶段 3：用户故事创建和细化**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 3.1 识别用户故事列表 | SM | ❌ 不需要 | 无 | 通过 Prompt 描述任务，输出表格 |
| 3.2 创建增强版用户故事 | SM | ✅ **需要** | `*draft-enhanced` | 必须在 Prompt 结尾明确执行此命令 |
| 3.2 验证故事质量 | SM | ❌ 不需要 | 无 | 通过 Prompt 要求 Agent 自检 |
| 3.3 PO 验证用户故事 | PO | ✅ **需要** | `*validate-story-draft` | 必须在 Prompt 结尾明确执行此命令 |
| 3.3 修改故事（如不通过） | SM | ❌ 不需要 | 无 | 通过 Prompt 描述修改要求 |

---

### **阶段 4：Java 后端开发实现**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 4.1 开发用户故事 | Dev | ✅ **需要** | `*develop-story {story-file-path}` | 必须在 Prompt 结尾明确执行此命令，带文件路径参数 |
| 4.2 运行测试 | Dev | ✅ **需要** | `*run-tests` | 必须在 Prompt 结尾明确执行此命令 |
| 4.2 修复测试失败 | Dev | ❌ 不需要 | 无 | 通过 Prompt 描述失败信息和修复要求 |
| 4.3 代码自检和优化 | Dev | ❌ 不需要 | 无 | 通过 Prompt 提供自检清单 |

---

### **阶段 5：QA 测试和质量门禁**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 5.1 QA 综合审查 | QA | ✅ **需要** | `*review {story-file-path}` | 必须在 Prompt 结尾明确执行此命令，带文件路径参数 |
| 5.2 修复 QA 问题 | Dev | ✅ **需要** | `*review-qa {story-file-path}` | 必须在 Prompt 结尾明确执行此命令，带文件路径参数 |
| 5.2 重新测试 | Dev | ✅ **需要** | `*run-tests` | 必须在 Prompt 结尾明确执行此命令 |
| 5.2 重新 QA 审查 | QA | ✅ **需要** | `*review {story-file-path}` | 必须在 Prompt 结尾明确执行此命令 |
| 5.3 质量门禁决策 | QA | ✅ **需要** | `*gate {story-file-path}` | 必须在 Prompt 结尾明确执行此命令，带文件路径参数 |

---

### **阶段 6：需求覆盖度审计和全局质量验证**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 6.1 需求覆盖度审计 | XiaoMa Master | 🔧 **加载配置** | 加载 `requirements-coverage-auditor.yaml` | 在 Prompt 中说明要加载此配置文件并执行审计 |
| 6.2 全局质量验证 | XiaoMa Master | 🔧 **加载配置** | 加载 `automated-quality-validator.yaml` | 在 Prompt 中说明要加载此配置文件并执行验证 |

**说明**：对于加载配置文件的情况，目前文档中的做法是正确的：在 Prompt 中明确说"请加载 xxx.yaml 配置"。具体的加载方式可能因 Agent 实现而异。

---

### **阶段 7：文档整理和交付准备**

| 步骤 | Agent | 是否需要命令 | 命令 | 说明 |
|-----|-------|------------|------|------|
| 7.1 生成完成故事汇总 | PO | ❌ 不需要 | 无 | 通过详细 Prompt 描述文档内容和格式要求 |
| 7.2 生成 API 文档 | Architect | ⚠️ **可选** | `*document-project` | 可以使用此命令或详细 Prompt |
| 7.3 生成数据库文档 | Architect | ⚠️ **可选** | `*document-project` | 可以使用此命令或详细 Prompt |
| 7.4 生成部署文档 | Architect | ⚠️ **可选** | `*document-project` | 可以使用此命令或详细 Prompt |
| 7.5 最终 PO 验收 | PO | ❌ 不需要 | 无 | 通过详细 Prompt 描述验收清单和决策标准 |

---

## 🎯 实际使用示例

### **示例 1：需要命令的步骤（PM 创建 PRD）**

```
**Prompt 内容**：
我需要为现有 Java 后端项目创建一份迭代需求的 PRD 文档。

[...详细的任务描述和要求...]

**请执行命令**：
*create-brownfield-prd
```

**关键点**：
- ✅ 在 Prompt 最后明确写出命令
- ✅ 命令前加粗标注"**请执行命令**："
- ✅ Agent 会执行此命令并生成 PRD 文档

---

### **示例 2：不需要命令的步骤（Architect 分析架构）**

```
**Prompt 内容**：
请分析当前项目的后端架构。

[...详细的分析要求和输出要求...]
```

**关键点**：
- ✅ 不需要在 Prompt 结尾加命令
- ✅ 通过详细描述让 Agent 理解任务
- ✅ Agent 会根据 Prompt 执行分析并生成报告

---

### **示例 3：开发故事（带参数的命令）**

```
**Prompt 内容**：
请开发用户故事 US-01 的 Java 后端代码。

**故事文件**：`docs/stories/epic01-story01.md`

[...详细的开发任务和要求...]

**请执行命令**：
*develop-story docs/stories/epic01-story01.md
```

**关键点**：
- ✅ 命令需要带文件路径参数
- ✅ 参数是用户故事文件的完整路径
- ✅ Agent 会读取该文件并执行开发

---

### **示例 4：加载配置文件（特殊情况）**

```
**Prompt 内容**：
请对整个迭代需求进行全面的覆盖度审计。

[...详细的审计任务和要求...]

**请加载配置并执行**：
加载 requirements-coverage-auditor.yaml 配置，执行全面审计。
```

**关键点**：
- ✅ 明确说明要加载哪个配置文件
- ✅ 说明加载后要执行什么任务
- ✅ 具体加载方式可能因实现而异

---

## 📌 关键注意事项

### ✅ **必须做的**

1. **有专用命令的步骤**：
   - 必须在 Prompt 结尾明确写出命令
   - 格式：`**请执行命令**：\n*command-name {params}`
   - 带参数的命令必须提供参数（如文件路径）

2. **命令带参数的情况**：
   - `*develop-story` → 需要故事文件路径
   - `*review` → 需要故事文件路径
   - `*review-qa` → 需要故事文件路径
   - `*gate` → 需要故事文件路径

3. **命令执行确认**：
   - 发送 Prompt 后，观察 Agent 的响应
   - Agent 应该明确说"正在执行 *xxx 命令"
   - 如果没有执行，需要重新发送 Prompt 并明确命令

### ❌ **不要做的**

1. **不需要命令的步骤**：
   - 不要画蛇添足加命令
   - 详细的 Prompt 描述就足够了
   - Agent 会理解任务并执行

2. **命令格式错误**：
   - ❌ 错误：`请执行create-brownfield-prd`（缺少 `*`）
   - ✅ 正确：`*create-brownfield-prd`

3. **参数遗漏**：
   - ❌ 错误：`*develop-story`（缺少文件路径）
   - ✅ 正确：`*develop-story docs/stories/epic01-story01.md`

---

## 🔍 如何判断是否需要命令

### **判断依据 1：查看 Agent 的命令列表**

从 Agent 分析报告中查看每个 Agent 有哪些命令：

- **PM**: `*create-prd`, `*create-brownfield-prd`, `*create-epic`, `*shard-prd`
- **PO**: `*create-epic`, `*create-story`, `*validate-story-draft`, `*shard-doc`
- **SM**: `*draft`, `*draft-enhanced`, `*story-checklist`
- **Dev**: `*develop-story`, `*review-qa`, `*run-tests`, `*explain`
- **QA**: `*review`, `*gate`, `*test-design`, `*risk-profile`
- **Architect**: `*create-backend-architecture`, `*create-front-end-architecture`, `*create-full-stack-architecture`, `*document-project`

如果要执行的任务匹配这些命令之一，就**需要使用命令**。

### **判断依据 2：任务类型**

| 任务类型 | 是否需要命令 | 示例 |
|---------|------------|------|
| 创建正式文档（PRD、史诗、故事） | ✅ 需要 | `*create-epic`, `*draft-enhanced` |
| 开发/测试代码 | ✅ 需要 | `*develop-story`, `*run-tests` |
| 质量审查和决策 | ✅ 需要 | `*review`, `*gate` |
| 探索性分析 | ❌ 不需要 | 分析架构、识别故事列表 |
| 自检和评审 | ❌ 不需要 | 代码自检、架构评审 |
| 文档生成（非正式） | ❌ 不需要 | 汇总文档、API文档 |
| 验收决策 | ❌ 不需要 | 最终验收 |

### **判断依据 3：查看原始操作手册**

在《JAVA-BACKEND-ITERATION-GUIDE.md》中：
- 如果 Prompt 底部有 `*command-name` 格式的内容 → **需要命令**
- 如果只有详细描述，没有 `*` 开头的命令 → **不需要命令**

---

## 💡 实战建议

### **建议 1：使用命令清单**

在实际操作时，将本文档打印出来或放在第二屏，随时查阅哪些步骤需要命令。

### **建议 2：观察 Agent 响应**

发送 Prompt 后，观察 Agent 的响应：
- 如果 Agent 说"正在执行 *xxx 命令" → 命令已识别 ✅
- 如果 Agent 开始描述任务而不是执行 → 可能需要补充命令
- 如果 Agent 说"我没有此命令" → 检查命令是否正确

### **建议 3：Prompt 模板化**

将需要命令的步骤制作成 Prompt 模板，固定格式：

```
[任务描述]

**请执行命令**：
*command-name {params}
```

### **建议 4：命令执行确认**

对于关键步骤（如开发、QA），确认 Agent 执行了命令：
- 查看 Agent 的回复是否包含命令执行的确认
- 查看输出文件是否生成
- 如有疑问，询问 Agent："你刚才执行了 *xxx 命令吗？"

---

## 📖 相关文档

- [JAVA-BACKEND-ITERATION-GUIDE.md](./JAVA-BACKEND-ITERATION-GUIDE.md) - 完整操作手册
- [CLAUDE.md](./CLAUDE.md) - 项目开发指南
- [xiaoma-agents-analysis.md](./xiaoma-agents-analysis.md) - Agent 完整分析（如果有）

---

**希望这份参考文档能帮助您清晰地了解何时需要使用命令！** 🚀
