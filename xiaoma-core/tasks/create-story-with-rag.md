# 基于知识库的用户故事创建任务

## Purpose

基于知识库（`docs/rag/`）中的业务知识、技术知识以及架构增量设计文档（`docs/architecture-increment.md`），创建详细、可操作且自包含的用户故事。确保故事内容与真实需求、业务规则和技术规范完全对齐，使开发智能体能够高效实施。

## 上游交接物

```yaml
必需输入:
  PRD/Epic文档:
    - docs/prd.md                               # PM生成的PRD文档
    - 或 docs/prd/{epic-name}.md                # 切分后的Epic文档

  架构增量设计:
    - docs/architecture-increment.md            # Architect生成的增量设计

  需求分析报告:
    - docs/rag/_analysis-report.md              # Analyst生成的需求分析报告

可选输入:
  业务知识库:
    - docs/rag/business/rules-*.md              # 业务规则文件
    - docs/rag/_requirement-parsing.yaml        # 需求解析结果

  技术知识库:
    - docs/rag/technical/architecture.md        # 现有技术架构
    - docs/rag/technical/tech-stack.md          # 技术栈详情
    - docs/rag/technical/module-structure.md    # 模块结构
    - docs/rag/technical/data-model.md          # 数据模型
    - docs/rag/technical/coding-standards/      # 编码规范目录
    - docs/rag/technical/middleware/            # 中间件规范目录
    - docs/rag/technical/sql-standards/         # SQL规范目录

  约束条件:
    - docs/rag/constraints/security.md          # 安全要求
    - docs/rag/constraints/performance.md       # 性能要求

  上一个故事:
    - docs/project/stories/{epic}.{story-1}.*.md  # 上一个完成的故事
```

## Workflow Overview

```
PRD/Epic + 知识库 + 架构增量设计 → 识别Story → 知识融合 → 生成详细Story → 检查清单验证
```

---

## Phase 0: 加载核心配置与知识上下文

### 0.1 加载核心配置

```yaml
执行步骤:
  步骤1_加载配置:
    动作: 读取 {root}/core-config.yaml
    提取:
      - devStoryLocation     # 故事文件存放位置
      - prd.*                # PRD配置
      - architecture.*       # 架构文档配置
    缺失处理: |
      如果配置文件不存在，提示：
      "core-config.yaml 未找到。请先配置项目。"
```

### 0.2 验证上游交接物

```yaml
执行步骤:
  步骤1_检查PRD:
    动作: 检查 docs/prd.md 或切分后的 Epic 文件
    缺失处理: 提示执行 PM 智能体 *create-prd-from-rag

  步骤2_检查架构增量设计:
    动作: 检查 docs/architecture-increment.md
    缺失处理: |
      如果不存在：
      - 提示执行 Architect 智能体 *create-incremental-architecture
      - 或询问是否使用传统架构文档继续

  步骤3_检查需求分析报告:
    动作: 检查 docs/rag/_analysis-report.md
    缺失处理: |
      如果不存在：
      - 提示执行 Analyst 智能体完成需求分析
      - 或询问是否仅使用 PRD 继续（功能受限）

  步骤4_扫描知识库:
    动作: 扫描 docs/rag/ 目录，识别可用的知识文件
    输出:
      available_knowledge:
        business_rules: [文件列表]
        technical_specs: [文件列表]
        constraints: [文件列表]
```

### 0.3 知识上下文整合

```yaml
知识整合:
  业务上下文:
    来源:
      - docs/rag/_analysis-report.md#功能分析
      - docs/rag/_analysis-report.md#业务规则汇总
      - docs/rag/business/rules-*.md
    提取内容:
      - 功能清单与优先级
      - 业务规则与约束
      - 用户角色与权限
      - 数据实体与关系

  技术上下文:
    来源:
      - docs/architecture-increment.md
      - docs/rag/technical/coding-standards/
      - docs/rag/technical/module-structure.md
      - docs/rag/technical/middleware/
    提取内容:
      - 模块设计与包结构
      - 数据模型设计与DDL
      - 接口设计与API规范
      - 中间件使用方式与代码示例
      - 编码规范要点

  约束上下文:
    来源:
      - docs/rag/constraints/security.md
      - docs/rag/constraints/performance.md
      - docs/rag/_analysis-report.md#技术分析
    提取内容:
      - 安全要求
      - 性能要求
      - 兼容性约束
```

