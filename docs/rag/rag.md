# 知识库 - RAG 文档

> 本文档作为全自动迭代开发的知识库数据源，包含业务知识和技术知识。
> 在 MCP 知识库服务上线前，智能体将从此文件检索所需知识。

---

# 第一部分：业务知识

---

## 1. 业务术语表

<!-- KB-TYPE: business_term -->
<!-- KB-KEYWORDS: 术语, 定义, 概念 -->

### 术语: 用户 (User)
- **定义**: 系统的注册使用者，拥有唯一的账号标识
- **属性**: 用户ID、邮箱、手机号、昵称、头像、注册时间、最后登录时间
- **相关概念**: 账号、会员、角色

### 术语: 偏好设置 (Preference)
- **定义**: 用户的个性化配置项，影响系统行为和展示方式
- **类型**: 显示偏好、通知偏好、隐私偏好、功能偏好
- **存储**: 键值对形式，支持JSON复杂值

### 术语: 角色 (Role)
- **定义**: 用户在系统中的身份类型，决定其权限范围
- **预设角色**: 管理员(admin)、普通用户(user)、访客(guest)
- **权限关联**: 每个角色关联一组权限

### 术语: 权限 (Permission)
- **定义**: 对系统资源或操作的访问控制标识
- **格式**: `resource:action`，如 `user:read`、`preference:write`
- **继承**: 角色继承权限，用户继承角色

---

## 2. 业务规则

<!-- KB-TYPE: business_rule -->
<!-- KB-KEYWORDS: 规则, 业务逻辑, 约束 -->

### 规则: BR-001 用户注册规则
- **描述**: 新用户注册时必须满足的条件
- **规则内容**:
  1. 邮箱必须唯一，格式合法
  2. 密码长度 8-32 位，必须包含字母和数字
  3. 手机号可选，如填写必须唯一
  4. 昵称长度 2-20 个字符
  5. 必须同意服务条款
- **例外**: 第三方OAuth注册可跳过密码设置

### 规则: BR-002 用户认证规则
- **描述**: 用户登录认证的业务规则
- **规则内容**:
  1. 支持邮箱+密码、手机号+验证码、OAuth三种方式
  2. 连续5次密码错误锁定账号30分钟
  3. 登录成功生成JWT Token，有效期7天
  4. 敏感操作需要二次验证
- **安全要求**: 密码传输必须加密，存储使用bcrypt哈希

### 规则: BR-003 偏好设置规则
- **描述**: 用户偏好设置的业务规则
- **规则内容**:
  1. 每个用户可设置最多100个偏好项
  2. 偏好键名长度不超过100字符
  3. 偏好值大小不超过10KB
  4. 支持批量导入导出
  5. 偏好变更记录保留30天
- **默认值**: 新用户使用系统默认偏好

### 规则: BR-004 数据验证规则
- **描述**: 通用的数据验证规则
- **规则内容**:
  1. 所有用户输入必须验证和清理
  2. ID字段使用UUID格式
  3. 时间字段使用ISO 8601格式
  4. 金额字段保留2位小数
  5. 字符串字段去除首尾空格
- **安全**: 防止XSS和SQL注入

### 规则: BR-005 权限控制规则
- **描述**: 系统权限控制的业务规则
- **规则内容**:
  1. 未登录用户只能访问公开资源
  2. 普通用户只能操作自己的数据
  3. 管理员可以操作所有用户数据
  4. 敏感操作需要记录审计日志
- **最小权限原则**: 默认拒绝，显式授权

---

## 3. 业务流程

<!-- KB-TYPE: business_process -->
<!-- KB-KEYWORDS: 流程, 步骤, 工作流 -->

### 流程: 用户注册流程
```
1. 用户填写注册信息
   ↓
2. 系统验证信息格式
   ├─ 验证失败 → 返回错误提示
   ↓
3. 检查邮箱/手机号唯一性
   ├─ 已存在 → 提示已注册
   ↓
4. 创建用户账号
   ↓
5. 发送验证邮件/短信
   ↓
6. 用户验证
   ├─ 超时未验证 → 账号待激活状态
   ↓
7. 激活账号，注册完成
```

### 流程: 用户登录流程
```
1. 用户输入凭证
   ↓
2. 验证凭证格式
   ├─ 格式错误 → 返回错误提示
   ↓
3. 查询用户信息
   ├─ 用户不存在 → 返回"用户不存在"
   ↓
4. 验证密码/验证码
   ├─ 验证失败 → 记录失败次数，检查是否锁定
   ↓
5. 检查账号状态
   ├─ 账号锁定/禁用 → 返回相应提示
   ↓
6. 生成Token
   ↓
7. 更新最后登录时间
   ↓
8. 返回登录成功
```

