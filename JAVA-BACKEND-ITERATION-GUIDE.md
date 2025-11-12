# 🎯 Java 后端迭代开发完整操作手册

> **适用场景**：已有 Java 代码库 + PM 提供的 req.txt 需求文档
>
> **开发模式**：手动精细化模式（逐步调用各个 Agent）
>
> **文档版本**：v1.0
>
> **最后更新**：2025-01-15

---

## 📋 前置条件确认

- ✅ 现有 Java 代码库（假设路径：`/your-project/`）
- ✅ PM 提供的需求文档（`req.txt`）
- ✅ 已安装 xiaoma-core 到项目目录
- ✅ 项目目录结构：
```
/your-project/
├── src/                 # Java 源码
├── docs/               # 文档目录
│   ├── prd/           # PRD 和史诗
│   └── stories/       # 用户故事
├── .xiaoma-core/      # xiaoma-core 配置
└── req.txt            # PM 提供的需求文档
```

---

## 🚀 完整操作链路（7 个阶段）

---

## **阶段 1：需求理解和 PRD 创建**

### 📍 **步骤 1.1：激活 Architect Agent 了解现有架构**

**目的**：在创建 PRD 之前，先了解现有系统架构，确保新需求与现有架构兼容。

#### 操作步骤：

**① 进入项目目录**
```bash
cd /your-project/
```

**② 激活 xiaoma-orchestrator 并切换到 architect**
```bash
# 在 IDE 中（如 Cursor/Claude Code）或 Web UI 中
*agent architect
```

**③ 发送 Prompt**
```
请分析当前项目的后端架构。

**项目信息**：
- 项目类型：Java 后端项目（现有代码库）
- 技术栈：从当前项目的 docs/architecture/current-architecture-analysis.md 中获取技术栈信息
- 主要业务领域：从当前项目的 docs/architecture/current-architecture-analysis.md 中获取业务领域信息

**分析要求**：
1. 扫描项目目录结构
2. 识别技术栈和框架
3. 分析现有数据库设计
4. 识别现有 API 端点
5. 总结架构模式和设计原则

**输出要求**：
请生成一份简要的架构分析报告，包含：
- 技术栈清单
- 分层架构说明
- 数据库实体清单
- API 模块清单
- 架构特点和注意事项

这份报告将用于后续需求的技术设计。
```

**期望输出**：
- 架构分析报告（Markdown 格式）
- 保存到 `docs/architecture/current-architecture-analysis.md`

---

### 📍 **步骤 1.2：使用 PM Agent 创建 Brownfield PRD**

**目的**：将 PM 提供的 req.txt 转化为结构化的 PRD 文档。

#### 操作步骤：

**① 切换到 PM Agent**
```bash
*agent pm
```

**② 发送 Prompt**
```
我需要为现有 Java 后端项目创建一份迭代需求的 PRD 文档。

**项目背景**：
- 项目名称：从当前项目的实际名称（可从 pom.xml 或 settings.gradle 中获取）
- 项目类型：现有 Java 后端项目（Brownfield）
- 技术栈：从当前项目的 docs/architecture/current-architecture-analysis.md 中获取
- 现有功能：从当前项目的 docs/architecture/current-architecture-analysis.md 中获取功能概述

**需求来源**：
产品经理提供的需求文档内容如下：
---
当前项目的 docs/req.txt 文档中需求内容
---

**任务要求**：
请使用 *create-brownfield-prd 命令创建 PRD 文档。

**PRD 应包含**：
1. 需求概述
2. 目标用户和使用场景
3. 功能需求详细描述
4. 非功能需求（性能、安全、兼容性）
5. 技术约束（基于现有架构）
6. 数据需求（数据库变更）
7. API 需求（新增/修改的接口）
8. 验收标准
9. 实施计划（史诗拆分建议）

**特别注意**：
- 这是现有项目的迭代需求，需要考虑与现有系统的兼容性
- 数据库设计需要考虑迁移策略
- API 设计需要遵循现有的 RESTful 规范

请开始执行 *create-brownfield-prd
```

**③ Agent 执行命令**
```bash
# PM Agent 会自动执行
*create-brownfield-prd
```

**期望输出**：
- PRD 文档：`docs/prd/云链API平台需求文档.md`（或类似文件名）
- 包含完整的需求描述、功能列表、验收标准等

**④ 验证 PRD 质量**

发送验证 Prompt：
```
请审查刚才创建的 PRD 文档，确认：
1. ✓ 所有功能需求都已覆盖（对照 req.txt）
2. ✓ 技术约束与现有架构兼容
3. ✓ 数据库变更已明确定义
4. ✓ API 接口需求清晰
5. ✓ 验收标准可测试

如果有遗漏或不清晰的地方，请指出并补充。
```

---

### 📍 **步骤 1.3：拆分史诗（针对大型需求）**

**判断依据**：如果 PRD 包含多个独立的功能模块（≥3个），建议拆分为史诗。

#### 操作步骤：

**① 保持 PM Agent 激活状态**

**② 发送 Prompt（针对每个史诗）**
```
基于刚才创建的 PRD，我需要创建史诗。

**史诗拆分建议**：
根据 PRD 的功能模块，建议拆分为以下史诗：
1. [史诗1名称]：[功能描述]
2. [史诗2名称]：[功能描述]
3. [史诗3名称]：[功能描述]

**当前任务**：
请为第一个史诗"[史诗1名称]"创建史诗文档。

**史诗信息**：
- 史诗名称：[史诗1名称]
- 功能范围：[详细描述此史诗包含的功能]
- 业务价值：[业务价值说明]
- 优先级：高/中/低
- 依赖关系：[是否依赖其他史诗]

**史诗文档要求**：
1. 史诗级别的目标和价值
2. 包含的用户故事清单（初步识别）
3. 技术设计概要（针对此史诗）
4. 数据库变更（针对此史诗）
5. API 接口清单（针对此史诗）
6. 验收标准
7. 估算工作量

请执行 *create-epic 命令。
```

**③ Agent 执行命令**
```bash
*create-epic
```

**期望输出**：
- 史诗文档：`docs/prd/史诗-[名称].md`
- 对每个史诗重复此步骤

---

## **阶段 2：技术架构设计（针对新需求）**

### 📍 **步骤 2.1：后端架构增量设计**

**目的**：基于现有架构，设计新需求的技术实现方案。

#### 操作步骤：

**① 切换到 Architect Agent**
```bash
*agent architect
```

