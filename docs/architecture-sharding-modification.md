# 架构文档切分步骤修改方案

## 修改位置

在 `xiaoma-core/workflows/automated-requirements-analysis.yaml` 文件中的第4步 `design_incremental_backend_architecture` 之后添加架构文档切分步骤。

## 修改内容

### 在第4步的 `detailed_steps` 中添加新步骤

在 `validate_architecture_design` 步骤之后，添加以下步骤：

````yaml
- step: shard_architecture_document
  command: "*shard-doc"
  description: "将架构文档按技术模块切分"
  action: shard_architecture_by_modules
  prompt_template: |
    架构设计文档已完成，现在需要将其按技术模块切分为多个子文档，便于开发团队查阅和维护。

    **源文档**：
    docs/architecture/iteration-backend-design.md

    **切分命令**：
    请执行 shard-doc 命令，将架构文档切分到指定目录：

    ```
    shard-doc docs/architecture/iteration-backend-design.md docs/architecture
    ```

    **切分策略**：
    请将架构文档按以下技术模块切分：

    1. **数据库设计** (database-design.md)
       - 从【第2节 新增数据模型设计】提取
       - 包含：Entity 类设计、数据表 DDL、关联关系、数据迁移策略
       - 切分标记：`## 2. 新增数据模型设计` 到 `## 3. API 设计` 之前

    2. **API 设计** (api-design.md)
       - 从【第3节 API 设计】提取
       - 包含：RESTful API 端点、DTO 设计、API 版本策略、集成点
       - 切分标记：`## 3. API 设计` 到 `## 4. 服务层设计` 之前

    3. **服务集成** (service-integration.md)
       - 从【第4节 服务层设计】提取
       - 包含：Service 接口、业务逻辑流程、事务设计、服务交互
       - 切分标记：`## 4. 服务层设计` 到 `## 5. 技术决策` 之前

    4. **迁移计划** (migration-plan.md)
       - 从【第6节 数据库变更脚本】和【第8.3节 部署注意事项】提取
       - 包含：数据库迁移脚本、数据迁移策略、部署步骤、回滚方案
       - 切分标记：`## 6. 数据库变更脚本` + `### 8.3 部署注意事项`

    5. **编码规范** (coding-standards.md)
       - 从【第1节 设计概述】和【第7节 技术风险和注意事项】提取
       - 包含：设计原则、编码约定、技术约束、注意事项
       - 切分标记：`## 1. 设计概述` + `## 7. 技术风险和注意事项`

    6. **技术栈** (tech-stack.md)
       - 从【第1节 设计概述 - 技术选型】和【第5节 技术决策】提取
       - 包含：框架和依赖、新技术组件、性能优化、安全策略、缓存策略
       - 切分标记：`### 1.3 技术选型` + `## 5. 技术决策`

    7. **项目结构** (project-structure.md)
       - 从【第1节 设计概述】和【第8.1节 开发顺序建议】提取
       - 包含：包结构、模块组织、开发顺序、集成策略
       - 切分标记：`### 1.2 设计原则` + `### 8.1 开发顺序建议`

    **切分指令**：
    请严格按照以下映射关系进行切分：

    | 目标文件 | 源章节 | 内容范围 |
    |---------|--------|---------|
    | database-design.md | 第2节 | 完整的数据模型设计章节 |
    | api-design.md | 第3节 | 完整的 API 设计章节 |
    | service-integration.md | 第4节 | 完整的服务层设计章节 |
    | migration-plan.md | 第6节 + 第8.3节 | 数据库变更脚本 + 部署注意事项 |
    | coding-standards.md | 第1节 + 第7节 | 设计概述 + 技术风险和注意事项 |
    | tech-stack.md | 第1.3节 + 第5节 | 技术选型 + 技术决策 |
    | project-structure.md | 第1.2节 + 第8.1节 | 设计原则 + 开发顺序 |

    **切分要求**：
    1. 保持每个子文档的独立性和完整性
    2. 保留原文档的所有内容（不丢失信息）
    3. 在每个子文档开头添加元数据和来源说明
    4. 保持 Markdown 格式的正确性
    5. 保留代码块、表格、列表等格式
    6. 为每个子文档添加适当的标题和说明

    **子文档模板格式**：
    ```markdown
    # {模块名称}

    > **来源**: iteration-backend-design.md - {对应章节}
    > **最后更新**: {日期}
    > **状态**: Validated

    ## 概述
    简要说明本文档的范围和用途

    ## {具体内容章节}
    （从源文档提取的内容）
    ```

    **执行确认**：
    切分完成后，请确认：
    1. ✓ 所有7个子文档已创建
    2. ✓ 每个子文档内容完整
    3. ✓ 没有内容丢失
    4. ✓ 格式正确无误
    5. ✓ 交叉引用已更新

    请开始执行 shard-doc 命令。

  execution_process:
    phase_1: load_source_architecture_document
    phase_2: identify_section_boundaries
    phase_3: extract_content_by_modules
    phase_4: create_individual_module_documents
    phase_5: add_metadata_and_headers
    phase_6: validate_content_completeness
    phase_7: save_sharded_documents

  sharding_mapping:
    database-design.md:
      source_sections:
        - "## 2. 新增数据模型设计"
      includes:
        - "### 2.1 新增 Entity 实体类"
        - "### 2.2 数据表结构设计（DDL）"
        - "### 2.3 与现有实体的关联关系"
        - "### 2.4 数据迁移策略"
      output: "docs/architecture/database-design.md"

    api-design.md:
      source_sections:
        - "## 3. API 设计"
      includes:
        - "### 3.1 新增 RESTful API 端点列表"
        - "### 3.2 请求/响应 DTO 设计"
        - "### 3.3 API 版本策略"
        - "### 3.4 与现有 API 的集成点"
      output: "docs/architecture/api-design.md"

    service-integration.md:
      source_sections:
        - "## 4. 服务层设计"
      includes:
        - "### 4.1 新增 Service 接口和实现"
        - "### 4.2 业务逻辑流程图"
        - "### 4.3 事务边界设计"
        - "### 4.4 与现有服务的交互"
      output: "docs/architecture/service-integration.md"

    migration-plan.md:
      source_sections:
        - "## 6. 数据库变更脚本"
        - "### 8.3 部署注意事项"
      includes:
        - "### 6.1 新增表的 DDL"
        - "### 6.2 现有表的 ALTER 脚本"
        - "### 6.3 索引优化"
        - "### 6.4 数据迁移脚本"
        - "### 8.3 部署注意事项"
      output: "docs/architecture/migration-plan.md"

    coding-standards.md:
      source_sections:
        - "## 1. 设计概述"
        - "## 7. 技术风险和注意事项"
      includes:
        - "### 1.1 设计概述"
        - "### 1.2 设计原则"
        - "### 7.1 兼容性风险"
        - "### 7.2 性能影响"
        - "### 7.3 技术债务"
      output: "docs/architecture/coding-standards.md"

    tech-stack.md:
      source_sections:
        - "### 1.3 技术选型"
        - "## 5. 技术决策"
      includes:
        - "### 1.3 技术选型"
        - "### 5.1 新技术/组件的引入"
        - "### 5.2 性能优化策略"
        - "### 5.3 安全性考虑"
        - "### 5.4 缓存策略"
      output: "docs/architecture/tech-stack.md"

    project-structure.md:
      source_sections:
        - "### 1.2 设计原则"
        - "### 8.1 开发顺序建议"
      includes:
        - "### 1.2 设计原则"
        - "### 8.1 开发顺序建议"
        - "### 8.2 测试策略"
      output: "docs/architecture/project-structure.md"

  validation_criteria:
    - all_seven_documents_created
    - content_completeness_verified
    - no_information_loss
    - proper_markdown_formatting
    - metadata_added
    - cross_references_updated

  output_files:
    - "docs/architecture/database-design.md"
    - "docs/architecture/api-design.md"
    - "docs/architecture/service-integration.md"
    - "docs/architecture/migration-plan.md"
    - "docs/architecture/coding-standards.md"
    - "docs/architecture/tech-stack.md"
    - "docs/architecture/project-structure.md"

  notes: |
    架构文档切分步骤：
    1. 使用 shard-doc 命令
    2. 源文档：iteration-backend-design.md
    3. 目标目录：docs/architecture/
    4. 按技术模块切分为7个子文档
    5. 保持内容完整性和格式正确性

    切分后的好处：
    - 开发人员可以快速找到特定模块的设计文档
    - 每个子文档聚焦单一技术关注点
    - 便于团队分工和并行开发
    - 降低文档维护的复杂度
    - 提高文档的可读性和可用性