### 流程: 偏好设置更新流程
```
1. 用户发起偏好更新请求
   ↓
2. 验证用户身份（Token验证）
   ├─ 验证失败 → 返回401
   ↓
3. 验证请求数据格式
   ├─ 格式错误 → 返回400
   ↓
4. 检查偏好键名是否合法
   ├─ 非法键名 → 返回错误
   ↓
5. 检查用户偏好数量限制
   ├─ 超出限制 → 返回错误
   ↓
6. 更新/创建偏好记录
   ↓
7. 记录变更日志
   ↓
8. 返回更新成功
```

---

## 4. 用户角色定义

<!-- KB-TYPE: user_role -->
<!-- KB-KEYWORDS: 角色, 用户类型, 权限 -->

### 角色: 管理员 (Admin)
- **职责**: 系统管理、用户管理、配置管理
- **权限范围**:
  - 所有用户数据的读写权限
  - 系统配置的管理权限
  - 审计日志的查看权限
- **使用场景**: 后台管理、运维操作

### 角色: 普通用户 (User)
- **职责**: 使用系统功能、管理个人数据
- **权限范围**:
  - 自己数据的读写权限
  - 公开数据的只读权限
- **使用场景**: 日常业务操作

### 角色: 访客 (Guest)
- **职责**: 浏览公开内容
- **权限范围**:
  - 公开数据的只读权限
- **使用场景**: 未登录状态

---

## 5. 验收标准参考

<!-- KB-TYPE: acceptance_criteria -->
<!-- KB-KEYWORDS: 验收, 测试场景, 边界条件 -->

### 验收标准模板: 列表查询功能
```gherkin
# 正常场景
Given 用户已登录
When 用户请求查询列表
Then 返回用户有权限的数据列表

# 分页场景
Given 用户已登录
And 数据总数超过单页限制
When 用户请求第N页数据
Then 返回第N页的数据
And 返回总数和分页信息

# 空数据场景
Given 用户已登录
And 无匹配数据
When 用户请求查询列表
Then 返回空列表
And 返回总数为0

# 权限不足场景
Given 用户已登录
And 用户无查询权限
When 用户请求查询列表
Then 返回403权限不足
```

### 验收标准模板: 表单提交功能
```gherkin
# 正常提交
Given 用户已登录
And 用户有提交权限
When 用户提交有效数据
Then 数据保存成功
And 返回成功响应

# 数据验证失败
Given 用户已登录
When 用户提交无效数据
Then 返回验证错误详情
And 数据未保存

# 重复提交
Given 用户已登录
And 用户已提交相同数据
When 用户再次提交相同数据
Then 返回重复提交错误
```

---

# 第二部分：技术知识

---

## 6. 技术栈规范

<!-- KB-TYPE: tech_spec -->
<!-- KB-KEYWORDS: 技术栈, 框架, 版本 -->

### 前端技术栈
- **框架**: React 18.x
- **状态管理**: Zustand / Redux Toolkit
- **UI组件库**: Ant Design 5.x
- **HTTP客户端**: Axios
- **构建工具**: Vite
- **语言**: TypeScript 5.x

### 后端技术栈
- **运行时**: Node.js 20.x LTS
- **框架**: Express 4.x / Fastify 4.x
- **ORM**: Prisma 5.x
- **验证**: Zod
- **日志**: Pino
- **语言**: TypeScript 5.x

### 数据库
- **主数据库**: PostgreSQL 15.x
- **缓存**: Redis 7.x
- **搜索**: Elasticsearch 8.x (可选)

### 测试工具
- **单元测试**: Vitest
- **E2E测试**: Playwright
- **API测试**: Supertest

---

## 7. 编码规范

<!-- KB-TYPE: coding_standard -->
<!-- KB-KEYWORDS: 命名, 格式, 代码风格 -->

### 命名规范

#### 变量和函数
```typescript
// 变量: camelCase
const userName = 'John';
const isActive = true;
const maxRetryCount = 3;

// 函数: camelCase，动词开头
function getUserById(id: string): User { }
function validateEmail(email: string): boolean { }
async function fetchUserPreferences(userId: string): Promise<Preference[]> { }
```

#### 类和接口
```typescript
// 类: PascalCase
class UserService { }
class PreferenceRepository { }

// 接口: PascalCase，不加I前缀
interface User { }
interface CreateUserDto { }

// 类型: PascalCase
type UserId = string;
type PreferenceKey = string;
```