**② 发送 Prompt**
```
基于现有系统架构，我需要设计此次迭代需求的技术实现方案。

**现有架构**：
当前项目的 docs/architecture/current-architecture-analysis.md 文档中架构分析报告摘要

**新需求概述**：
当前项目的 docs/prd/云链API平台需求文档.md 中功能需求摘要

**设计任务**：
请基于 *create-backend-architecture 命令，但聚焦于增量设计，包括：

**1. 新增数据模型设计**：
- 新增实体类（Java Entity）
- 表结构设计（DDL）
- 与现有实体的关联关系
- 数据迁移策略

**2. API 设计**：
- 新增 RESTful API 端点列表
- 请求/响应 DTO 设计
- API 版本策略（如需要）
- 与现有 API 的集成点

**3. 服务层设计**：
- 新增 Service 接口和实现
- 业务逻辑流程图
- 事务边界设计
- 与现有服务的交互

**4. 技术决策**：
- 新技术/组件的引入（如需要）
- 性能优化策略
- 安全性考虑（认证/授权）
- 缓存策略

**5. 数据库变更**：
- 新增表的 DDL
- 现有表的 ALTER 脚本
- 索引优化
- 数据迁移脚本

**6. 技术风险和注意事项**：
- 兼容性风险
- 性能影响
- 技术债务

**特别要求**：
- 遵循现有项目的编码规范和架构模式
- 确保向后兼容
- 考虑可测试性

请执行设计并生成文档。
```

**③ Agent 生成架构设计**

**期望输出**：
- 后端架构设计文档：`docs/architecture/iteration-backend-design.md`
- 数据库变更脚本：`docs/architecture/db-migration-scripts.sql`

**④ 架构评审 Prompt**
```
请对刚才的架构设计进行自我评审，检查：
1. ✓ 是否与现有架构一致
2. ✓ 数据模型是否合理（范式、性能）
3. ✓ API 设计是否符合 RESTful 规范
4. ✓ 是否有技术风险未识别
5. ✓ 是否考虑了可测试性

如有问题，请指出并提供改进建议。
```

---

## **阶段 3：用户故事创建和细化**

### 📍 **步骤 3.1：识别用户故事列表**

**目的**：从 PRD/Epic 中识别出所有需要开发的用户故事。

#### 操作步骤：

**① 切换到 SM Agent**
```bash
*agent sm
```

**② 发送 Prompt**
```
基于 PRD 和架构设计，我需要识别并列出所有用户故事。

**PRD 文档**：`docs/prd/云链API平台需求文档.md`
**架构设计**：`docs/architecture/iteration-backend-design.md`

**任务要求**：
1. 分析 PRD 中的功能需求
2. 结合架构设计的技术实现
3. 识别出所有独立的用户故事
4. 按优先级排序

**用户故事清单格式**：
请以表格形式列出所有用户故事：

| 编号 | 故事名称 | 所属史诗 | 优先级 | 估算复杂度 | 依赖 |
|------|---------|---------|--------|----------|------|
| US-01 | [名称] | Epic-01 | 高 | 中 | 无 |
| US-02 | [名称] | Epic-01 | 高 | 高 | US-01 |
| ... | ... | ... | ... | ... | ... |

**估算复杂度标准**（Java 后端）：
- 低：单表 CRUD，1-2 个 API
- 中：多表关联，3-5 个 API，中等业务逻辑
- 高：复杂业务逻辑，多表事务，5+ 个 API

请生成用户故事清单。
```

**期望输出**：
- 用户故事清单表格
- 建议开发顺序

---

### 📍 **步骤 3.2：创建增强版用户故事（逐个）**

**重要提示**：每个用户故事都需要执行此步骤。以下是针对第一个故事的详细操作，后续故事类推。

#### 操作步骤：

**① 保持 SM Agent 激活状态**

**② 针对第一个用户故事，发送 Prompt**
```
请为用户故事 US-01 创建增强版用户故事文档。

**故事基本信息**：
- 故事 ID：US-01
- 故事名称：[从清单中获取]
- 所属史诗：[Epic 名称]
- 优先级：高/中/低
- 估算复杂度：低/中/高

**业务需求**（来自 PRD）：
当前项目的 docs/prd/云链API平台需求文档.md 中与此故事相关的需求描述

**技术设计参考**（来自架构文档）：
当前项目的 docs/architecture/iteration-backend-design.md 中与此故事相关的技术设计

**任务要求**：
请执行 *draft-enhanced 命令，创建包含以下内容的用户故事文档：

**1. 用户故事描述**：
- 标准格式："作为 [角色]，我希望 [功能]，以便 [价值]"
- 背景和上下文
- 业务流程描述

**2. 验收标准**（SMART 原则）：
- 至少 3-5 条可测试的验收标准
- 包含正常流程和异常流程
- 明确数据验证规则

**3. 数据库设计相关**（重点！）：
**3.1 涉及的数据库实体**：
| 实体名称 | 表名 | 主要用途 | 关键字段 | 是否新增 |
|---------|------|---------|---------|---------|
| [实体] | [表名] | [用途] | [字段列表] | 是/否 |

**3.2 数据操作清单**：
- 查询操作（SELECT）：列出所有查询场景
- 插入操作（INSERT）：列出插入场景
- 更新操作（UPDATE）：列出更新场景
- 删除操作（DELETE）：列出删除场景

**3.3 业务规则约束**：
- 数据验证规则
- 唯一性约束
- 外键关系
- 默认值

**3.4 数据库表结构（DDL）**：
```sql
-- 如果是新表，提供完整 CREATE TABLE 语句
-- 如果是修改表，提供 ALTER TABLE 语句
```

**4. API 接口规范**（重点！）：
**4.1 API 端点清单**：
| 序号 | 接口名称 | HTTP方法 | 路径 | 说明 | 状态 |
|------|---------|---------|------|------|------|
| 1 | [名称] | POST/GET/PUT/DELETE | /api/v1/... | [说明] | 待开发 |

**4.2 API 详细设计**（每个端点）：
对于每个 API，包含：
- 接口描述
- HTTP 方法和路径
- 请求参数（Path/Query/Body）
- 请求 DTO 类设计（Java 类结构）
- 响应数据结构
- 响应 DTO 类设计（Java 类结构）
- HTTP 状态码定义
- 错误码定义
- 请求示例（JSON）
- 响应示例（JSON）

**4.3 数据映射关系**：
- DTO 到 Entity 的映射
- 字段转换逻辑

**5. 任务/子任务分解**（Java 后端）：
**后端开发任务**：
- [ ] 创建/修改 Entity 类（`entity/[ClassName].java`）
- [ ] 创建 DTO 类（`dto/[ClassName]DTO.java`）
- [ ] 创建 Mapper 接口（`mapper/[ClassName]Mapper.java`）
- [ ] 创建 Mapper XML（`mapper/xml/[ClassName]Mapper.xml`）
- [ ] 创建 Service 接口（`service/[ClassName]Service.java`）
- [ ] 创建 Service 实现（`service/impl/[ClassName]ServiceImpl.java`）
- [ ] 创建 Controller（`controller/[ClassName]Controller.java`）
- [ ] 配置文件更新（如需要）

**测试任务**：
- [ ] Service 单元测试（JUnit + Mockito）
- [ ] Mapper 集成测试（Spring Boot Test）
- [ ] Controller API 测试（MockMvc）
- [ ] 端到端业务流程测试

**数据库任务**：
- [ ] 执行 DDL 脚本（开发环境）
- [ ] 数据迁移脚本（如需要）
- [ ] 验证数据完整性

**6. 开发者说明**：
- 技术实现要点
- 需要注意的现有代码
- 性能优化建议
- 安全性考虑（SQL 注入、XSS 等）
- 异常处理策略
- 日志记录要求

**7. 技术约束**：
- 使用的框架版本
- 编码规范
- 与现有代码的集成点
- 不能修改的现有代码

**8. 测试策略**：
- 单元测试覆盖率要求（≥80%）
- 集成测试场景
- API 测试用例

**特别要求**：
- 这是现有项目，需要明确标注哪些是新增、哪些是修改
- 数据库设计要考虑数据迁移
- API 设计要保持与现有 API 的一致性
- 所有 Java 类名、包名要符合现有项目规范

请执行 *draft-enhanced 命令。
```

