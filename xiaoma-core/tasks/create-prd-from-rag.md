# 基于需求分析创建PRD任务

## Purpose

基于 Analyst 智能体的需求分析产出物（`docs/rag/` 目录），结合原始需求文档，生成高质量的 PRD 或 Epic 文档。本任务是 Analyst 智能体的下游任务，承接需求分析报告并转化为可执行的产品文档。

## 上游交接物

```yaml
必需输入:
  - docs/rag/_analysis-report.md      # 需求分析报告（核心输入）
  - docs/rag/_requirement-parsing.yaml # 需求解析结果
  - req.txt                            # 原始需求文档

可选输入:
  - docs/rag/_questions.md            # 问题清单
  - docs/rag/_index.md                # 知识索引
  - docs/rag/business/                # 业务知识
  - docs/rag/technical/               # 技术知识
  - docs/rag/constraints/             # 约束条件
```

## Workflow Overview

```
Analyst产出物 → 输入验证 → 复杂度评估 → 文档类型选择 → 文档生成 → 质量检查
```

---

## Phase 1: 输入验证与上下文加载

### 1.1 验证上游交接物

```yaml
执行步骤:
  步骤1_检查必需文件:
    动作: 检查 docs/rag/ 目录是否存在以下文件
    必需文件:
      - _analysis-report.md
      - _requirement-parsing.yaml
    缺失处理: |
      如果缺失必需文件，提示用户：
      "未找到需求分析报告。请先执行 Analyst 智能体的 *analyze-requirement 命令完成需求分析。"

  步骤2_加载分析报告:
    动作: 读取并解析 _analysis-report.md
    提取内容:
      - 需求概述（背景、目标、范围）
      - 功能分析（功能清单、优先级、依赖关系）
      - 用户分析（角色、旅程）
      - 数据分析（实体、关系）
      - 技术分析（可行性、兼容性）
      - 业务规则汇总
      - 差距分析
      - 风险分析
      - 待澄清事项

  步骤3_加载原始需求:
    动作: 读取 req.txt 原始需求文档
    目的: 确保不遗漏原始需求中的细节

  步骤4_加载知识上下文:
    动作: 扫描 docs/rag/ 子目录，加载相关知识文件
    加载顺序:
      - technical/architecture.md      # 技术架构
      - technical/coding-standards/    # 编码规范
      - technical/data-model.md        # 数据模型
      - business/                      # 业务知识
      - constraints/                   # 约束条件
```

### 1.2 上下文整合

```yaml
整合输出:
  项目上下文:
    - 项目背景与目标
    - 技术栈与架构约束
    - 现有系统兼容性要求

  需求上下文:
    - 功能清单与优先级
    - 用户角色与权限
    - 数据实体与关系
    - 业务规则

  约束上下文:
    - 技术约束
    - 安全合规要求
    - 性能要求

  风险上下文:
    - 已识别风险
    - 待澄清事项
```

---

## Phase 2: 复杂度评估与文档类型选择

### 2.1 复杂度评估矩阵

```yaml
评估维度:
  功能复杂度:
    低: 功能点 <= 3，无复杂业务流程
    中: 功能点 4-8，存在中等复杂度业务流程
    高: 功能点 > 8，存在复杂业务流程或多系统集成

  技术复杂度:
    低: 遵循现有模式，无架构变更
    中: 部分新技术引入，小范围架构调整
    高: 重大技术决策，架构级变更

  集成复杂度:
    低: 单一系统，无外部集成
    中: 2-3个系统集成
    高: 多系统集成，复杂数据流

  风险等级:
    低: 风险清单中无高风险项
    中: 存在1-2个中等风险项
    高: 存在高风险项或多个中等风险项
```

### 2.2 文档类型选择规则