#### 常量和枚举
```typescript
// 常量: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_PAGE_SIZE = 20;

// 枚举: PascalCase，成员 PascalCase
enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
}
```

#### 文件命名
```
# 组件: PascalCase
UserProfile.tsx
PreferenceList.tsx

# 服务/工具: camelCase
userService.ts
preferenceRepository.ts

# 测试: 原文件名.test.ts
userService.test.ts
PreferenceList.test.tsx
```

### 代码格式规范
- 缩进: 2空格
- 行宽: 100字符
- 分号: 必须
- 引号: 单引号（JSX中双引号）
- 尾逗号: ES5模式

---

## 8. 架构模式

<!-- KB-TYPE: architecture_pattern -->
<!-- KB-KEYWORDS: 架构, 模式, 设计 -->

### 分层架构

```
┌─────────────────────────────────────┐
│          Controller Layer           │  处理HTTP请求/响应
├─────────────────────────────────────┤
│           Service Layer             │  业务逻辑
├─────────────────────────────────────┤
│         Repository Layer            │  数据访问
├─────────────────────────────────────┤
│           Database Layer            │  数据存储
└─────────────────────────────────────┘
```

### Repository Pattern
```typescript
// 仓储接口
interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

// 仓储实现
class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
  // ... 其他方法
}
```

### Service Layer Pattern
```typescript
// 服务类
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // 1. 验证业务规则
    await this.validateCreateUser(dto);

    // 2. 创建用户
    const user = await this.userRepository.create(dto);

    // 3. 发送欢迎邮件
    await this.emailService.sendWelcome(user.email);

    return user;
  }
}
```

---

## 9. API 设计规范

<!-- KB-TYPE: api_spec -->
<!-- KB-KEYWORDS: API, RESTful, 接口 -->

### URL 命名规范
```
# 资源命名: 复数名词
GET    /api/v1/users           # 获取用户列表
GET    /api/v1/users/:id       # 获取单个用户
POST   /api/v1/users           # 创建用户
PUT    /api/v1/users/:id       # 更新用户
DELETE /api/v1/users/:id       # 删除用户

# 子资源
GET    /api/v1/users/:id/preferences    # 获取用户偏好
POST   /api/v1/users/:id/preferences    # 创建用户偏好

# 操作
POST   /api/v1/users/:id/activate       # 激活用户
POST   /api/v1/auth/login               # 登录
POST   /api/v1/auth/logout              # 登出
```

### 响应格式规范
```typescript
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {
    // 实际数据
  }
}

// 列表响应
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}

// 错误响应
{
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 错误码规范
```typescript
// HTTP 状态码使用
200 - OK                 // 成功
201 - Created            // 创建成功
204 - No Content         // 删除成功
400 - Bad Request        // 请求参数错误
401 - Unauthorized       // 未认证
403 - Forbidden          // 无权限
404 - Not Found          // 资源不存在
409 - Conflict           // 冲突（如重复创建）
422 - Unprocessable      // 业务规则验证失败
500 - Internal Error     // 服务器错误

// 业务错误码
{
  "USER_NOT_FOUND": "用户不存在",
  "USER_ALREADY_EXISTS": "用户已存在",
  "INVALID_CREDENTIALS": "凭证无效",
  "ACCOUNT_LOCKED": "账号已锁定",
  "PREFERENCE_LIMIT_EXCEEDED": "偏好数量超出限制",
}
```

---

## 10. 测试规范

<!-- KB-TYPE: testing_standard -->
<!-- KB-KEYWORDS: 测试, 单元测试, 覆盖率 -->

### 单元测试规范

#### 测试文件组织
```
src/
├── services/
│   └── userService.ts
tests/
├── services/
│   └── userService.test.ts
```

#### 测试命名规范
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user when valid data provided', async () => {});
    it('should throw error when email already exists', async () => {});
    it('should send welcome email after user created', async () => {});
  });
});
```

#### AAA 模式
```typescript
it('should return user preferences', async () => {
  // Arrange - 准备测试数据和依赖
  const userId = 'user-123';
  const mockPreferences = [{ key: 'theme', value: 'dark' }];
  mockRepository.findByUserId.mockResolvedValue(mockPreferences);

  // Act - 执行被测方法
  const result = await service.getPreferences(userId);

  // Assert - 验证结果
  expect(result).toEqual(mockPreferences);
  expect(mockRepository.findByUserId).toHaveBeenCalledWith(userId);
});
```