**③ Agent 执行命令并生成文档**
```bash
*draft-enhanced
```

**期望输出**：
- 用户故事文档：`docs/stories/epic01-story01.md`
- 文档状态：`Draft`（草稿）

**④ 验证故事质量 Prompt**
```
请对刚才创建的用户故事文档进行自检，确认：

**完整性检查**：
1. ✓ 用户故事格式正确
2. ✓ 验收标准清晰可测试（≥3条）
3. ✓ 数据库设计完整（实体、DDL、操作清单）
4. ✓ API 接口规范完整（端点、DTO、示例）
5. ✓ 任务分解细致（前后端、测试）
6. ✓ 开发者说明详细

**Java 后端特定检查**：
7. ✓ Entity 类设计合理（JPA 注解、字段类型）
8. ✓ Mapper 接口符合 MyBatis 规范
9. ✓ Service 层职责清晰
10. ✓ Controller 遵循 RESTful 规范
11. ✓ DTO 设计合理（字段验证注解）
12. ✓ 异常处理策略明确

**兼容性检查**：
13. ✓ 与现有数据模型兼容
14. ✓ 与现有 API 风格一致
15. ✓ 遵循现有编码规范

如有问题或遗漏，请指出并补充。
```

**⑤ 重复步骤②-④，为每个用户故事创建文档**

---

### 📍 **步骤 3.3：PO 验证用户故事**

**目的**：确保用户故事符合业务需求和质量标准。

#### 操作步骤：

**① 切换到 PO Agent**
```bash
*agent po
```

**② 针对每个用户故事，发送验证 Prompt**
```
请验证用户故事的质量和完整性。

**故事文件**：`docs/stories/epic01-story01.md`

**验证任务**：
请执行 *validate-story-draft 命令，验证以下方面：

**1. INVEST 原则符合度**：
- Independent（独立性）：是否可以独立开发和部署
- Negotiable（可协商性）：需求是否明确但实现方式灵活
- Valuable（有价值）：是否为用户/业务带来价值
- Estimable（可估算）：是否可以估算开发工作量
- Small（适当规模）：是否可以在一个迭代内完成
- Testable（可测试）：验收标准是否明确可测

**2. 业务需求符合度**：
- 是否完整覆盖 PRD 中的需求
- 验收标准是否与 PRD 一致
- 业务流程是否合理

**3. 技术实现可行性**：
- 数据库设计是否合理
- API 设计是否完整
- 技术方案是否可行

**4. 文档质量**：
- 是否符合模板要求
- 描述是否清晰无歧义
- 是否包含所有必要信息

**验证决策**：
- ✅ 通过：故事状态更新为 "Approved"
- ❌ 不通过：列出问题清单，返回 SM 修改

请执行验证。
```

**③ Agent 执行验证**
```bash
*validate-story-draft
```

**期望输出**：
- 验证通过：故事状态更新为 `Approved`
- 验证不通过：问题清单，需返回步骤 3.2 修改

**④ 如果不通过，返回 SM Agent 修改**
```bash
*agent sm

# 发送修改 Prompt
基于 PO 的反馈，请修改用户故事 US-01。

**PO 反馈的问题**：
当前项目的 docs/stories/epic01-story01.md 中 PO 验证反馈的问题清单（或从 PO 的验证结果中获取）

**修改要求**：
请针对每个问题进行修改，确保：
1. 问题已解决
2. 不引入新问题
3. 保持文档一致性

请更新文档并说明修改内容。
```

**⑤ 重复验证，直到所有故事都通过**

---

## **阶段 4：Java 后端开发实现（逐个故事）**

### 📍 **步骤 4.1：开发用户故事（第一个故事）**

**重要提示**：每个故事都需要完整执行此开发流程。

#### 操作步骤：

**① 切换到 Dev Agent**
```bash
*agent dev
```

