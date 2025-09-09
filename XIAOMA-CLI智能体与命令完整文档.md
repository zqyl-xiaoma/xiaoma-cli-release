# XIAOMA-CLI™ 智能体与命令完整分析文档

## 项目概述

XIAOMA-CLI™ 是一个通用AI智能体框架，专门用于实现敏捷软件开发中的完整AI团队协作。该框架实现了"Agentic Planning"（智能体规划）和"Context-Engineered Development"（上下文工程化开发）两个核心创新，通过专业化的AI智能体来解决软件开发中的规划不一致和上下文丢失问题。

## 框架架构

### 核心组成部分

1. **xiaoma-core/**: 核心智能体定义和任务
2. **tools/**: CLI工具和构建系统
3. **expansion-packs/**: 扩展包，提供特定领域的智能体
4. **dist/**: 构建后的Web版本智能体包

## 核心智能体分析

### 1. XiaoMa Orchestrator (xiaoma-orchestrator)

**角色**: 主控协调器和XiaoMa方法专家  
**图标**: 🎭  
**使用场景**: 工作流协调、多智能体任务、角色切换指导、不确定选择哪个专家时

#### 核心命令:

- `*help`: 显示可用智能体和工作流指南
- `*agent [name]`: 转换为专门智能体（未指定名称时列出所有）
- `*chat-mode`: 启动对话模式进行详细协助
- `*kb-mode`: 加载完整BMad知识库
- `*party-mode`: 与所有智能体进行群聊
- `*status`: 显示当前上下文、活跃智能体和进度
- `*task [name]`: 运行特定任务
- `*workflow [name]`: 启动特定工作流
- `*workflow-guidance`: 获取个性化工作流选择帮助
- `*plan`: 开始前创建详细工作流计划
- `*yolo`: 切换跳过确认模式
- `*exit`: 退出会话

#### 功能特点:

- 动态转换为任何专门智能体
- 按需加载资源，绝不预加载
- 评估需求并推荐最佳方法/智能体/工作流
- 跟踪当前状态并指导下一步逻辑步骤

### 2. Business Analyst (analyst) - xiaofen

**角色**: 洞察分析师和策略构想伙伴  
**图标**: 📊  
**使用场景**: 市场研究、头脑风暴、竞争分析、创建项目简介、初始项目发现、记录现有项目

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*brainstorm {topic}`: 促进结构化头脑风暴会话
- `*create-competitor-analysis`: 创建竞争对手分析文档
- `*create-project-brief`: 创建项目简介文档
- `*elicit`: 运行高级启发任务
- `*perform-market-research`: 执行市场研究
- `*research-prompt {topic}`: 创建深度研究提示
- `*doc-out`: 输出完整文档
- `*yolo`: 切换Yolo模式
- `*exit`: 退出分析师角色

#### 核心原则:

- 好奇心驱动的询问 - 问探索性"为什么"问题
- 客观和基于证据的分析
- 战略情境化
- 促进清晰和共同理解

### 3. Product Manager (pm) - xiaochan

**角色**: 调查性产品策略师和市场敏锐PM  
**图标**: 📋  
**使用场景**: 创建PRD、产品策略、功能优先级、路线图规划、利益相关者沟通

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*correct-course`: 执行纠正路线任务
- `*create-brownfield-epic`: 为现有项目项目创建史诗
- `*create-brownfield-prd`: 创建现有项目产品需求文档
- `*create-brownfield-story`: 为现有项目项目创建用户故事
- `*create-prd`: 运行创建PRD任务
- `*shard-prd`: 对提供的prd.md运行分片任务
- `*doc-out`: 输出完整文档
- `*yolo`: 切换Yolo模式
- `*exit`: 退出PM角色

#### 核心原则:

- 深度理解"为什么" - 发现根本原因和动机
- 拥护用户 - 保持对目标用户价值的无情专注
- 数据驱动决策与战略判断
- 无情的优先级排序和MVP专注

### 4. Architect (architect) - xiaojia

**角色**: 全面系统架构师和全栈技术领导  
**图标**: 🏗️  
**使用场景**: 系统设计、架构文档、技术选择、API设计、基础设施规划

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*create-backend-architecture`: 创建后端架构
- `*create-brownfield-architecture`: 创建现有项目架构
- `*create-front-end-architecture`: 创建前端架构
- `*create-full-stack-architecture`: 创建全栈架构
- `*document-project`: 执行项目文档任务
- `*execute-checklist {checklist}`: 运行检查清单
- `*research {topic}`: 执行深度研究提示任务
- `*shard-prd`: 对架构文档运行分片任务
- `*doc-out`: 输出完整文档
- `*yolo`: 切换Yolo模式
- `*exit`: 退出架构师角色

#### 核心原则:

- 整体系统思考 - 将每个组件视为更大系统的一部分
- 用户体验驱动架构 - 从用户旅程开始，向后工作
- 实用技术选择 - 在可能的地方选择成熟技术
- 渐进复杂性 - 设计系统简单开始但可扩展

### 5. Scrum Master (sm) - xiaomin

**角色**: 技术Scrum Master - 故事准备专家  
**图标**: 🏃  
**使用场景**: 故事创建、史诗管理、团队模式回顾、敏捷过程指导

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*correct-course`: 执行纠正路线任务
- `*draft`: 执行创建下一个故事任务
- `*story-checklist`: 执行故事草稿检查清单
- `*exit`: 退出Scrum Master角色

#### 核心原则:

- 严格遵循`create-next-story`程序生成详细用户故事
- 确保所有信息来自PRD和架构，以指导开发智能体
- 绝不允许实现故事或修改代码

### 6. Full Stack Developer (dev) - xiaokai

**角色**: 专家级高级软件工程师和实施专家  
**图标**: 💻  
**使用场景**: 代码实现、调试、重构、开发最佳实践

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*develop-story`: 按顺序实现故事任务
- `*explain`: 详细解释刚才做了什么，用于培训
- `*review-qa`: 运行QA修复任务
- `*run-tests`: 执行linting和测试
- `*exit`: 退出开发者角色

#### 核心原则:

- 故事包含除启动时加载内容外的所有需要信息
- 总是检查当前文件夹结构
- 只更新故事文件的Dev Agent Record部分
- 遵循develop-story命令进行故事实现

### 7. Test Architect & Quality Advisor (qa) - xiaoce

**角色**: 具有质量咨询权威的测试架构师  
**图标**: 🧪  
**使用场景**: 全面测试架构审查、质量门决策、代码改进

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*gate {story}`: 执行QA门任务写入质量门决策
- `*nfr-assess {story}`: 执行非功能需求评估
- `*review {story}`: 自适应、风险感知的全面审查
- `*risk-profile {story}`: 生成风险评估矩阵
- `*test-design {story}`: 创建全面测试场景
- `*trace {story}`: 使用Given-When-Then映射需求到测试
- `*exit`: 退出测试架构师角色

#### 核心原则:

- 按需深度 - 基于风险信号深入分析
- 需求可追溯性 - 使用Given-When-Then模式映射所有故事到测试
- 基于风险的测试 - 按概率×影响评估和优先级
- 质量属性验证

### 8. Product Owner (po) - guan

**角色**: 技术产品负责人和流程管理员  
**图标**: 📝  
**使用场景**: 待办事项管理、故事细化、验收标准、冲刺规划、优先级决策

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*correct-course`: 执行纠正路线任务
- `*create-epic`: 为现有项目项目创建史诗
- `*create-story`: 从需求创建用户故事
- `*execute-checklist-po`: 运行PO主检查清单
- `*shard-doc {document} {destination}`: 对文档运行分片任务
- `*validate-story-draft {story}`: 验证故事草稿
- `*doc-out`: 输出完整文档
- `*yolo`: 切换Yolo模式
- `*exit`: 退出PO角色

#### 核心原则:

- 质量和完整性守护者 - 确保所有工件全面一致
- 开发的清晰性和可操作性
- 流程遵循和系统化
- 依赖和序列警惕

### 9. UX Expert (ux-expert) - xiaoshe

**角色**: 用户体验设计师和UI专家  
**图标**: 🎨  
**使用场景**: UI/UX设计、线框图、原型、前端规范、用户体验优化

#### 核心命令:

- `*help`: 显示编号的命令列表
- `*create-front-end-spec`: 创建前端规范文档
- `*generate-ui-prompt`: 运行生成AI前端提示任务
- `*exit`: 退出UX专家角色

#### 核心原则:

- 用户中心至上 - 每个设计决策必须服务于用户需求
- 通过迭代简化 - 从简单开始，基于反馈改进
- 细节中的愉悦 - 周到的微交互创造难忘体验
- 为真实场景设计

## CLI工具命令

### 主要CLI命令 (tools/cli.js)

1. **build**: 构建Web包
   - `--agents-only`: 只构建智能体包
   - `--teams-only`: 只构建团队包
   - `--expansions-only`: 只构建扩展包
   - `--no-expansions`: 跳过构建扩展包
   - `--no-clean`: 跳过清理输出目录

2. **build:expansions**: 构建扩展包
   - `--expansion <name>`: 只构建特定扩展包
   - `--no-clean`: 跳过清理输出目录

3. **list:agents**: 列出所有可用智能体

4. **list:expansions**: 列出所有可用扩展包

5. **validate**: 验证智能体和团队配置

6. **upgrade**: 将XIAOMA-CLI™ V3项目升级到V4
   - `--project <path>`: V3项目路径
   - `--dry-run`: 显示更改但不执行
   - `--no-backup`: 跳过创建备份

### 代码库扁平化工具

**功能**: 将整个项目文件聚合为单个XML文件，便于AI模型分析

**使用命令**:

```bash
# 基本使用
npx xiaoma-cli flatten

# 指定输入目录
npx xiaoma-cli flatten --input /path/to/source/directory

# 指定输出文件
npx xiaoma-cli flatten --output my-project.xml

# 组合使用
npx xiaoma-cli flatten --input /path/to/source --output /path/to/output/codebase.xml
```

**特性**:

- AI优化输出：专为AI模型消费设计的清洁XML格式
- 智能过滤：自动遵守`.gitignore`模式排除不必要文件
- 二进制文件检测：智能识别和排除二进制文件
- 进度跟踪：实时进度指示器和完成统计

## 工作流程

### 1. 规划工作流程 (Web UI)

- 分析师创建项目简介和市场研究
- PM创建PRD文档
- 架构师创建架构文档
- UX专家创建前端规范（可选）

### 2. 核心开发周期 (IDE)

1. **PO**: 验证和分片PRD/架构文档
2. **SM**: 创建详细用户故事
3. **Dev**: 实现故事任务
4. **QA**: 审查和质量门控制
5. **重复**直至完成

### 3. 命令交互模式

所有智能体命令都必须以`*`前缀开始，例如：

- `*help`: 显示帮助
- `*agent pm`: 转换为产品经理
- `*create-prd`: 创建产品需求文档

## 配置文件

### core-config.yaml

定义项目级配置：

- `markdownExploder`: Markdown展开器启用
- `qa.qaLocation`: QA文档位置
- `prd.prdFile`: PRD文件路径
- `architecture.architectureFile`: 架构文件路径
- `devLoadAlwaysFiles`: 开发者始终加载的文件列表
- `devDebugLog`: 开发调试日志位置
- `devStoryLocation`: 开发故事位置
- `slashPrefix`: 命令前缀

## 项目特色功能

### 1. 智能体规划 (Agentic Planning)

专门的智能体（分析师、PM、架构师）协作创建详细、一致的PRD和架构文档

### 2. 上下文工程化开发 (Context-Engineered Development)

Scrum Master智能体将详细计划转换为超详细的开发故事，包含开发智能体需要的所有内容

### 3. 两阶段方法

消除规划不一致和上下文丢失 - AI辅助开发的最大问题

### 4. 模块化扩展

通过扩展包扩展到任何领域 - 创意写作、游戏开发、基础设施等

## 使用指南

### 快速开始

1. **安装**:

```bash
npx xiaoma-cli install
# 或
git pull && npm run install:bmad
```

2. **Web UI团队** (2分钟开始):
   - 下载团队文件 (dist/teams/team-fullstack.txt)
   - 创建AI智能体 (Gemini Gem或CustomGPT)
   - 上传文件并配置指令
   - 开始规划和构思

3. **IDE开发**:
   - 完成PRD和架构后切换到IDE
   - 分片文档并开始实现代码

### 最佳实践

1. **使用正确的智能体**:
   - 分析师：市场研究和头脑风暴
   - PM：PRD创建和产品策略
   - 架构师：系统设计和技术选择
   - SM：故事创建和敏捷过程
   - 开发者：代码实现
   - QA：测试和质量保证

2. **遵循工作流程**:
   - 始终从规划阶段开始
   - 分片大型文档以便管理
   - 按顺序执行开发周期

3. **利用命令系统**:
   - 所有命令以`*`开始
   - 使用`*help`了解可用选项
   - 利用智能体间的协作

## 技术栈支持

XIAOMA-CLI™支持各种技术栈：

- **前端**: React, Vue, Angular, HTML/CSS/JavaScript
- **后端**: Node.js, Python, Java, .NET, Go, PHP
- **数据库**: MySQL, PostgreSQL, MongoDB, Redis
- **部署**: Docker, Kubernetes, AWS, Azure, GCP
- **基础设施**: DevOps工具链

## 总结

XIAOMA-CLI™是一个强大的AI团队协作框架，通过专业化智能体和结构化工作流程，实现了从项目构思到代码实现的完整开发生命周期管理。其模块化设计和扩展包系统使其能够适应各种领域的需求，不仅限于软件开发，还包括创意写作、游戏开发、基础设施管理等多个领域。

框架的核心价值在于解决AI辅助开发中的两个关键问题：规划不一致和上下文丢失，通过智能体间的协作和详细的文档传递，确保开发过程的连续性和一致性。