### 覆盖率要求
- **语句覆盖率**: >= 80%
- **分支覆盖率**: >= 75%
- **函数覆盖率**: >= 85%
- **行覆盖率**: >= 80%

### 测试边界条件
```typescript
// 必须测试的边界条件
- 空输入 (null, undefined, '')
- 空数组 ([])
- 边界值 (最小值、最大值)
- 无效格式
- 权限不足
- 资源不存在
- 并发操作
```

---

## 11. 错误处理规范

<!-- KB-TYPE: error_handling -->
<!-- KB-KEYWORDS: 错误, 异常, 处理 -->

### 自定义错误类
```typescript
// 基础业务错误
class BusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// 具体错误类型
class NotFoundError extends BusinessError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} with id ${id} not found`, 404);
  }
}

class ValidationError extends BusinessError {
  constructor(
    public errors: Array<{ field: string; message: string }>,
  ) {
    super('VALIDATION_ERROR', 'Validation failed', 400);
  }
}

class UnauthorizedError extends BusinessError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}
```

### 错误处理中间件
```typescript
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // 记录错误日志
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 业务错误
  if (err instanceof BusinessError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      errorCode: err.code,
    });
  }

  // 未知错误
  return res.status(500).json({
    code: 500,
    message: 'Internal server error',
  });
}
```

---

## 12. 安全规范

<!-- KB-TYPE: security_standard -->
<!-- KB-KEYWORDS: 安全, 认证, 授权 -->

### 认证规范
```typescript
// JWT Token 结构
{
  "sub": "user-id",           // 用户ID
  "email": "user@example.com", // 用户邮箱
  "role": "user",              // 用户角色
  "iat": 1234567890,           // 签发时间
  "exp": 1234567890            // 过期时间
}

// Token 有效期
- Access Token: 15分钟
- Refresh Token: 7天
```

### 输入验证规范
```typescript
// 使用 Zod 进行验证
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(32),
  nickname: z.string().min(2).max(20),
});

// 验证并清理输入
function validateInput<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
```

### 敏感数据处理
```typescript
// 密码哈希
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// 日志脱敏
function sanitizeLog(data: object): object {
  const sensitiveFields = ['password', 'token', 'secret'];
  return Object.entries(data).reduce((acc, [key, value]) => {
    acc[key] = sensitiveFields.includes(key) ? '***' : value;
    return acc;
  }, {});
}
```

---

## 13. 性能规范

<!-- KB-TYPE: performance_standard -->
<!-- KB-KEYWORDS: 性能, 响应时间, 优化 -->

### 响应时间要求
| 操作类型 | 目标响应时间 | 最大响应时间 |
|---------|------------|------------|
| 简单查询 | < 100ms | < 500ms |
| 复杂查询 | < 500ms | < 2s |
| 列表分页 | < 200ms | < 1s |
| 创建/更新 | < 200ms | < 1s |
| 文件上传 | < 3s | < 10s |

### 数据库优化
```sql
-- 必须添加索引的场景
- 主键
- 外键
- 经常作为查询条件的字段
- 排序字段
- 唯一约束字段

-- 示例
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_preferences_user_id ON user_preferences(user_id);
```

### 分页规范
```typescript
// 默认分页参数
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// 分页响应
interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

---

# 第三部分：项目特定知识

---

## 14. 项目约定

<!-- KB-TYPE: project_convention -->
<!-- KB-KEYWORDS: 项目, 约定, 配置 -->

### 目录结构
```
project-root/
├── src/
│   ├── controllers/     # 控制器
│   ├── services/        # 业务服务
│   ├── repositories/    # 数据仓储
│   ├── models/          # 数据模型
│   ├── middlewares/     # 中间件
│   ├── utils/           # 工具函数
│   ├── types/           # 类型定义
│   └── config/          # 配置
├── tests/
│   ├── unit/            # 单元测试
│   ├── integration/     # 集成测试
│   └── e2e/             # E2E测试
├── prisma/
│   └── schema.prisma    # 数据库Schema
├── docs/
│   └── rag/             # 知识库文档
└── package.json
```

### 环境配置
```bash
# 开发环境
DATABASE_URL=postgresql://localhost:5432/dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret

# 测试环境
DATABASE_URL=postgresql://localhost:5432/test
REDIS_URL=redis://localhost:6379
JWT_SECRET=test-secret
```

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|-----|------|---------|
| 2024-01-15 | 1.0.0 | 初始版本 |