- step: validate_sharded_documents
  action: verify_sharding_quality
  prompt_template: |
    请验证架构文档切分的质量，确认：

    **完整性检查**：
    1. ✓ docs/architecture/database-design.md 已创建
    2. ✓ docs/architecture/api-design.md 已创建
    3. ✓ docs/architecture/service-integration.md 已创建
    4. ✓ docs/architecture/migration-plan.md 已创建
    5. ✓ docs/architecture/coding-standards.md 已创建
    6. ✓ docs/architecture/tech-stack.md 已创建
    7. ✓ docs/architecture/project-structure.md 已创建

    **内容检查**：
    8. ✓ 每个文档包含完整的相关内容
    9. ✓ 没有内容丢失或重复
    10. ✓ 格式正确（Markdown、代码块、表格）
    11. ✓ 元数据已添加（来源、日期、状态）

    **可用性检查**：
    12. ✓ 每个文档独立可读
    13. ✓ 交叉引用清晰
    14. ✓ 技术细节完整
    15. ✓ 适合开发团队使用

    如有问题，请指出并修正。
    如果所有检查项都通过，请确认切分质量合格。

  validation_process:
    step_1: check_all_files_exist
    step_2: verify_content_completeness
    step_3: validate_markdown_format
    step_4: check_cross_references
    step_5: ensure_usability

  on_issues_found:
    action: fix_sharding_issues
    max_iterations: 1
    notes: "修正切分中的问题"

  on_all_checks_passed:
    action: mark_sharding_validated
    message: "✅ 架构文档切分完成并验证通过"

  notes: |
    验证切分后的架构文档：
    - 确认所有7个子文档已创建
    - 验证内容完整性
    - 检查格式正确性
    - 确保开发团队可用性

    质量标准：
    - 文件完整性 100%
    - 内容完整性 100%
    - 格式正确性 100%
    - 可用性 ≥9/10
