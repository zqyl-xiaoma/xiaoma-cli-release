# 基于知识库的故事开发任务

## Purpose

基于知识库（`docs/rag/`）中的技术规范和架构增量设计文档（`docs/architecture-increment.md`），对用户故事进行标准化开发。确保开发过程中严格遵循项目技术规范、编码标准和架构设计。

## 上游交接物

```yaml
必需输入:
  故事文件:
    - docs/project/stories/{epic}.{story}.*.md  # 待开发的用户故事

  架构增量设计:
    - docs/architecture-increment.md            # Architect生成的增量设计文档

可选输入:
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

  PRD文档:
    - docs/prd.md                               # PRD文档（可选参考）
```

## Workflow Overview

```
故事文件 + 知识库 + 架构增量设计 → 知识加载 → 任务实现 → 规范校验 → 测试验证 → 故事更新
```

---

## Phase 0: 知识上下文加载

### 0.1 验证上游交接物

```yaml
执行步骤:
  步骤1_检查故事文件:
    动作: 确认故事文件存在且状态为可开发
    验证项:
      - 故事文件路径有效
      - 故事状态不是 Draft
      - 任务列表已定义
    缺失处理: |
      如果故事文件缺失或状态不对，提示：
      "故事文件未就绪。请先确认故事状态，或执行 PM 智能体完善故事定义。"

  步骤2_检查架构增量设计:
    动作: 检查 docs/architecture-increment.md 是否存在
    提取内容:
      - 与当前故事相关的模块设计
      - 数据模型变动
      - 接口设计
      - 中间件设计
    缺失处理: |
      如果架构增量设计不存在：
      - 检查是否有传统架构文档可用
      - 提示用户是否继续（使用通用规范）或先生成架构设计

  步骤3_加载技术知识库:
    动作: 扫描并加载 docs/rag/technical/ 目录
    加载策略:
      - 按需加载：仅加载与当前任务相关的规范文件
      - 优先级：编码规范 > 中间件规范 > SQL规范
    关键文件:
      - docs/rag/technical/coding-standards/   # 编码规范（必须）
      - docs/rag/technical/module-structure.md # 模块结构（必须）
      - docs/rag/technical/middleware/         # 中间件规范（按需）
      - docs/rag/technical/sql-standards/      # SQL规范（按需）
```

### 0.2 知识上下文整合

```yaml
整合输出:
  开发上下文:
    架构设计:
      来源: docs/architecture-increment.md
      提取: 与当前Story相关的设计章节
      内容:
        - 模块设计（包结构、类设计）
        - 数据模型设计（表结构、DDL）
        - 接口设计（API定义）
        - 中间件设计（Redis/MQ/定时任务）

    编码规范:
      来源: docs/rag/technical/coding-standards/
      内容:
        - 命名规范（类/方法/变量/常量）
        - 分层规范（Controller/Service/DAO）
        - 异常处理规范
        - 日志规范

    模块结构:
      来源: docs/rag/technical/module-structure.md
      内容:
        - 包结构规范
        - 分层结构
        - 模块依赖关系

    中间件规范:
      来源: docs/rag/technical/middleware/
      内容:
        - Redis使用规范和代码示例
        - MQ使用规范和代码示例
        - 定时任务规范和代码示例

    SQL规范:
      来源: docs/rag/technical/sql-standards/
      内容:
        - 表设计规范
        - 索引设计规范
        - 查询优化规范

    约束条件:
      来源: docs/rag/constraints/
      内容:
        - 安全要求（来自 security.md）
        - 性能要求（来自 performance.md）
```

---

## Phase 1: 任务分析与规范匹配

### 1.1 任务类型识别

```yaml
任务类型识别:
  数据模型任务:
    识别标志: 创建表、修改表、添加字段、创建索引
    关联规范:
      - docs/rag/technical/sql-standards/          # SQL规范
      - docs/rag/technical/data-model.md           # 数据模型
      - docs/architecture-increment.md#数据模型增量设计

  接口开发任务:
    识别标志: 创建API、修改接口、添加端点
    关联规范:
      - docs/rag/technical/coding-standards/       # 编码规范
      - docs/architecture-increment.md#接口增量设计

  业务逻辑任务:
    识别标志: 实现Service、业务流程、校验逻辑
    关联规范:
      - docs/rag/technical/coding-standards/       # 编码规范
      - docs/rag/technical/module-structure.md     # 模块结构
      - docs/architecture-increment.md#模块增量设计

  中间件任务:
    识别标志: 缓存、消息队列、定时任务
    关联规范:
      - docs/rag/technical/middleware/redis.md     # Redis规范
      - docs/rag/technical/middleware/mq.md        # MQ规范
      - docs/rag/technical/middleware/scheduler.md # 定时任务规范
      - docs/architecture-increment.md#中间件增量设计

  前端任务:
    识别标志: 组件、页面、交互
    关联规范:
      - docs/rag/technical/coding-standards/       # 前端编码规范
      - docs/architecture-increment.md#前端设计（如有）
```

