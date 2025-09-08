# 生成数据库实体类和Mapper

## 任务概述

基于数据库表结构，自动生成Java实体类（POJO）、MyBatis Mapper接口和XML文件。

## 输入要求

- 数据库表结构信息
- 项目包名配置

## 执行步骤

### 1. 生成Java实体类 (POJO)

#### 基础实体类模板

```java
package {package_name}.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * {table_comment}
 *
 * @author Database Architect
 * @date {generated_date}
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("{table_name}")
public class {EntityName} implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * {field_comment}
     */
    @TableField("{field_name}")
    private {FieldType} {fieldName};

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    /**
     * 删除时间（软删除）
     */
    @TableLogic
    @TableField("deleted_at")
    private LocalDateTime deletedAt;

    /**
     * 版本号（乐观锁）
     */
    @Version
    @TableField("version")
    private Integer version;
}
```

#### 类型映射规则

```yaml
mysql_to_java:
  BIGINT: Long
  INT: Integer
  TINYINT: Integer
  SMALLINT: Integer
  VARCHAR: String
  CHAR: String
  TEXT: String
  DATETIME: LocalDateTime
  DATE: LocalDate
  TIME: LocalTime
  TIMESTAMP: LocalDateTime
  DECIMAL: BigDecimal
  DOUBLE: Double
  FLOAT: Float
  BOOLEAN: Boolean
  BLOB: byte[]
  JSON: String
```

### 2. 生成DTO类

```java
package {package_name}.dto;

import lombok.Data;
import javax.validation.constraints.*;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

/**
 * {entity_name} 数据传输对象
 */
@Data
@ApiModel(value = "{EntityName}DTO", description = "{table_comment}")
public class {EntityName}DTO {

    @ApiModelProperty(value = "主键ID", example = "1")
    private Long id;

    @NotBlank(message = "{field_name}不能为空")
    @Size(max = {max_length}, message = "{field_name}长度不能超过{max_length}")
    @ApiModelProperty(value = "{field_comment}", required = true)
    private {FieldType} {fieldName};
}
```

### 3. 生成查询条件类

```java
package {package_name}.query;

import lombok.Data;
import lombok.EqualsAndHashCode;
import {package_name}.common.BaseQuery;

/**
 * {entity_name} 查询条件
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class {EntityName}Query extends BaseQuery {

    /**
     * {field_comment}
     */
    private {FieldType} {fieldName};

    /**
     * 创建时间开始
     */
    private String createTimeStart;

    /**
     * 创建时间结束
     */
    private String createTimeEnd;
}
```

### 4. 生成MyBatis Mapper接口

```java
package {package_name}.mapper;

import {package_name}.entity.{EntityName};
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * {table_comment} Mapper接口
 *
 * @author Database Architect
 * @date {generated_date}
 */
@Mapper
public interface {EntityName}Mapper extends BaseMapper<{EntityName}> {

    /**
     * 根据条件查询列表
     *
     * @param query 查询条件
     * @return 结果列表
     */
    List<{EntityName}> selectByQuery(@Param("query") {EntityName}Query query);

    /**
     * 批量插入
     *
     * @param list 数据列表
     * @return 影响行数
     */
    int insertBatch(@Param("list") List<{EntityName}> list);

    /**
     * 批量更新
     *
     * @param list 数据列表
     * @return 影响行数
     */
    int updateBatch(@Param("list") List<{EntityName}> list);
}
```

### 5. 生成MyBatis Mapper XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="{package_name}.mapper.{EntityName}Mapper">

    <!-- 通用结果映射 -->
    <resultMap id="BaseResultMap" type="{package_name}.entity.{EntityName}">
        <id column="id" property="id" />
        <result column="{column_name}" property="{propertyName}" />
        <result column="created_at" property="createdAt" />
        <result column="updated_at" property="updatedAt" />
        <result column="deleted_at" property="deletedAt" />
        <result column="version" property="version" />
    </resultMap>

    <!-- 通用字段列表 -->
    <sql id="Base_Column_List">
        id, {column_names}, created_at, updated_at, deleted_at, version
    </sql>

    <!-- 根据条件查询 -->
    <select id="selectByQuery" resultMap="BaseResultMap">
        SELECT
        <include refid="Base_Column_List" />
        FROM {table_name}
        <where>
            deleted_at IS NULL
            <if test="query.{fieldName} != null">
                AND {column_name} = #{query.{fieldName}}
            </if>
            <if test="query.createTimeStart != null">
                AND created_at >= #{query.createTimeStart}
            </if>
            <if test="query.createTimeEnd != null">
                AND created_at <= #{query.createTimeEnd}
            </if>
        </where>
        ORDER BY created_at DESC
    </select>

    <!-- 批量插入 -->
    <insert id="insertBatch" parameterType="list">
        INSERT INTO {table_name} (
            {column_names}, created_at, updated_at
        ) VALUES
        <foreach collection="list" item="item" separator=",">
        (
            #{item.{propertyName}}, NOW(), NOW()
        )
        </foreach>
    </insert>

    <!-- 批量更新 -->
    <update id="updateBatch" parameterType="list">
        <foreach collection="list" item="item" separator=";">
            UPDATE {table_name}
            <set>
                <if test="item.{propertyName} != null">
                    {column_name} = #{item.{propertyName}},
                </if>
                updated_at = NOW()
            </set>
            WHERE id = #{item.id} AND deleted_at IS NULL
        </foreach>
    </update>