````

### 更新 validation_criteria

在第4步的 `validation_criteria` 中添加：

```yaml
validation_criteria:
  - architecture_design_complete
  - data_models_designed
  - api_specifications_complete
  - service_layer_designed
  - database_scripts_generated
  - risks_identified
  - quality_self_check_passed
  - architecture_documents_sharded # 新增
  - seven_module_documents_created # 新增
  - files_created:
      - "docs/architecture/iteration-backend-design.md"
      - "docs/architecture/db-migration-scripts.sql"
      - "docs/architecture/database-design.md" # 新增
      - "docs/architecture/api-design.md" # 新增
      - "docs/architecture/service-integration.md" # 新增
      - "docs/architecture/migration-plan.md" # 新增
      - "docs/architecture/coding-standards.md" # 新增
      - "docs/architecture/tech-stack.md" # 新增
      - "docs/architecture/project-structure.md" # 新增
```

### 更新 on_success 消息

```yaml
on_success:
  action: finalize_requirements_analysis
  message: "✅ 后端架构增量设计完成，架构文档已按模块切分" # 修改
```

### 更新第4步的 notes

在原有 notes 末尾添加：

```yaml
notes: |
  Architect 后端架构增量设计的完整流程：
  1. 执行 *agent architect 切换到架构师智能体
  2. 加载 PRD、Epic 文档和现有架构分析
  3. 执行 *create-backend-architecture 命令
     ... (原有内容)
  4. 自评审架构设计质量（18项检查）
  5. 输出架构设计文档和数据库脚本
  6. **执行 shard-doc 切分架构文档**（新增）
     - 将 iteration-backend-design.md 按技术模块切分
     - 生成7个子文档：database-design, api-design, service-integration,
       migration-plan, coding-standards, tech-stack, project-structure
  7. 验证切分质量（15项检查）

  关键输出：
  - iteration-backend-design.md：完整的架构设计文档
  - db-migration-scripts.sql：数据库变更脚本
  - 7个技术模块子文档：便于开发团队查阅

  增量设计要点：
  - 基于现有架构扩展
  - 保持一致性和兼容性
  - 关注性能和安全
  - 提供清晰的实施路径
  - **模块化文档便于团队协作**（新增）
```