---

## Phase 1: 识别下一个 Story

### 1.1 定位 Epic 和 Story

```yaml
执行步骤:
  步骤1_定位Epic:
    动作: 根据 PRD 配置定位当前 Epic
    来源:
      - docs/prd.md 中的 Epic 列表
      - 或 docs/prd/{epic-name}.md 切分文件

  步骤2_确定Story编号:
    动作: 扫描 devStoryLocation 目录
    逻辑:
      - 如果无故事文件: 下一个是 1.1
      - 如果有故事文件: 找到最高编号，确定下一个
      - 检查最高编号故事状态，非Done则警告

  步骤3_提取Story需求:
    动作: 从 Epic/PRD 中提取当前 Story 的定义
    提取内容:
      - Story 标题
      - 用户故事描述
      - 验收标准 (AC)
      - 关联的功能点 (FR)
```

### 1.2 关联知识映射

```yaml
知识映射:
  目的: 将 Story 需求映射到知识库中的具体内容

  映射维度:
    业务规则映射:
      - Story AC → 相关业务规则 (docs/rag/business/rules-*.md)
      - 功能点 → 分析报告中的功能分析

    技术设计映射:
      - Story → 架构增量设计中的相关章节
      - 数据需求 → 数据模型增量设计
      - API需求 → 接口增量设计
      - 中间件需求 → 中间件增量设计

    约束映射:
      - 安全相关AC → security.md
      - 性能相关AC → performance.md
```

---

## Phase 2: 知识融合与 Story 内容生成

### 2.1 用户故事描述生成

```yaml
用户故事生成:
  来源:
    - PRD/Epic 中的 Story 定义
    - docs/rag/_analysis-report.md#用户分析

  格式:
    作为: {用户角色，来自用户分析}
    我希望: {功能描述，来自功能分析}
    以便: {业务价值，来自需求背景}

  验证:
    - 用户角色在分析报告中有定义
    - 功能在功能清单中有对应
    - 价值与业务目标对齐
```

### 2.2 验收标准增强

```yaml
验收标准增强:
  基础AC:
    来源: PRD/Epic 中定义的验收标准

  业务规则增强:
    来源: docs/rag/business/rules-*.md
    动作: |
      对每个AC，检查是否有相关业务规则：
      - 如有，将业务规则细节融入AC
      - 标注来源: (来源: business/rules-{name}.md)

  技术约束增强:
    来源: docs/rag/constraints/
    动作: |
      检查AC是否涉及安全/性能要求：
      - 如有，添加技术约束说明
      - 标注来源: (来源: constraints/{name}.md)

  示例:
    原始AC: "用户可以创建订单"
    增强后: |
      用户可以创建订单
      - 订单状态初始为"待支付" (来源: business/rules-order.md)
      - 订单号格式: ORD{yyyyMMdd}{6位序号} (来源: business/rules-order.md)
      - 创建接口响应时间 < 500ms (来源: constraints/performance.md)
```

### 2.3 任务/子任务生成