```yaml
选择规则:
  生成完整PRD:
    条件:
      - 功能复杂度 >= 中 OR
      - 技术复杂度 >= 中 OR
      - 需要架构设计 OR
      - 涉及多个Epic
    输出: docs/prd.md
    模板: prd-from-rag-tmpl.yaml

  生成单Epic:
    条件:
      - 功能复杂度 = 低
      - 技术复杂度 = 低
      - 可在1-3个Story内完成
      - 无重大架构变更
    输出: docs/epic-{name}.md
    模板: epic-from-rag-tmpl.yaml

  需要澄清:
    条件:
      - 待澄清事项 > 5 OR
      - 存在阻塞性待澄清项
    动作: 暂停生成，先与用户澄清关键问题
```

### 2.3 交互确认

```yaml
确认点:
  展示内容:
    - 复杂度评估结果
    - 建议的文档类型
    - 预计的Epic/Story数量
    - 关键风险提示

  用户选项:
    - 确认并继续
    - 调整文档类型
    - 先澄清待定事项
```

---

## Phase 3: PRD文档生成

### 3.1 PRD结构映射

将分析报告内容映射到PRD结构：

```yaml
映射规则:
  目标与背景:
    来源: 分析报告.需求概述
    映射:
      - 需求背景 → PRD.背景上下文
      - 核心目标 → PRD.目标
      - 范围边界 → PRD.范围定义

  需求章节:
    来源: 分析报告.功能分析 + 业务规则汇总
    映射:
      - 功能清单 → PRD.功能性需求 (FR)
      - 业务规则 → PRD.功能性需求 (补充)
      - 技术分析.性能要求 → PRD.非功能性需求 (NFR)
      - 约束条件 → PRD.非功能性需求 (NFR)

  UI设计目标:
    来源: 分析报告.用户分析
    映射:
      - 用户角色 → PRD.用户角色定义
      - 用户旅程 → PRD.关键交互范式
      - 功能清单中的UI相关项 → PRD.核心屏幕与视图

  技术假设:
    来源: docs/rag/technical/ + 分析报告.技术分析
    映射:
      - architecture.md → PRD.服务架构
      - coding-standards/ → PRD.编码规范约束
      - 技术可行性评估 → PRD.技术假设

  Epic结构:
    来源: 分析报告.功能分析
    映射:
      - 功能清单(按优先级分组) → Epic列表
      - 功能依赖关系 → Story顺序
      - P0功能 → Epic 1 (核心功能)
      - P1功能 → Epic 2+ (增强功能)

  风险与待办:
    来源: 分析报告.风险分析 + 待澄清事项
    映射:
      - 风险清单 → PRD.风险评估
      - 待澄清事项 → PRD.开放问题
```

### 3.2 Epic/Story 生成规则

```yaml
Epic生成规则:
  分组策略:
    - 按功能模块分组
    - 每个Epic交付独立可测试的功能增量
    - Epic 1 优先包含P0功能
    - 后续Epic按优先级和依赖关系排列

  Epic结构:
    - Epic标题
    - Epic目标 (2-3句话)
    - 包含的功能点
    - 技术实现要点（来自技术知识）
    - Story列表

Story生成规则:
  拆分策略:
    - 每个Story是垂直切片
    - 单个AI Agent会话可完成（2-4小时工作量）
    - 明确的输入输出边界

  Story结构:
    - Story标题
    - 用户故事格式 (As a... I want... So that...)
    - 验收标准 (基于分析报告中的业务规则)
    - 技术实现提示（来自技术知识）
    - 集成验证点（来自数据关系分析）

  排序规则:
    - 基础设施优先
    - 数据模型优先于业务逻辑
    - 核心流程优先于边缘场景
    - 遵循功能依赖关系图
```

### 3.3 知识融合

```yaml
知识融合点:
  业务规则融合:
    来源: docs/rag/business/rules-*.md
    融合到: 验收标准、业务逻辑描述

  数据模型融合:
    来源: docs/rag/technical/data-model.md
    融合到: 数据实体定义、关联关系说明

  编码规范融合:
    来源: docs/rag/technical/coding-standards/
    融合到: 技术实现提示、代码示例引用

  中间件规范融合:
    来源: docs/rag/technical/middleware/
    融合到: 技术假设、实现约束

  安全要求融合:
    来源: docs/rag/constraints/security.md
    融合到: 非功能性需求、验收标准
```