## 更新完成报告

### 更新 section_2_outputs

在第6步 `finalize_requirements_analysis_workflow` 的报告结构中：

```yaml
section_2_outputs:
  - 需求分析报告: "docs/requirements/requirements-analysis.md"
  - 架构分析报告: "docs/architecture/current-architecture-analysis.md"
  - PRD 文档: "docs/prd/brownfield-iteration-prd.md"
  - Epic 文档清单: "docs/epics/Epic-*.md"
  - 架构设计文档: "docs/architecture/iteration-backend-design.md"
  - 数据库脚本: "docs/architecture/db-migration-scripts.sql"
  - 架构模块文档: # 新增
      - "docs/architecture/database-design.md"
      - "docs/architecture/api-design.md"
      - "docs/architecture/service-integration.md"
      - "docs/architecture/migration-plan.md"
      - "docs/architecture/coding-standards.md"
      - "docs/architecture/tech-stack.md"
      - "docs/architecture/project-structure.md"
```

### 更新完成通知消息

```yaml
- step: notify_completion
  action: display_completion_message
  message: |
    🎉 需求分析自动化工作流完成！

    ✅ 已完成的工作：
    1. 需求分析和澄清（Analyst）
    2. 现有架构分析（Architect）
    3. Brownfield PRD 创建（PM）
    4. Epic 模块拆分（PM）
    5. 后端架构增量设计（Architect）
    6. 数据库迁移脚本生成
    7. 架构文档模块化切分（新增）

    📄 生成的文档：
    - docs/requirements/requirements-analysis.md
    - docs/architecture/current-architecture-analysis.md
    - docs/prd/brownfield-iteration-prd.md
    - docs/epics/Epic-*.md ({epic_count} 个模块)
    - docs/architecture/iteration-backend-design.md
    - docs/architecture/db-migration-scripts.sql
    - docs/architecture/database-design.md（新增）
    - docs/architecture/api-design.md（新增）
    - docs/architecture/service-integration.md（新增）
    - docs/architecture/migration-plan.md（新增）
    - docs/architecture/coding-standards.md（新增）
    - docs/architecture/tech-stack.md（新增）
    - docs/architecture/project-structure.md（新增）

    🚀 下一步：
    可以启动 automated-story-development.yaml 工作流进行用户故事开发。

    架构文档使用指南：
    📖 完整架构：iteration-backend-design.md
    🔍 数据库设计：database-design.md
    🔍 API 设计：api-design.md
    🔍 服务集成：service-integration.md
    🔍 迁移计划：migration-plan.md
    🔍 编码规范：coding-standards.md
    🔍 技术栈：tech-stack.md
    🔍 项目结构：project-structure.md

    准备就绪！可以开始用户故事自动化开发流程。
```

## 更新文档状态管理

### 添加新的文档状态

```yaml
document_states:
  - Draft: "文档已创建，等待验证"
  - Validated: "文档已验证，质量合格"
  - Sharded: "文档已切分为模块文档" # 新增
  - Approved: "文档已批准，可以使用"
```