**② 发送开发 Prompt**
```
请开发用户故事 US-01 的 Java 后端代码。

**故事文件**：`docs/stories/epic01-story01.md`

**项目信息**：
- 项目路径：`/your-project/`
- 包名：从当前项目代码中获取实际包名（查看现有 Java 类的 package 声明）
- 技术栈：从当前项目的 docs/architecture/current-architecture-analysis.md 中获取技术栈信息

**开发任务**：
请执行 *develop-story 命令，完成以下开发任务：

**阶段 1：数据层开发**
1. **创建/修改 Entity 类**：
   - 文件路径：`src/main/java/com/example/yourproject/entity/[ClassName].java`
   - JPA 注解配置（@Entity, @Table, @Id, @Column 等）
   - 字段定义（根据故事中的表结构）
   - Getter/Setter（或使用 Lombok @Data）
   - 关联关系（@OneToMany, @ManyToOne 等）

2. **创建 Mapper 接口**：
   - 文件路径：`src/main/java/com/example/yourproject/mapper/[ClassName]Mapper.java`
   - 继承 `BaseMapper<Entity>`（MyBatis-Plus）
   - 自定义查询方法声明

3. **创建 Mapper XML**（如需复杂查询）：
   - 文件路径：`src/main/resources/mapper/[ClassName]Mapper.xml`
   - namespace 配置
   - ResultMap 定义
   - SQL 语句（SELECT, INSERT, UPDATE, DELETE）

**阶段 2：DTO 设计**
4. **创建请求 DTO**：
   - 文件路径：`src/main/java/com/example/yourproject/dto/[ClassName]RequestDTO.java`
   - 字段定义
   - 验证注解（@NotNull, @NotBlank, @Size 等）

5. **创建响应 DTO**：
   - 文件路径：`src/main/java/com/example/yourproject/dto/[ClassName]ResponseDTO.java`
   - 字段定义
   - 嵌套对象处理

**阶段 3：服务层开发**
6. **创建 Service 接口**：
   - 文件路径：`src/main/java/com/example/yourproject/service/[ClassName]Service.java`
   - 方法定义（根据故事中的业务逻辑）
   - JavaDoc 注释

7. **创建 Service 实现类**：
   - 文件路径：`src/main/java/com/example/yourproject/service/impl/[ClassName]ServiceImpl.java`
   - 实现 Service 接口
   - 注入 Mapper（@Autowired）
   - 业务逻辑实现
   - 事务管理（@Transactional）
   - 异常处理（抛出业务异常）
   - 日志记录

**阶段 4：控制层开发**
8. **创建 Controller**：
   - 文件路径：`src/main/java/com/example/yourproject/controller/[ClassName]Controller.java`
   - 类级别注解（@RestController, @RequestMapping）
   - 注入 Service
   - API 方法实现（根据故事中的 API 清单）：
     - @GetMapping / @PostMapping / @PutMapping / @DeleteMapping
     - 参数绑定（@PathVariable, @RequestParam, @RequestBody）
     - DTO 转 Entity / Entity 转 DTO
     - 调用 Service 方法
     - 返回统一响应格式
   - 参数验证（@Valid）
   - 异常处理（@ExceptionHandler 或全局异常处理）

**阶段 5：配置和工具类（如需要）**
9. **配置类更新**（如需要）：
   - 数据源配置
   - MyBatis 配置
   - 其他 Bean 配置

10. **工具类/常量类**（如需要）：
    - 枚举类
    - 常量类
    - 工具方法

**阶段 6：单元测试**
11. **Service 单元测试**：
    - 文件路径：`src/test/java/com/example/yourproject/service/[ClassName]ServiceTest.java`
    - 测试框架：JUnit 5 + Mockito
    - Mock Mapper 依赖
    - 测试每个 Service 方法：
      - 正常流程
      - 异常流程
      - 边界条件
    - 断言验证
    - 目标覆盖率：≥80%

12. **Mapper 集成测试**：
    - 文件路径：`src/test/java/com/example/yourproject/mapper/[ClassName]MapperTest.java`
    - 使用 @SpringBootTest 和 @Transactional
    - 测试数据库操作（CRUD）
    - 使用测试数据库（H2 或 MySQL Testcontainer）

**阶段 7：API 测试**
13. **Controller 集成测试**：
    - 文件路径：`src/test/java/com/example/yourproject/controller/[ClassName]ControllerTest.java`
    - 使用 MockMvc
    - 测试每个 API 端点：
      - 请求构建
      - 响应状态码验证
      - 响应体验证
      - 参数验证测试
      - 异常场景测试

**阶段 8：文档更新**
14. **更新用户故事文档**：
    - 在"开发者代理记录"部分记录：
      - 开发时间
      - 创建的文件清单
      - 关键技术决策
      - 遇到的问题和解决方案
    - 更新故事状态为 "InProgress" → "Review"

**代码规范要求**：
- 遵循阿里巴巴 Java 开发手册
- 使用现有项目的编码风格
- 添加必要的注释（类、方法、复杂逻辑）
- 统一异常处理
- 统一日志记录（使用 SLF4J）

**安全性要求**：
- 防止 SQL 注入（使用参数化查询）
- 输入验证（DTO 验证注解）
- 敏感数据处理（密码加密等）

**性能要求**：
- 合理使用索引
- 避免 N+1 查询
- 考虑分页（大数据量查询）

请执行 *develop-story 命令。
```

**③ Agent 执行开发**
```bash
*develop-story docs/stories/epic01-story01.md
```

**期望输出**：
- 完整的 Java 代码文件（Entity, Mapper, Service, Controller, DTO, Test）
- 更新后的用户故事文档（开发者记录）

---

### 📍 **步骤 4.2：运行测试**

#### 操作步骤：

**① 保持 Dev Agent 激活**

**② 发送测试 Prompt**
```
请运行刚才开发的代码的所有测试。

**测试任务**：
1. 编译项目（确保没有编译错误）
2. 运行单元测试（Service 和 Mapper 测试）
3. 运行集成测试（Controller API 测试）
4. 生成测试报告

**测试命令**（根据项目构建工具）：
- Maven 项目：`mvn clean test`
- Gradle 项目：`gradle clean test`

**测试要求**：
- 所有测试必须通过（100% pass rate）
- 单元测试覆盖率 ≥80%
- 集成测试覆盖所有 API 端点

**如果测试失败**：
- 分析失败原因
- 修复代码
- 重新运行测试

请执行 *run-tests 命令。
```

**③ Agent 执行测试**
```bash
*run-tests
```

**期望输出**：
- 测试通过报告
- 覆盖率报告
- 如有失败，显示失败原因

**④ 如果测试失败，发送修复 Prompt**
```
测试失败，请修复。

**失败信息**：
测试执行输出的失败日志（从终端或测试报告中复制相关错误堆栈信息）

**修复要求**：
1. 分析失败原因
2. 修复代码或测试
3. 重新运行测试
4. 确保所有测试通过

请修复并重新测试。
```

---

### 📍 **步骤 4.3：代码自检和优化**

#### 操作步骤：

**① 保持 Dev Agent 激活**

**② 发送自检 Prompt**
```
请对刚才开发的代码进行自检和优化。

**自检清单**：

**1. 代码质量**：
- ✓ 代码格式规范（缩进、命名）
- ✓ 无编译警告
- ✓ 无 TODO 或 FIXME 注释（或已记录）
- ✓ 代码可读性良好
- ✓ 遵循 SOLID 原则

**2. 功能完整性**：
- ✓ 实现了所有验收标准
- ✓ 覆盖了所有 API 端点
- ✓ 实现了所有数据库操作

**3. 异常处理**：
- ✓ 所有异常都有适当处理
- ✓ 统一异常响应格式
- ✓ 关键异常有日志记录

**4. 性能优化**：
- ✓ SQL 查询优化（避免 N+1）
- ✓ 合理使用索引
- ✓ 大数据量查询使用分页
- ✓ 避免不必要的对象创建

**5. 安全性**：
- ✓ 防止 SQL 注入
- ✓ 输入验证完整
- ✓ 敏感数据保护
- ✓ 适当的权限控制

**6. 测试覆盖**：
- ✓ 单元测试覆盖率 ≥80%
- ✓ 所有 API 有集成测试
- ✓ 异常场景有测试

**7. 文档完整性**：
- ✓ 关键类有 JavaDoc
- ✓ 复杂方法有注释
- ✓ API 文档完整

**优化建议**：
如果发现可以优化的地方，请提出建议并实施。

请执行自检并报告结果。
```

**期望输出**：
- 自检报告
- 优化建议（如有）
- 优化后的代码（如有）

---

## **阶段 5：QA 测试和质量门禁**

### 📍 **步骤 5.1：QA 综合审查**

#### 操作步骤：

**① 切换到 QA Agent**
```bash
*agent qa
```