### 1.2 规范加载策略

```yaml
加载策略:
  按任务类型加载:
    原则: 仅加载当前任务所需的规范文件
    避免: 一次性加载所有规范导致上下文过载

  加载顺序:
    1. 架构增量设计中的相关章节
    2. 编码规范（通用）
    3. 任务特定规范（SQL/中间件等）
    4. 约束条件（安全/性能）

  缓存策略:
    - 会话内缓存已加载的规范
    - 跨任务复用通用规范
```

---

## Phase 2: 任务实现

### 2.1 实现前检查

```yaml
实现前检查:
  检查项:
    架构对齐:
      - 当前任务在架构增量设计中是否有对应设计
      - 包结构是否与 module-structure.md 一致
      - 类命名是否遵循编码规范

    数据模型对齐:
      - 表结构是否与架构设计一致
      - 字段定义是否符合SQL规范
      - 索引设计是否合理

    接口对齐:
      - API路径是否与架构设计一致
      - 请求/响应格式是否符合规范
      - 错误码是否按规范定义

  不一致处理:
    - 记录偏差到 Debug Log
    - 如有重大偏差，暂停并询问用户
```

### 2.2 代码实现规范

```yaml
代码实现规范:
  命名规范:
    来源: docs/rag/technical/coding-standards/
    要求:
      - Controller: {Module}Controller
      - Service: {Module}Service / {Module}ServiceImpl
      - DAO: {Module}Mapper / {Module}Repository
      - Entity: {Entity}
      - DTO: {Entity}DTO / {Entity}VO / {Entity}Request / {Entity}Response

  分层规范:
    来源: docs/rag/technical/coding-standards/
    要求:
      - Controller: 仅处理请求/响应，不含业务逻辑
      - Service: 业务逻辑层，事务管理
      - DAO: 数据访问层，仅数据操作
      - 禁止: 跨层调用、循环依赖

  异常处理:
    来源: docs/rag/technical/coding-standards/
    要求:
      - 使用统一异常类
      - 业务异常与系统异常分离
      - 异常信息包含上下文

  日志规范:
    来源: docs/rag/technical/coding-standards/
    要求:
      - 关键操作必须有日志
      - 日志级别正确使用
      - 敏感信息脱敏
```

### 2.3 中间件使用规范

```yaml
中间件使用规范:
  Redis使用:
    来源: docs/rag/technical/middleware/redis.md
    规范:
      - Key命名: {业务}:{模块}:{标识}
      - 必须设置过期时间
      - 使用正确的数据结构
      - 参考知识库中的代码示例

  MQ使用:
    来源: docs/rag/technical/middleware/mq.md
    规范:
      - Topic命名规范
      - 消息格式标准化
      - 消费者幂等处理
      - 参考知识库中的代码示例

  定时任务:
    来源: docs/rag/technical/middleware/scheduler.md
    规范:
      - 任务命名规范
      - 分布式锁使用
      - 异常处理
      - 参考知识库中的代码示例
```

### 2.4 SQL实现规范

```yaml
SQL实现规范:
  表设计:
    来源: docs/rag/technical/sql-standards/
    规范:
      - 表名小写下划线
      - 主键统一命名
      - 必须有创建/更新时间字段
      - 必须有表和字段注释

  索引设计:
    来源: docs/rag/technical/sql-standards/
    规范:
      - 索引命名: idx_{表名}_{字段}
      - 唯一索引: uk_{表名}_{字段}
      - 避免冗余索引

  查询规范:
    来源: docs/rag/technical/sql-standards/
    规范:
      - 禁止 SELECT *
      - 分页必须有限制
      - 避免大事务
```

---

## Phase 3: 实现过程中的规范校验

### 3.1 实时校验点

```yaml
校验点:
  代码创建时:
    - 文件路径是否符合 module-structure.md
    - 类名是否符合命名规范
    - 包声明是否正确

  代码编写时:
    - 方法命名是否规范
    - 异常处理是否符合规范
    - 日志打印是否规范

  代码完成时:
    - 是否遵循分层规范
    - 是否有必要的注释
    - 是否处理了边界情况
```

### 3.2 规范偏差处理

