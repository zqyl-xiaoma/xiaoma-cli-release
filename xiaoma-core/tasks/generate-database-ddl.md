# 生成数据库DDL语句

## 任务概述

基于数据库设计文档，生成可执行的MySQL DDL和DML语句。

## 输入要求

- 数据库设计文档
- 实体和属性列表

## 执行步骤

### 1. 生成建库语句

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `{database_name}`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `{database_name}`;
```

### 2. 生成建表语句 (DDL)

#### 基础表结构模板

```sql
-- 创建 {entity_name} 表
DROP TABLE IF EXISTS `{table_name}`;
CREATE TABLE `{table_name}` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `{field_name}` {data_type} {null_constraint} {default_value} COMMENT '{field_comment}',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted_at` DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
    `version` INT NOT NULL DEFAULT 0 COMMENT '版本号（乐观锁）',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='{table_comment}';
```

### 3. 生成索引语句

```sql
-- 添加索引
ALTER TABLE `{table_name}`
ADD INDEX `idx_{table_name}_{field_name}` (`{field_name}`);

-- 添加唯一索引
ALTER TABLE `{table_name}`
ADD UNIQUE INDEX `uk_{table_name}_{field_name}` (`{field_name}`);

-- 添加复合索引
ALTER TABLE `{table_name}`
ADD INDEX `idx_{table_name}_{field1}_{field2}` (`{field1}`, `{field2}`);
```

### 4. 生成外键约束

```sql
-- 添加外键约束
ALTER TABLE `{child_table}`
ADD CONSTRAINT `fk_{child_table}_{parent_table}`
FOREIGN KEY (`{foreign_key_field}`)
REFERENCES `{parent_table}` (`id`)
ON DELETE CASCADE
ON UPDATE CASCADE;
```

### 5. 生成视图语句

```sql
-- 创建视图
CREATE OR REPLACE VIEW `v_{view_name}` AS
SELECT
    t1.field1,
    t1.field2,
    t2.field3
FROM
    table1 t1
    LEFT JOIN table2 t2 ON t1.id = t2.table1_id
WHERE
    t1.deleted_at IS NULL;
```

### 6. 生成存储过程

```sql
DELIMITER $$

CREATE PROCEDURE `sp_{procedure_name}`(
    IN p_param1 INT,
    IN p_param2 VARCHAR(255),
    OUT p_result INT
)
BEGIN
    -- 存储过程逻辑
    SELECT COUNT(*) INTO p_result
    FROM {table_name}
    WHERE field1 = p_param1
    AND field2 = p_param2;
END$$

DELIMITER ;
```

### 7. 生成触发器

```sql
DELIMITER $$

CREATE TRIGGER `trg_{trigger_name}`
BEFORE INSERT ON `{table_name}`
FOR EACH ROW
BEGIN
    -- 触发器逻辑
    IF NEW.field IS NULL THEN
        SET NEW.field = 'default_value';
    END IF;
END$$

DELIMITER ;
```

### 8. 生成初始数据 (DML)

```sql
-- 插入初始配置数据
INSERT INTO `system_config` (`key`, `value`, `description`) VALUES
('app.name', 'MyApp', '应用名称'),
('app.version', '1.0.0', '应用版本'),
('app.env', 'development', '运行环境');

-- 插入默认用户
INSERT INTO `users` (`username`, `email`, `password`, `status`) VALUES
('admin', 'admin@example.com', 'hashed_password', 'active');

-- 插入权限数据
INSERT INTO `permissions` (`name`, `code`, `description`) VALUES
('用户管理', 'user:manage', '管理用户的增删改查权限'),
('角色管理', 'role:manage', '管理角色的增删改查权限');
```

### 9. 生成查询语句示例

```sql
-- 基础查询
SELECT * FROM `{table_name}` WHERE deleted_at IS NULL;

-- 分页查询
SELECT * FROM `{table_name}`
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT {offset}, {limit};

-- 关联查询
SELECT
    t1.*,
    t2.name AS related_name
FROM
    `table1` t1
    LEFT JOIN `table2` t2 ON t1.related_id = t2.id
WHERE
    t1.deleted_at IS NULL;

-- 统计查询
SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_count
FROM
    `{table_name}`
WHERE
    deleted_at IS NULL;
```

### 10. 生成更新和删除语句

```sql
-- 更新语句
UPDATE `{table_name}`
SET
    field1 = 'new_value',
    updated_at = NOW()
WHERE
    id = {id}
    AND deleted_at IS NULL;

-- 软删除
UPDATE `{table_name}`
SET
    deleted_at = NOW()
WHERE
    id = {id};

-- 物理删除（谨慎使用）
DELETE FROM `{table_name}`
WHERE id = {id};
```

## 输出文件结构

```
docs/database/
├── ddl/
│   ├── 01_create_database.sql
│   ├── 02_create_tables.sql
│   ├── 03_create_indexes.sql
│   ├── 04_create_constraints.sql
│   └── 05_create_views.sql
├── dml/
│   ├── 01_init_config.sql
│   ├── 02_init_users.sql
│   └── 03_init_permissions.sql
└── migrations/
    └── v1.0.0_initial.sql
```

## 最佳实践

1. **命名规范**
   - 表名：小写，下划线分隔
   - 字段名：小写，下划线分隔
   - 索引名：idx*表名*字段名
   - 外键名：fk*子表*父表

2. **字段设计**
   - 使用合适的数据类型
   - 设置合理的默认值
   - 添加必要的注释

3. **性能考虑**
   - 合理使用索引
   - 避免过度规范化
   - 考虑查询性能

4. **安全性**
   - 使用参数化查询
   - 限制权限
   - 数据加密