**② 发送审查 Prompt**
```
请对用户故事 US-01 进行全面的 QA 审查。

**故事文件**：`docs/stories/epic01-story01.md`

**审查任务**：
请执行 *review 命令，进行以下审查：

**1. 需求符合度审查**：
- ✓ 是否实现了所有验收标准
- ✓ 功能是否符合用户故事描述
- ✓ 是否覆盖了所有业务场景
- ✓ 异常流程是否处理

**2. 代码质量审查（Java 后端）**：
**2.1 架构层面**：
- ✓ 分层架构正确（Controller → Service → Mapper）
- ✓ 职责分离清晰
- ✓ 依赖关系合理

**2.2 Entity 层**：
- ✓ JPA 注解正确
- ✓ 字段类型合理
- ✓ 关联关系正确
- ✓ 索引设计合理

**2.3 Mapper 层**：
- ✓ SQL 语句正确
- ✓ 参数绑定安全（防 SQL 注入）
- ✓ ResultMap 配置正确
- ✓ 查询性能可接受

**2.4 Service 层**：
- ✓ 业务逻辑正确
- ✓ 事务边界合理
- ✓ 异常处理完整
- ✓ 日志记录适当

**2.5 Controller 层**：
- ✓ RESTful 规范符合
- ✓ 参数验证完整
- ✓ DTO 转换正确
- ✓ 响应格式统一

**2.6 代码规范**：
- ✓ 命名规范
- ✓ 注释完整
- ✓ 格式统一
- ✓ 无冗余代码

**3. API 测试**：
**3.1 功能测试**（每个 API 端点）：
- ✓ 正常请求正确响应
- ✓ HTTP 状态码正确
- ✓ 响应数据结构正确
- ✓ 参数验证生效
- ✓ 错误信息清晰

**3.2 数据验证**：
- ✓ 数据库操作正确（CRUD）
- ✓ 数据完整性约束生效
- ✓ 事务回滚正确
- ✓ 数据一致性保证

**3.3 异常场景**：
- ✓ 参数错误处理
- ✓ 数据不存在处理
- ✓ 并发冲突处理
- ✓ 系统异常处理

**4. 性能测试（初步）**：
- ✓ API 响应时间（正常 <500ms）
- ✓ SQL 查询效率（查看执行计划）
- ✓ 资源占用（内存、CPU）

**5. 安全性审查**：
- ✓ SQL 注入防护
- ✓ XSS 攻击防护
- ✓ CSRF 防护（如需要）
- ✓ 权限控制（如需要）
- ✓ 敏感数据保护

**6. 测试覆盖率审查**：
- ✓ 单元测试覆盖率 ≥80%
- ✓ 集成测试覆盖所有 API
- ✓ 关键业务逻辑有测试
- ✓ 异常场景有测试

**7. 文档审查**：
- ✓ 用户故事文档更新完整
- ✓ 开发者记录详细
- ✓ API 文档准确
- ✓ 问题和解决方案记录

**审查输出要求**：
1. 详细的审查报告
2. 发现的问题清单（按严重程度分类）：
   - Critical（阻塞）：必须修复
   - Major（重要）：应该修复
   - Minor（次要）：建议修复
   - Suggestion（建议）：优化建议
3. 测试结果汇总
4. 质量评分（0-100）

**特别关注（Java 后端）**：
- 数据库操作的正确性和性能
- API 接口的规范性和安全性
- 异常处理的完整性
- 事务管理的正确性

请执行 *review 命令。
```

**③ Agent 执行审查**
```bash
*review docs/stories/epic01-story01.md
```

**期望输出**：
- QA 审查报告
- 问题清单（如有）
- 质量评分
- 更新用户故事文档的"QA结果"部分

---

### 📍 **步骤 5.2：处理 QA 发现的问题（如有）**

#### 操作步骤：

**① 如果 QA 发现问题，切换回 Dev Agent**
```bash
*agent dev
```

**② 发送修复 Prompt**
```
请根据 QA 审查报告修复发现的问题。

**QA 审查报告**：
当前项目的 docs/stories/epic01-story01.md 中 QA 结果部分的问题清单（或从 QA Agent 的审查结果中获取）

**修复优先级**：
1. Critical 问题：必须立即修复（阻塞发布）
2. Major 问题：应该修复（影响功能）
3. Minor 问题：建议修复（影响体验）
4. Suggestion：可选优化

**修复任务**：
请执行 *review-qa 命令，针对每个问题：
1. 分析问题根因
2. 提出解决方案
3. 修复代码
4. 运行相关测试
5. 验证问题已解决

**修复要求**：
- 不引入新问题
- 保持代码一致性
- 更新相关测试
- 更新文档（如需要）

请开始修复。
```

**③ Agent 执行修复**
```bash
*review-qa docs/stories/epic01-story01.md
```

**④ 修复后重新测试**
```bash
*run-tests
```

**⑤ 返回 QA Agent 重新审查**
```bash
*agent qa
*review docs/stories/epic01-story01.md
```

**⑥ 循环此过程，直到所有问题解决**

---

### 📍 **步骤 5.3：质量门禁决策**

#### 操作步骤：

**① 保持 QA Agent 激活**

**② 发送门禁决策 Prompt**
```
请对用户故事 US-01 进行质量门禁决策。

**故事文件**：`docs/stories/epic01-story01.md`

**决策任务**：
请执行 *gate 命令，基于以下标准做出 Go/No-Go 决策：

**质量门禁标准**：

**必须通过（Go 的前提）**：
1. ✅ 所有验收标准已实现
2. ✅ 所有测试通过（100% pass rate）
3. ✅ 无 Critical 问题
4. ✅ 无 Major 问题（或已修复）
5. ✅ 代码覆盖率 ≥80%
6. ✅ API 测试全部通过
7. ✅ 数据库操作正确
8. ✅ 安全性审查通过

**推荐通过（建议）**：
9. ✅ 无 Minor 问题（或已记录）
10. ✅ 代码规范符合
11. ✅ 性能测试通过
12. ✅ 文档完整

**决策结果**：
- ✅ **Go（通过）**：
  - 满足所有"必须通过"条件
  - 故事状态更新为 "Done"
  - 可以部署到测试环境

- ❌ **No-Go（不通过）**：
  - 存在阻塞问题
  - 列出必须解决的问题
  - 返回 Dev 修复
  - 故事状态保持 "Review"

**决策记录**：
请在用户故事文档的"QA结果"部分记录：
- 决策结果（Go/No-Go）
- 决策理由
- 剩余问题清单（如有）
- QA 签字和日期

请执行 *gate 命令并做出决策。
```

**③ Agent 执行门禁决策**
```bash
*gate docs/stories/epic01-story01.md
```

**期望输出**：
- Go/No-Go 决策
- 决策理由
- 故事状态更新

**④ 如果 No-Go，返回步骤 5.2 修复问题**

---

### 📍 **步骤 5.4：重复阶段 4 和阶段 5，完成所有用户故事**

**重要提示**：对每个用户故事重复步骤 4.1 - 5.3，直到所有故事都完成。

---

## **阶段 6：需求覆盖度审计和全局质量验证**

### 📍 **步骤 6.1：需求覆盖度审计**

**目的**：验证所有需求都已实现，无遗漏。

#### 操作步骤：

**① 切换到 XiaoMa Master（使用 requirements-coverage-auditor）**
```bash
*agent xiaoma-master
```

