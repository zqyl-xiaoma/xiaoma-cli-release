# 创建数据库设计

## 任务概述

基于需求文档和现有数据库结构，设计新的数据库架构或优化现有架构。

## 前置条件

- 已完成需求分析（PRD文档）
- 已分析现有数据库结构（如果是棕地项目）

## 执行步骤

### 1. 分析需求文档

```yaml
action: analyze_requirements
input: docs/prd.md
extract:
  - 核心业务实体
  - 实体间关系
  - 数据约束条件
  - 性能要求
  - 扩展性需求
```

### 2. 识别数据实体

从需求中提取：

- **核心实体**：用户、产品、订单等
- **关联实体**：中间表、配置表等
- **系统实体**：日志、审计、配置等

### 3. 定义实体属性

为每个实体定义：

```yaml
entity: { entity_name }
attributes:
  - name: id
    type: BIGINT
    constraints: PRIMARY KEY, AUTO_INCREMENT
  - name: { field_name }
    type: { data_type }
    constraints: { constraints }
    comment: { description }
```

### 4. 设计表关系

定义实体间关系：

- **一对一** (1:1)
- **一对多** (1:N)
- **多对多** (M:N)

### 5. 规范化设计

应用数据库范式：

- **第一范式** (1NF): 原子性
- **第二范式** (2NF): 完全依赖
- **第三范式** (3NF): 消除传递依赖
- **BCNF**: 必要时应用

### 6. 性能优化设计

#### 6.1 索引策略

```sql
-- 主键索引
PRIMARY KEY (id)

-- 唯一索引
UNIQUE INDEX uk_email (email)

-- 普通索引
INDEX idx_created_at (created_at)

-- 复合索引
INDEX idx_user_status (user_id, status)
```

#### 6.2 分区策略

- 按时间分区
- 按范围分区
- 按哈希分区

### 7. 生成设计文档

```markdown
# 数据库设计文档

## 设计概述

- **项目名称**: {project_name}
- **版本**: {version}
- **设计日期**: {date}
- **设计人**: Database Architect

## 设计原则

- 数据完整性
- 性能优化
- 可扩展性
- 安全性

## 实体设计

### {Entity Name}

**描述**: {description}
**表名**: {table_name}

#### 字段设计

| 字段名  | 数据类型 | 约束          | 说明      |
| ------- | -------- | ------------- | --------- |
| {field} | {type}   | {constraints} | {comment} |

#### 索引设计

{索引列表}

## 关系设计

{ER图}

## 数据库脚本

{DDL语句}
```

### 8. 与现有结构对比（棕地项目）

```yaml
action: compare_with_existing
steps:
  - 识别需要新增的表
  - 识别需要修改的表
  - 识别需要删除的表
  - 生成迁移计划
```

## 输出产物

1. **数据库设计文档**
2. **ER关系图**
3. **DDL脚本**
4. **数据迁移脚本**（如果需要）

## 最佳实践

- 遵循命名规范
- 适当的字段类型选择
- 合理的索引设计
- 考虑数据增长
- 预留扩展字段