```yaml
任务生成:
  来源整合:
    架构设计:
      - docs/architecture-increment.md#模块增量设计
      - docs/architecture-increment.md#数据模型增量设计
      - docs/architecture-increment.md#接口增量设计
      - docs/architecture-increment.md#中间件增量设计

    编码规范:
      - docs/rag/technical/coding-standards/
      - docs/rag/technical/module-structure.md

  任务生成规则:
    数据层任务:
      条件: Story涉及数据模型变更
      来源: architecture-increment.md#数据模型增量设计
      任务模板: |
        - [ ] 创建/修改数据模型 (AC: {相关AC})
          - [ ] 创建实体类 {EntityName} [参考: architecture-increment.md#entity-detail]
          - [ ] 执行DDL脚本 [参考: architecture-increment.md#ddl-script]
          - [ ] 创建Mapper/Repository [遵循: coding-standards/]

    接口层任务:
      条件: Story涉及API开发
      来源: architecture-increment.md#接口增量设计
      任务模板: |
        - [ ] 实现API接口 (AC: {相关AC})
          - [ ] 创建Controller [参考: architecture-increment.md#api-detail]
          - [ ] 实现请求参数校验 [遵循: coding-standards/]
          - [ ] 实现响应格式 [参考: architecture-increment.md#response-design]

    业务层任务:
      条件: Story涉及业务逻辑
      来源: architecture-increment.md#模块增量设计
      任务模板: |
        - [ ] 实现业务逻辑 (AC: {相关AC})
          - [ ] 创建Service类 [参考: architecture-increment.md#class-design]
          - [ ] 实现业务规则 [参考: business/rules-{name}.md]
          - [ ] 添加事务管理 [遵循: coding-standards/]

    中间件任务:
      条件: Story涉及缓存/消息/定时任务
      来源: architecture-increment.md#中间件增量设计
      任务模板: |
        - [ ] 实现中间件功能 (AC: {相关AC})
          - [ ] Redis缓存实现 [参考: architecture-increment.md#redis-design, middleware/redis.md]
          - [ ] 消息队列实现 [参考: architecture-increment.md#mq-design, middleware/mq.md]

    测试任务:
      来源: docs/rag/technical/coding-standards/ (测试部分)
      任务模板: |
        - [ ] 编写测试用例 (AC: ALL)
          - [ ] 单元测试 [遵循: coding-standards/testing]
          - [ ] 集成测试（如需要）
          - [ ] 验收标准验证
```

### 2.4 开发者说明生成

```yaml
开发者说明生成:
  结构:
    上一个Story洞察:
      来源: 上一个Story的Dev Agent Record
      内容: 关键经验、技术决策、注意事项

    架构设计参考:
      来源: docs/architecture-increment.md
      内容: |
        ### 架构设计参考
        **模块设计**: [参考: architecture-increment.md#module-design]
        - 包结构: {package_structure}
        - 核心类: {class_list}

        **数据模型**: [参考: architecture-increment.md#data-model-design]
        - 表名: {table_name}
        - 核心字段: {fields}

        **接口设计**: [参考: architecture-increment.md#api-design]
        - 路径: {api_path}
        - 方法: {http_method}

    业务规则:
      来源: docs/rag/business/rules-*.md
      内容: |
        ### 业务规则
        [参考: business/rules-{name}.md]
        - 规则1: {rule_description}
        - 规则2: {rule_description}

    编码规范要点:
      来源: docs/rag/technical/coding-standards/
      内容: |
        ### 编码规范要点
        [参考: coding-standards/]
        - 命名规范: {naming_rules}
        - 分层规范: {layer_rules}
        - 异常处理: {exception_rules}

    中间件使用:
      条件: Story涉及中间件
      来源: docs/rag/technical/middleware/
      内容: |
        ### 中间件使用
        **Redis**: [参考: middleware/redis.md]
        - Key命名: {key_pattern}
        - 代码示例: {code_example}

        **MQ**: [参考: middleware/mq.md]
        - Topic: {topic_name}
        - 代码示例: {code_example}

    约束条件:
      来源: docs/rag/constraints/
      内容: |
        ### 约束条件
        **安全要求**: [参考: constraints/security.md]
        - {security_requirements}

        **性能要求**: [参考: constraints/performance.md]
        - {performance_requirements}

    文件位置:
      来源: docs/rag/technical/module-structure.md
      内容: |
        ### 文件位置
        [参考: module-structure.md]
        - Controller: {path}
        - Service: {path}
        - Mapper: {path}
        - Entity: {path}
```

### 2.5 测试说明生成

```yaml
测试说明生成:
  来源:
    - docs/rag/technical/coding-standards/ (测试部分)
    - docs/architecture-increment.md#测试策略 (如有)

  内容:
    测试框架:
      来源: coding-standards/
      内容: {test_framework}

    测试文件位置:
      来源: module-structure.md
      内容: {test_file_location}

    测试场景:
      来源: AC + 业务规则
      内容: |
        - 正常流程测试: {scenarios}
        - 异常流程测试: {error_scenarios}
        - 边界条件测试: {edge_cases}

    验收测试:
      来源: Story AC
      内容: 每个AC对应的测试方法
```