**② 发送审计 Prompt**
```
请对整个迭代需求进行全面的覆盖度审计。

**审计范围**：
- PRD 文档：`docs/prd/云链API平台需求文档.md`
- 史诗文档：`docs/prd/史诗-*.md`（如有）
- 所有用户故事：`docs/stories/epic*-story*.md`

**审计任务**：
请加载 requirements-coverage-auditor.yaml 配置，执行以下审计：

**1. 文档发现和解析**：
- 扫描并解析 PRD 文档
- 提取所有功能需求
- 提取所有非功能需求
- 扫描所有已实施的用户故事
- 解析故事的实施状态

**2. 需求映射分析**：
- 构建需求层次结构（PRD → Epic → Story）
- 创建需求覆盖度矩阵
- 识别需求到故事的映射关系
- 检测未映射的需求
- 检测孤立的故事

**3. 实施完整性验证**（4 层验证）：
**第 1 层：结构完整性**（权重 25%）
- 用户故事文档结构完整
- 必需章节存在
- 格式规范符合

**第 2 层：内容完整性**（权重 35%）
- 用户故事格式正确
- 验收标准完整
- 数据库设计完整
- API 规范完整
- 任务分解完整

**第 3 层：实施证据**（权重 25%）
- 开发者记录存在
- QA 结果真实
- 文件清单准确
- 实施细节完整

**第 4 层：质量标准**（权重 15%）
- 技术准确性
- 文档清晰度
- 一致性验证
- 业务价值对齐

**4. 差距分析**：
- 识别未覆盖的需求
- 识别质量不达标的故事
- 识别缺失的实施证据
- 生成改进建议

**审计报告要求**：
1. **执行摘要**：
   - 总体评级（优秀/良好/可接受/较差）
   - 关键指标（需求总数、已实施故事、覆盖度）
   - 关键发现
   - 优先改进建议

2. **详细分析**：
   - 需求覆盖度矩阵表格
   - 用户故事完整性分析
   - 需求到故事映射详情
   - 识别的问题和差距

3. **行动计划**：
   - 立即行动项（高优先级）
   - 短期改进计划
   - 长期完善建议

**输出文件**：
- 综合审计报告：`audit-reports/requirements_coverage_audit_{timestamp}.md`
- 覆盖度矩阵数据：`audit-data/coverage_matrix_{timestamp}.json`
- 差距分析报告：`audit-reports/implementation_gaps_{timestamp}.md`

请执行审计。
```

**期望输出**：
- 需求覆盖度审计报告
- 覆盖度百分比（目标：≥95%）
- 差距清单（如有）
- 改进建议

**③ 审查审计报告**

如果发现覆盖度不足（<95%），需要：
1. 识别未覆盖的需求
2. 创建补充用户故事
3. 重复阶段 3-5 完成补充故事

---

### 📍 **步骤 6.2：全局质量验证（7 层验证）**

**目的**：确保所有文档和代码符合最高质量标准。

#### 操作步骤：

**① 保持 XiaoMa Master 激活**

**② 发送质量验证 Prompt**
```
请对整个迭代的交付物进行 7 层全局质量验证。

**验证范围**：
- 所有用户故事文档：`docs/stories/*.md`
- 所有 Java 代码：`src/main/java/**/*.java`
- 所有测试代码：`src/test/java/**/*.java`

**验证任务**：
请加载 automated-quality-validator.yaml 配置，执行以下 7 层验证：

**第 1 层：语法和格式验证**（必须 100%）
- Markdown 语法正确性
- YAML 前置元数据验证
- 模板结构验证
- 内容格式验证
- Java 代码语法检查
- 错误处理：自动纠正

**第 2 层：内容完整性验证**（≥90%）
- 用户故事完整性（格式、验收标准）
- 数据库设计完整性（实体、操作、规则）
- API 规范完整性（端点、DTO、示例）
- 实施指导完整性（任务、文档、QA）
- Java 代码完整性（所有层都实现）

**第 3 层：内容质量验证**（≥87%）
- 技术准确性（数据库、API、代码设计）
- 清晰度和可读性（语言、文档、代码注释）
- 专业质量（一致性、完整性、细节）

**第 4 层：一致性验证**（≥96%）
- 术语一致性（实体命名、API 命名、变量命名）
- 结构一致性（模板遵循、格式统一、代码风格）
- 交叉引用一致性（内部引用、跨文档引用）

**第 5 层：实施可行性验证**（≥83%）
- 数据库设计可行性（schema、关系、性能）
- API 设计可行性（RESTful、数据流、错误处理）
- 任务可行性（分解、依赖、估算）

**第 6 层：业务价值验证**（≥82%）
- 需求可追溯性（验收标准、用户故事、业务影响）
- 用户体验影响（工作流、可用性、性能）

**第 7 层：最终集成验证**（≥90%）
- 端到端文档流程（逻辑、完整性、一致性）
- 质量指标达成（所有层次验证通过）
- 交付准备（开发就绪、测试完整、文档完善）

**质量纠错和改进**：
如果某层验证失败：
1. Critical 问题：立即自动纠正（最多 3 次尝试）
2. Quality 问题：迭代改进（最多 2 轮）
3. Feasibility 问题：专家系统优化

**验证报告要求**：
1. **实时质量仪表板**：
   - 逐层验证状态
   - 质量分数实时更新
   - 纠正活动日志
   - 整体进度指示器

2. **综合质量报告**：
   - 执行摘要（高层质量概览）
   - 详细层次分析（每层验证结果）
   - 改进建议（可操作的增强建议）
   - 质量认证（正式质量证明）

**成功标准**：
- 整体质量分数 ≥90
- Critical 失败数 = 0
- 所有文档符合标准
- 所有代码通过验证

**输出文件**：
- 质量验证报告：`quality-reports/quality_validation_{timestamp}.md`
- 层次分析详情：`quality-reports/layer_analysis_{timestamp}.json`

请执行 7 层质量验证。
```

**期望输出**：
- 7 层质量验证报告
- 整体质量评分（目标：≥90）
- 问题清单（如有）
- 纠正措施记录

**③ 处理质量问题**

如果质量评分 <90 或存在 Critical 问题：
1. 识别问题所在（哪一层、哪个故事/文件）
2. 返回相应 Agent 修复（Dev/SM/QA）
3. 重新验证

---

## **阶段 7：文档整理和交付准备**

### 📍 **步骤 7.1：生成完成故事汇总**

#### 操作步骤：

**① 切换到 PO Agent**
```bash
*agent po
```