</mapper>
```

### 6. 生成Service接口

```java
package {package_name}.service;

import {package_name}.entity.{EntityName};
import {package_name}.dto.{EntityName}DTO;
import {package_name}.query.{EntityName}Query;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage;

/**
 * {table_comment} 服务接口
 */
public interface {EntityName}Service extends IService<{EntityName}> {

    /**
     * 分页查询
     */
    IPage<{EntityName}> queryPage({EntityName}Query query);

    /**
     * 根据ID查询详情
     */
    {EntityName}DTO getDetail(Long id);

    /**
     * 新增
     */
    Boolean create({EntityName}DTO dto);

    /**
     * 更新
     */
    Boolean update({EntityName}DTO dto);

    /**
     * 删除
     */
    Boolean delete(Long id);
}
```

### 7. 生成Service实现类

```java
package {package_name}.service.impl;

import {package_name}.entity.{EntityName};
import {package_name}.dto.{EntityName}DTO;
import {package_name}.query.{EntityName}Query;
import {package_name}.mapper.{EntityName}Mapper;
import {package_name}.service.{EntityName}Service;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.stereotype.Service;
import org.springframework.beans.BeanUtils;
import lombok.extern.slf4j.Slf4j;

/**
 * {table_comment} 服务实现类
 */
@Slf4j
@Service
public class {EntityName}ServiceImpl extends ServiceImpl<{EntityName}Mapper, {EntityName}>
        implements {EntityName}Service {

    @Override
    public IPage<{EntityName}> queryPage({EntityName}Query query) {
        Page<{EntityName}> page = new Page<>(query.getCurrent(), query.getSize());
        return this.baseMapper.selectByQuery(page, query);
    }

    @Override
    public {EntityName}DTO getDetail(Long id) {
        {EntityName} entity = this.getById(id);
        if (entity == null) {
            return null;
        }
        {EntityName}DTO dto = new {EntityName}DTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    @Override
    public Boolean create({EntityName}DTO dto) {
        {EntityName} entity = new {EntityName}();
        BeanUtils.copyProperties(dto, entity);
        return this.save(entity);
    }

    @Override
    public Boolean update({EntityName}DTO dto) {
        {EntityName} entity = new {EntityName}();
        BeanUtils.copyProperties(dto, entity);
        return this.updateById(entity);
    }

    @Override
    public Boolean delete(Long id) {
        return this.removeById(id);
    }
}
```

### 8. 生成Controller类

```java
package {package_name}.controller;

import {package_name}.entity.{EntityName};
import {package_name}.dto.{EntityName}DTO;
import {package_name}.query.{EntityName}Query;
import {package_name}.service.{EntityName}Service;
import {package_name}.common.Result;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import javax.validation.Valid;

/**
 * {table_comment} 控制器
 */
@Api(tags = "{table_comment}管理")
@RestController
@RequestMapping("/api/{entity_name_lowercase}")
public class {EntityName}Controller {

    @Autowired
    private {EntityName}Service {entityName}Service;

    @ApiOperation("分页查询")
    @GetMapping("/page")
    public Result<IPage<{EntityName}>> queryPage({EntityName}Query query) {
        return Result.success({entityName}Service.queryPage(query));
    }

    @ApiOperation("查询详情")
    @GetMapping("/{id}")
    public Result<{EntityName}DTO> getDetail(@PathVariable Long id) {
        return Result.success({entityName}Service.getDetail(id));
    }

    @ApiOperation("新增")
    @PostMapping
    public Result<Boolean> create(@Valid @RequestBody {EntityName}DTO dto) {
        return Result.success({entityName}Service.create(dto));
    }

    @ApiOperation("更新")
    @PutMapping
    public Result<Boolean> update(@Valid @RequestBody {EntityName}DTO dto) {
        return Result.success({entityName}Service.update(dto));
    }

    @ApiOperation("删除")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success({entityName}Service.delete(id));
    }
}
```

## 输出文件结构

```
src/main/java/{package_path}/
├── entity/
│   └── {EntityName}.java
├── dto/
│   └── {EntityName}DTO.java
├── query/
│   └── {EntityName}Query.java
├── mapper/
│   └── {EntityName}Mapper.java
├── service/
│   ├── {EntityName}Service.java
│   └── impl/
│       └── {EntityName}ServiceImpl.java
└── controller/
    └── {EntityName}Controller.java

src/main/resources/mapper/
└── {EntityName}Mapper.xml
```

## 配置提示

确保在项目中添加必要的依赖：

```xml
<!-- MyBatis Plus -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Swagger -->
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-boot-starter</artifactId>
</dependency>
```