### 2.6 知识引用索引

```yaml
知识引用索引:
  目的: 记录Story中引用的所有知识文件，便于追溯

  格式:
    ## Knowledge References

    | 知识文件 | 引用章节 | 应用位置 |
    |----------|----------|----------|
    | docs/architecture-increment.md | 模块设计 | 任务列表、Dev Notes |
    | docs/rag/business/rules-order.md | 订单规则 | AC增强、业务逻辑任务 |
    | docs/rag/technical/coding-standards/ | 命名规范 | Dev Notes |
    | docs/rag/technical/middleware/redis.md | 缓存示例 | 中间件任务 |
    | docs/rag/constraints/performance.md | 响应时间要求 | AC约束 |
```

---

## Phase 3: Story 文件生成与验证

### 3.1 生成 Story 文件

```yaml
输出文件:
  路径: {devStoryLocation}/{epicNum}.{storyNum}.{story_title_short}.md
  状态: Draft

  内容结构:
    - 状态
    - 用户故事
    - 验收标准（增强版）
    - 任务/子任务（带知识引用）
    - 开发者说明（知识融合版）
    - 测试说明
    - Knowledge References（新增）
    - 变更日志
    - 开发者代理记录
    - QA结果
```

### 3.2 执行检查清单

```yaml
检查清单:
  执行: {root}/checklists/story-draft-checklist.md

  额外检查项:
    知识引用完整性:
      - [ ] 架构增量设计已引用
      - [ ] 相关业务规则已引用
      - [ ] 编码规范已引用
      - [ ] 约束条件已引用

    知识一致性:
      - [ ] AC与业务规则一致
      - [ ] 任务与架构设计一致
      - [ ] 技术选型与技术栈一致
```

### 3.3 完成报告

```yaml
完成报告:
  格式: |
    ✅ 用户故事创建完成！

    📄 故事文件: {story_path}
    📊 状态: Draft
    🔢 Story编号: {epicNum}.{storyNum}

    📚 知识融合摘要:
    - 架构设计: {architecture_sections_used}
    - 业务规则: {business_rules_used}
    - 技术规范: {technical_specs_used}
    - 约束条件: {constraints_used}

    📋 任务概要:
    - 数据层任务: {data_task_count}
    - 接口层任务: {api_task_count}
    - 业务层任务: {business_task_count}
    - 测试任务: {test_task_count}

    ✅ 检查清单: {checklist_result}

    🔄 下一步建议:
    - 审核故事: 请PO/用户审核后批准
    - 验证故事: 可执行 *validate-story 进行深度验证
    - 开始开发: 批准后执行 Dev智能体 *develop-story-with-rag
```

---

## 阻塞条件

```yaml
阻塞条件:
  必须停止:
    - PRD/Epic 文件不存在
    - 架构增量设计与PRD严重不一致
    - 关键业务规则缺失

  警告继续:
    - 部分知识文件缺失（记录后继续）
    - 上一个Story未完成（用户确认后继续）
```

---

## 使用说明

### 激活命令

```
*draft-with-rag [epic_num] [story_num]
```

### 执行参数

```yaml
参数:
  epic_num: Epic编号 (可选，默认自动识别)
  story_num: Story编号 (可选，默认自动识别下一个)
  rag_path: RAG知识目录路径 (默认: docs/rag/)
  interactive: 交互模式 (默认: true)
```

### 与原有命令的区别

| 命令 | 知识来源 | 适用场景 |
|------|----------|----------|
| `*draft` | 仅PRD + 架构文档 | 传统项目 |
| `*draft-with-rag` | PRD + 知识库 + 架构增量设计 | 有知识库的项目 |

---

## 任务完成标志

```yaml
完成条件:
  必要输出:
    - Story文件已创建
    - Knowledge References已记录
    - 检查清单已执行

  Story就绪标志:
    - 所有AC都有知识来源支撑
    - 所有任务都有技术参考
    - Dev Notes包含足够上下文
    - 知识引用索引完整
```