**② 发送汇总生成 Prompt**
```
请生成本次迭代的已完成用户故事汇总文档。

**任务要求**：
创建文件：`docs/stories/COMPLETED_STORIES_SUMMARY.md`

**文档内容**：

**1. 迭代概述**：
- 迭代名称/版本
- 开始/结束日期
- 迭代目标

**2. 完成故事清单**：
| 故事ID | 故事名称 | 所属史诗 | 优先级 | 状态 | 完成日期 | 开发者 |
|--------|---------|---------|-------|------|---------|--------|
| US-01 | [名称] | Epic-01 | 高 | Done | 2025-01-15 | Dev Agent |
| ... | ... | ... | ... | ... | ... | ... |

**3. 完成统计**：
- 总计划故事数：[数量]
- 已完成故事数：[数量]
- 完成率：[百分比]
- 高优先级完成率：[百分比]

**4. 功能交付清单**（按史诗分组）：
**Epic 01: [史诗名称]**
- ✅ [功能1]（US-01）
- ✅ [功能2]（US-02）
- ...

**Epic 02: [史诗名称]**
- ✅ [功能3]（US-03）
- ...

**5. 技术交付物**（Java 后端）：
**新增 Entity**：
- `com.example.entity.User`
- `com.example.entity.Order`
- ...

**新增 API 端点**：
- POST `/api/v1/users` - 用户注册
- GET `/api/v1/users/{id}` - 获取用户信息
- ...

**数据库变更**：
- 新增表：`user`, `order`, `order_item`
- 修改表：`product`（新增字段 `stock`）
- 新增索引：`idx_user_email`, `idx_order_user_id`

**测试统计**：
- 单元测试数量：[数量]
- 集成测试数量：[数量]
- 测试覆盖率：[百分比]

**6. 质量指标**：
- 需求覆盖度：[百分比]
- 代码覆盖率：[百分比]
- QA 通过率：[百分比]
- 质量评分：[分数]/100

**7. 遗留问题**（如有）：
- Minor 问题清单
- 技术债务清单
- 后续优化建议

**8. 版本信息**：
- 代码版本/分支：[version/branch]
- 部署环境：[环境]
- 部署时间：[时间]

请生成此汇总文档。
```

**期望输出**：
- 完成故事汇总文档：`docs/stories/COMPLETED_STORIES_SUMMARY.md`

---

### 📍 **步骤 7.2：生成 API 文档**

#### 操作步骤：

**① 切换到 Architect Agent**
```bash
*agent architect
```

**② 发送 API 文档生成 Prompt**
```
请生成本次迭代新增/修改的 API 接口文档。

**任务要求**：
创建文件：`docs/api/iteration-api-documentation.md`

**文档内容**（基于 OpenAPI/Swagger 规范）：

**1. API 概述**：
- 基础 URL：`https://api.example.com/v1`
- 认证方式：[JWT/OAuth2/等]
- 请求格式：JSON
- 响应格式：JSON
- 字符编码：UTF-8

**2. 通用响应格式**：
```json
{
  "code": 200,
  "message": "success",
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**3. 通用错误码**：
| 错误码 | HTTP状态码 | 说明 | 示例 |
|-------|-----------|------|------|
| 400 | Bad Request | 请求参数错误 | ... |
| 401 | Unauthorized | 未认证 | ... |
| 403 | Forbidden | 无权限 | ... |
| 404 | Not Found | 资源不存在 | ... |
| 500 | Internal Server Error | 服务器错误 | ... |

**4. API 端点详细文档**（每个端点）：

### 示例：用户注册 API

**基本信息**：
- 接口路径：`/api/v1/users/register`
- 请求方法：`POST`
- 接口描述：用户注册接口
- 认证要求：无

**请求参数**：
- Content-Type: `application/json`

**请求 Body**：
```json
{
  "username": "string, 必填, 4-20字符, 字母数字下划线",
  "password": "string, 必填, 6-20字符",
  "email": "string, 必填, 邮箱格式",
  "phone": "string, 可选, 手机号格式"
}
```

**Java DTO 类**：
```java
@Data
public class UserRegisterRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20)
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20)
    private String password;

    @NotBlank(message = "邮箱不能为空")
    @Email
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$")
    private String phone;
}
```

**响应数据**：
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 12345,
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**curl 示例**：
```bash
curl -X POST "https://api.example.com/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

[为每个新增/修改的 API 端点重复此格式]

**5. 数据模型**：
列出所有相关的 DTO 和 Entity 类定义。

**6. 变更日志**：
记录 API 版本变更历史。

请基于所有用户故事中的 API 设计，生成完整的 API 文档。
```

**期望输出**：
- API 文档：`docs/api/iteration-api-documentation.md`

---

### 📍 **步骤 7.3：生成数据库文档**

#### 操作步骤：

**① 保持 Architect Agent 激活**

**② 发送数据库文档生成 Prompt**
```
请生成本次迭代的数据库变更文档。

**任务要求**：
创建文件：`docs/database/iteration-database-documentation.md`

**文档内容**：

**1. 数据库概述**：
- 数据库类型：MySQL 8.0
- 字符集：utf8mb4
- 排序规则：utf8mb4_unicode_ci

**2. 新增表**（每个表包含）：

### 示例：用户表（user）

**表基本信息**：
- 表名：`user`
- 用途：存储用户基本信息
- 引擎：InnoDB

**表结构**：
| 字段名 | 类型 | 长度 | 是否主键 | 是否为空 | 默认值 | 注释 |
|-------|------|------|---------|---------|-------|------|
| id | BIGINT | - | 是 | 否 | AUTO | 用户ID |
| username | VARCHAR | 50 | 否 | 否 | - | 用户名 |
| password | VARCHAR | 100 | 否 | 否 | - | 密码（加密） |
| email | VARCHAR | 100 | 否 | 否 | - | 邮箱 |
| phone | VARCHAR | 20 | 否 | 是 | NULL | 手机号 |
| status | TINYINT | - | 否 | 否 | 1 | 状态（1:正常,0:禁用） |
| created_at | DATETIME | - | 否 | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | - | 否 | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

**索引**：
- PRIMARY KEY (`id`)
- UNIQUE KEY `uk_username` (`username`)
- UNIQUE KEY `uk_email` (`email`)
- INDEX `idx_status` (`status`)

**DDL 语句**：
```sql
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(100) NOT NULL COMMENT '密码（加密）',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1:正常,0:禁用）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

**Java Entity 类**：
```java
@Entity
@Table(name = "user")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

[为每个新增表重复此格式]

**3. 修改表**（如有）：

### 示例：产品表（product）- 新增库存字段

**修改说明**：新增 `stock` 字段用于记录产品库存

**ALTER 语句**：
```sql
ALTER TABLE `product`
ADD COLUMN `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量' AFTER `price`,
ADD INDEX `idx_stock` (`stock`);
```

**影响**：
- 现有数据：默认库存为 0
- 需要手动更新现有产品的库存数据

**4. 表关系图**：
```
user (1) ----< (N) order
order (1) ----< (N) order_item
product (1) ----< (N) order_item
```

**5. 数据迁移脚本**：

**5.1 初始化脚本**（新环境）：
```sql
-- 文件：db/migration/V1.0.0__init.sql
SOURCE db/ddl/create_user_table.sql;
SOURCE db/ddl/create_order_table.sql;
```

**5.2 增量脚本**（现有环境）：
```sql
-- 文件：db/migration/V1.1.0__add_stock_to_product.sql
ALTER TABLE `product`
ADD COLUMN `stock` INT NOT NULL DEFAULT 0 COMMENT '库存数量' AFTER `price`;
```

**6. 数据字典**：
完整的数据字典（所有表、所有字段）。

**7. 性能优化建议**：
- 索引策略
- 查询优化建议

请基于所有用户故事中的数据库设计，生成完整的数据库文档。
```