## 更新质量门控

### 添加架构切分质量门控

```yaml
quality_gates:
  # ... 原有质量门控 ...

  architecture_sharding: # 新增
    required_files:
      - docs/architecture/database-design.md
      - docs/architecture/api-design.md
      - docs/architecture/service-integration.md
      - docs/architecture/migration-plan.md
      - docs/architecture/coding-standards.md
      - docs/architecture/tech-stack.md
      - docs/architecture/project-structure.md
    validation_rules:
      - 所有7个文件已创建
      - 内容完整无丢失
      - 格式正确（Markdown）
      - 独立可读
      - 交叉引用清晰
```

## 更新成功标准

```yaml
success_criteria:
  # ... 原有成功标准 ...

  architecture_sharding: # 新增
    - all_seven_module_documents_created
    - content_completeness: "100%"
    - no_information_loss: true
    - markdown_format_correct: true
    - cross_references_updated: true
    - documents_independently_readable: true

  overall_workflow:
    - all_documents_generated
    - all_quality_gates_passed
    - architecture_documents_sharded # 新增
    - ready_for_story_development: true
    - total_duration: "1.5-2.5 hours" # 可能增加 10-15 分钟
```

## 更新输出文档清单

在 `decision_guidance.outputs` 中添加：

```yaml
  decision_guidance:
    outputs:
      - 需求分析报告
      - 现有架构分析报告
      - Brownfield PRD 文档
      - Epic 模块文档（多个）
      - 后端架构增量设计文档
      - 数据库迁移脚本
      - 架构模块文档（7个）：  # 新增
          - database-design.md
          - api-design.md
          - service-integration.md
          - migration-plan.md
          - coding-standards.md
          - tech-stack.md
          - project-structure.md
```

## 切分后的文档结构示例

### database-design.md 示例

````markdown
# 数据库设计

> **来源**: iteration-backend-design.md - 第2节 新增数据模型设计
> **最后更新**: 2024-01-15
> **状态**: Validated

## 概述

本文档描述此次迭代新增的数据模型设计，包括 Entity 类、数据表结构、关联关系和数据迁移策略。

## 1. 新增 Entity 实体类

### 1.1 User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    // ... 更多字段
}
```
````

## 2. 数据表结构（DDL）

### 2.1 users 表

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    ...
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 3. 与现有实体的关联关系

### 3.1 外键关系

- User → Profile (一对一)
- User → Orders (一对多)

## 4. 数据迁移策略

### 4.1 新表创建

（迁移脚本）

### 4.2 数据初始化

（初始化脚本）

## 参考

- 完整架构设计：[iteration-backend-design.md](./iteration-backend-design.md)
- API 设计：[api-design.md](./api-design.md)
- 迁移计划：[migration-plan.md](./migration-plan.md)

```

## 修改总结

### 主要变更

1. **在第4步添加2个新步骤**：
   - `shard_architecture_document`：执行架构文档切分
   - `validate_sharded_documents`：验证切分质量

2. **更新验证标准**：
   - 添加架构文档切分相关的验证项
   - 新增7个子文档的文件检查

3. **更新输出报告**：
   - 在完成报告中列出7个新增的架构模块文档
   - 更新文档使用指南

4. **更新质量门控**：
   - 新增架构切分质量门控
   - 定义切分质量标准

### 生成的文档总数

- **原有**: 9-15 个文档
- **新增**: 7 个架构模块文档
- **修改后总数**: 16-22 个文档

### 耗时影响

- **原有耗时**: 1.5-2.5 小时
- **切分步骤**: +10-15 分钟
- **修改后总耗时**: 1.67-2.75 小时（约 1小时40分钟 到 2小时45分钟）

## 下一步操作

1. 修改 `xiaoma-core/workflows/automated-requirements-analysis.yaml` 文件
2. 在第4步的 `detailed_steps` 中插入上述两个新步骤
3. 更新相关的验证标准和输出报告
4. 测试工作流，确保切分功能正常工作
```