```yaml
偏差处理:
  轻微偏差:
    定义: 命名风格略有差异、注释不够详细
    处理: 记录到 Debug Log，继续执行

  中等偏差:
    定义: 分层不清晰、缺少必要校验
    处理: 立即修正，记录到 Completion Notes

  严重偏差:
    定义: 架构不一致、安全风险
    处理: 暂停开发，询问用户确认
```

---

## Phase 4: 测试与验证

### 4.1 测试要求

```yaml
测试要求:
  单元测试:
    - Service层必须有单元测试
    - 覆盖正常流程和异常流程
    - Mock外部依赖

  集成测试:
    - API接口必须有集成测试
    - 数据库操作必须验证

  验收标准验证:
    - 逐条验证故事中的AC
    - 记录验证结果
```

### 4.2 规范合规检查

```yaml
合规检查:
  代码规范检查:
    执行: lint工具检查
    标准: docs/rag/technical/coding-standards/

  安全检查:
    执行: 安全扫描（如配置）
    标准: docs/rag/constraints/security.md

  性能检查:
    执行: 性能测试（如需要）
    标准: docs/rag/constraints/performance.md
```

---

## Phase 5: 故事文件更新

### 5.1 允许更新的部分

```yaml
允许更新部分:
  任务状态:
    - Tasks / Subtasks 复选框标记为 [x]

  Dev Agent Record:
    - Agent Model Used: 使用的模型
    - Debug Log References: 调试日志
    - Completion Notes List: 完成说明
    - File List: 新增/修改/删除的文件
    - Knowledge References: 【新增】引用的知识文件

  Change Log:
    - 新增变更日志条目

  Status:
    - 更新为 Ready for Review
```

### 5.2 知识引用记录

```yaml
知识引用记录:
  格式:
    ## Knowledge References

    | 知识文件 | 引用内容 | 应用位置 |
    |----------|----------|----------|
    | docs/rag/technical/coding-standards/naming.md | 类命名规范 | UserController.java |
    | docs/rag/technical/middleware/redis.md | 缓存实现示例 | UserCacheService.java |
    | docs/architecture-increment.md#用户模块设计 | 模块设计 | user/ 目录结构 |

  目的:
    - 便于代码审查时验证规范遵循
    - 便于后续维护时理解实现依据
    - 建立代码与知识库的可追溯关系
```

---

## 执行顺序总结

```yaml
执行顺序:
  order-of-execution: |
    1. 加载知识上下文
       - 读取架构增量设计 (docs/architecture-increment.md)
       - 读取相关编码规范 (docs/rag/technical/coding-standards/)
       - 读取任务相关规范 (按需)

    2. 读取当前任务
       - 分析任务类型
       - 匹配相关规范
       - 提取架构设计中的对应章节

    3. 实现任务
       - 按照规范创建代码文件
       - 遵循命名和分层规范
       - 参考中间件代码示例

    4. 编写测试
       - 按照测试规范编写
       - 覆盖正常和异常流程

    5. 执行验证
       - 运行lint检查
       - 运行测试
       - 验证AC

    6. 更新故事文件
       - 标记任务完成 [x]
       - 更新 File List
       - 记录 Knowledge References
       - 更新 Completion Notes

    7. 重复直至完成所有任务

    8. 最终检查
       - 执行 story-dod-checklist
       - 验证所有规范遵循
       - 设置状态为 Ready for Review
```

---

## 阻塞条件

```yaml
阻塞条件:
  暂停情况:
    - 架构增量设计与故事任务严重不一致
    - 知识库规范相互冲突
    - 安全约束无法满足
    - 连续3次实现失败
    - 需要未批准的依赖

  处理方式:
    - 记录问题到 Debug Log
    - 暂停并询问用户
    - 等待用户确认后继续
```

---

## 完成标志

```yaml
完成条件:
  必要条件:
    - 所有任务和子任务标记为 [x]
    - 所有测试通过
    - lint检查通过
    - 验收标准全部满足
    - Knowledge References 已记录

  完成提示: |
    ✅ 故事开发完成！

    📄 故事文件: {story_path}
    📊 任务完成: {completed_tasks}/{total_tasks}
    🧪 测试状态: 全部通过

    📚 知识引用:
    - 编码规范: docs/rag/technical/coding-standards/
    - 架构设计: docs/architecture-increment.md
    - 中间件规范: {middleware_refs}

    📁 文件变更:
    - 新增: {new_files}
    - 修改: {modified_files}
    - 删除: {deleted_files}

    🔄 下一步:
    - QA审查: 请QA执行 *review-story
    - 代码审查: 请进行代码评审