---

## Phase 4: 质量检查与输出

### 4.1 PRD质量检查清单

```yaml
完整性检查:
  - [ ] 所有P0功能已覆盖
  - [ ] 所有P1功能已覆盖或标记为后续迭代
  - [ ] 所有已识别的业务规则已融入
  - [ ] 所有数据实体已定义
  - [ ] 所有用户角色已覆盖

一致性检查:
  - [ ] 功能需求与分析报告一致
  - [ ] 技术假设与知识库一致
  - [ ] Epic/Story顺序符合依赖关系
  - [ ] 验收标准可测试

可执行性检查:
  - [ ] 每个Story大小适合AI Agent执行
  - [ ] Story之间无循环依赖
  - [ ] 技术实现路径清晰
  - [ ] 风险缓解措施具体

交接完整性检查:
  - [ ] 包含UX专家提示
  - [ ] 包含架构师提示
  - [ ] 待澄清事项已列出
```

### 4.2 输出文件

```yaml
主输出:
  PRD文档:
    路径: docs/prd.md
    格式: Markdown

  或 Epic文档:
    路径: docs/epic-{name}.md
    格式: Markdown

辅助输出:
  知识引用索引:
    路径: docs/prd-knowledge-refs.md
    内容: PRD中引用的知识文件清单

  待澄清事项:
    路径: docs/prd-open-questions.md
    内容: 需要进一步确认的问题
```

---

## Phase 5: 下游交接

### 5.1 交接给UX专家

```yaml
UX专家交接:
  必读文件:
    - docs/prd.md (UI设计目标章节)
    - docs/rag/_analysis-report.md (用户分析章节)

  关注点:
    - 用户角色与权限
    - 核心屏幕与视图
    - 关键用户旅程
    - 无障碍性要求

  建议命令: "*create-ux-design docs/prd.md"
```

### 5.2 交接给架构师

```yaml
架构师交接:
  必读文件:
    - docs/prd.md (技术假设章节)
    - docs/rag/technical/ (技术知识目录)
    - docs/rag/_analysis-report.md (技术分析章节)

  关注点:
    - 技术栈与架构约束
    - 数据模型与关系
    - 集成点与接口
    - 性能与安全要求

  建议命令: "*create-architecture docs/prd.md"
```

---

## 使用说明

### 激活命令

```
*create-prd-from-rag [rag_path]
```

### 执行参数

```yaml
参数:
  rag_path: RAG知识目录路径 (默认: docs/rag/)
  output_path: PRD输出路径 (默认: docs/prd.md)
  doc_type: 文档类型 (auto|prd|epic, 默认: auto)
  interactive: 交互模式 (默认: true)
```

### 交互模式流程

1. **验证阶段**: 检查上游交接物完整性
2. **评估阶段**: 展示复杂度评估结果，确认文档类型
3. **生成阶段**: 逐章节生成PRD，关键节点请求确认
4. **检查阶段**: 执行质量检查清单
5. **输出阶段**: 生成最终文档，提示下游交接

### YOLO模式

通过 `*yolo` 命令切换YOLO模式，一次性完成所有步骤，跳过中间确认环节。

---

## 任务完成标志

```yaml
完成条件:
  必要输出:
    - docs/prd.md 或 docs/epic-{name}.md

  完成提示: |
    ✅ PRD/Epic 文档生成完成！

    📄 输出文件: {output_path}
    📊 Epic数量: {epic_count}
    📝 Story数量: {story_count}

    🔄 下一步建议:
    - UX设计: *create-ux-design docs/prd.md
    - 架构设计: *create-architecture docs/prd.md

    ⚠️ 待澄清事项: {open_questions_count} 项
    请在开发前确认这些问题。
```