**期望输出**：
- 数据库文档：`docs/database/iteration-database-documentation.md`
- DDL 脚本：`db/ddl/*.sql`
- 迁移脚本：`db/migration/*.sql`

---

### 📍 **步骤 7.4：生成部署文档**

#### 操作步骤：

**① 保持 Architect Agent 激活**

**② 发送部署文档生成 Prompt**
```
请生成本次迭代的部署文档。

**任务要求**：
创建文件：`docs/deployment/iteration-deployment-guide.md`

**文档内容**：

**1. 部署概述**：
- 版本号：v1.1.0
- 部署类型：增量部署（现有系统升级）
- 部署环境：开发/测试/生产
- 预计停机时间：[时间]

**2. 部署前准备**：

**2.1 环境要求**：
- JDK 版本：11+
- Maven/Gradle 版本：[版本]
- 数据库版本：MySQL 8.0+

**2.2 代码准备**：
```bash
git pull origin main
git checkout release/v1.1.0
mvn clean package -DskipTests
```

**2.3 数据库备份**：
```bash
mysqldump -u root -p your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

**3. 数据库迁移**：

**3.1 执行 DDL 脚本**：
```bash
mysql -u root -p your_database
SOURCE db/migration/V1.1.0__*.sql;
```

**4. 应用部署**：

**4.1 停止服务**：
```bash
systemctl stop your-service
```

**4.2 部署新版本**：
```bash
cp target/your-app-1.1.0.jar /opt/app/your-app.jar
```

**4.3 启动服务**：
```bash
systemctl start your-service
tail -f /opt/app/logs/application.log
```

**5. 部署验证**：

**5.1 健康检查**：
```bash
curl http://localhost:8080/actuator/health
```

**5.2 API 测试**：
```bash
curl -X POST "http://localhost:8080/api/v1/users/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'
```

**6. 回滚方案**（如部署失败）：
```bash
systemctl stop your-service
cp /opt/app/backup/your-app_*.jar /opt/app/your-app.jar
systemctl start your-service
```

请生成此部署文档。
```

**期望输出**：
- 部署文档：`docs/deployment/iteration-deployment-guide.md`

---

### 📍 **步骤 7.5：最终 PO 验收**

#### 操作步骤：

**① 切换到 PO Agent**
```bash
*agent po
```

**② 发送最终验收 Prompt**
```
请对本次迭代进行最终验收。

**验收范围**：
- 所有用户故事：`docs/stories/*.md`
- 需求覆盖度审计报告：`audit-reports/requirements_coverage_audit_*.md`
- 质量验证报告：`quality-reports/quality_validation_*.md`
- 完成故事汇总：`docs/stories/COMPLETED_STORIES_SUMMARY.md`
- API 文档：`docs/api/iteration-api-documentation.md`
- 数据库文档：`docs/database/iteration-database-documentation.md`
- 部署文档：`docs/deployment/iteration-deployment-guide.md`

**验收清单**：

**1. 需求完成度**：
- ✅ 所有需求已实现（覆盖度 ≥95%）
- ✅ 所有用户故事已完成（状态 = Done）
- ✅ 所有验收标准已满足

**2. 代码质量**：
- ✅ 所有测试通过（100% pass rate）
- ✅ 代码覆盖率达标（≥80%）
- ✅ 质量评分达标（≥90）
- ✅ 无 Critical 问题

**3. 文档完整性**：
- ✅ 用户故事文档完整
- ✅ API 文档准确
- ✅ 数据库文档完整
- ✅ 部署文档清晰

**4. 功能验证**（抽样）：
- 手动测试关键功能
- 验证业务流程
- 验证数据正确性

**验收决策**：
- ✅ **验收通过**：可以发布到生产环境
- ❌ **验收不通过**：列出不通过的原因，需要修复

**验收记录**：
创建验收记录文档：`docs/acceptance/iteration-acceptance-record.md`

包含：
- 验收日期
- 验收人
- 验收结果（通过/不通过）
- 验收意见

请执行最终验收。
```

**期望输出**：
- 验收记录：`docs/acceptance/iteration-acceptance-record.md`
- 验收结果：通过/不通过

---

## **完成！整个迭代开发链路结束** 🎉

---

## 📊 完整流程总结

### **7 个主要阶段**

1. **需求分析和 PRD 创建**（1-2 小时）
   - Architect: 分析现有架构
   - PM: 创建 Brownfield PRD
   - PM: 拆分史诗（如需要）

2. **技术架构设计**（1-2 小时）
   - Architect: 后端增量设计
   - Architect: 数据库设计
   - Architect: API 设计

3. **用户故事创建**（每个故事 30-60 分钟）
   - SM: 创建增强版用户故事
   - PO: 验证故事

4. **Java 后端开发**（每个故事 2-4 小时）
   - Dev: 开发代码（Entity → Mapper → Service → Controller）
   - Dev: 编写测试
   - Dev: 运行测试

5. **QA 测试和质量门禁**（每个故事 1-2 小时）
   - QA: 综合审查
   - Dev: 修复问题（如有）
   - QA: 质量门禁决策

6. **全局审计和验证**（2-3 小时）
   - Requirements Coverage Auditor: 覆盖度审计
   - Automated Quality Validator: 7 层质量验证

7. **文档整理和交付**（2-3 小时）
   - PO: 生成完成故事汇总
   - Architect: 生成 API 文档
   - Architect: 生成数据库文档
   - Architect: 生成部署文档
   - PO: 最终验收

---

## ⏱️ 时间估算（10 个用户故事的项目）

| 阶段 | 时间 |
|-----|------|
| 阶段 1-2：准备和设计 | 2-4 小时 |
| 阶段 3：故事创建（10个） | 5-10 小时 |
| 阶段 4：开发（10个） | 20-40 小时 |
| 阶段 5：QA（10个） | 10-20 小时 |
| 阶段 6：审计验证 | 2-3 小时 |
| 阶段 7：文档交付 | 2-3 小时 |
| **总计** | **41-80 小时**（5-10 个工作日） |

---

## 💡 实战建议

1. **并行处理**：在等待一个 Agent 响应时，可以准备下一个 Prompt
2. **批量操作**：可以一次性创建多个简单故事的 Prompt
3. **模板化**：将常用 Prompt 保存为模板，提高效率
4. **质量优先**：不要跳过 QA 审查和质量验证步骤
5. **文档同步**：每完成一个故事就更新文档，避免最后集中整理

---

## 🔗 相关文档

- [XiaoMa-CLI Agent 完整分析报告](./xiaoma-agents-analysis.md)
- [CLAUDE.md - 项目开发指南](./CLAUDE.md)
- [README.md - 项目概述](./README.md)

---

**祝您开发顺利！** 🚀
