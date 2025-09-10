# 串行执行增强工作流使用指南

# Enhanced Serial Execution Workflow Usage Guide

## 🎯 系统概述

**最新优化版本** - 采用严格串行执行模式，确保每个任务100%完成并通过质量门控后才能开始下一个任务。

### 🔄 核心执行原则

- **严格串行执行**: 第一个任务完全成功后再进行第二项
- **100%质量保证**: 每个任务必须完全通过所有质量门控
- **依赖验证**: 后续工作严格依赖前面工作结果
- **零容错标准**: 关键质量门必须100%通过

## 🚀 如何启动工作流

### 方法1: 基础启动（推荐）

```markdown
\*start-enhanced-workflow
```

### 方法2: 指定串行模式配置

```markdown
\*start-enhanced-workflow --mode=MAXIMUM_QUALITY --execution=sequential --quality-strict=true
```

### 方法3: 针对特定阶段启动

```markdown
*requirements-coverage-audit # 先进行需求覆盖度审计
*enhanced-workflow # 然后启动完整工作流
```

## 📋 完整执行流程详解

### 🏁 阶段1: 项目分析与概要设计

**预计时间**: 15-20分钟
**执行模式**: 串行，必须100%完成

```yaml
任务: 项目分析 (analyst)
输出: project-brief.md
质量门控: ✅ completeness_check (100%)
  ✅ feasibility_validation (100%)
  ✅ 100_percent_completion_validated
成功标准:
  - project_brief_quality_score: >90
  - completeness_percentage: 100%
  - feasibility_confirmed: true
```

⚠️ **重要**: 只有当项目分析100%完成并通过所有质量门控后，才能开始下一阶段。

### 📋 阶段2: 产品需求文档创建

**预计时间**: 20-30分钟
**依赖**: project-brief.md 必须完成

```yaml
任务: 创建PRD (pm)
输出: prd.md
依赖验证: ✅ verify_project_brief_completed
  ✅ validate_previous_quality_gates
质量门控: ✅ requirement_completeness (100%)
  ✅ measurability_check (100%)
  ✅ priority_validation (100%)
成功标准:
  - prd_quality_score: >95
  - requirement_coverage: 100%
```

### 🗄️ 阶段3: 数据库架构设计

**预计时间**: 25-35分钟
**依赖**: prd.md 必须完成

```yaml
任务序列:
1. 现有数据库分析 (database-architect)
   ↓ 100%完成后
2. 数据库设计 (database-architect)
   ↓ 100%完成后
3. DDL/DML脚本生成 (database-architect)
   ↓ 100%完成后
4. 实体类和映射器生成 (database-architect)

质量保证:
  - database_design_quality_score: >90
  - normalization_compliance: 100%
```

### 🎨 阶段4: 前端与架构设计

**预计时间**: 30-40分钟
**依赖**: 数据库设计必须完成

```yaml
任务序列:
1. 前端设计规范 (ux-expert)
   ↓ 等待完成
2. 全栈架构设计 (architect)

严格依赖关系:
  - 前端设计依赖: prd.md + database-design.md
  - 架构设计依赖: prd.md + database-design.md + front-end-spec.md
```

### ✅ 阶段5: 初步验证与调整

**预计时间**: 20-25分钟
**质量重点**: 7层质量验证

```yaml
任务: 产品负责人验证 (po)
验证层级:
  Layer 1: 语法格式验证 (100%必须通过)
  Layer 2: 内容完整性验证 (≥90%)
  Layer 3: 内容质量验证 (≥87%)
  Layer 4: 一致性验证 (≥96%)
  Layer 5: 实施可行性验证 (≥83%)
  Layer 6: 业务价值验证 (≥82%)
  Layer 7: 最终集成验证 (≥90%)

纠错机制: 发现问题后自动触发串行修复
```

### 📝 阶段6: 开发实施准备

**预计时间**: 15-20分钟
**执行模式**: 严格串行

```yaml
任务序列:
1. 文档分片 (po)
   ↓ 100%完成后
2. 用户故事创建 (sm) - 每个史诗依次完成
   ↓ 每个故事100%完成后
3. 实现开发 (dev) - 每个故事依次实现
   ↓ 每个实现100%完成后
4. QA初步审查 (qa)
```

### 🔍 阶段7: 全局质量审计

**预计时间**: 30-40分钟
**关键阶段**: 全面质量保证

```yaml
任务: 全局深度审计 (global-requirements-auditor)
验证维度: ✅ PRD到用户故事完整性 (100%)
  ✅ 用户故事质量评估 (≥95%)
  ✅ 实现完整性验证 (100%)
  ✅ 测试覆盖验证 (≥90%)
  ✅ 集成验证 (≥90%)
  ✅ 性能基准验证 (≥95%)
  ✅ 安全合规验证 (≥95%)

输出:
  - global-audit-report.md
  - requirements_coverage_matrix
  - quality_assessment_report
  - identified_issues_list
```

### 🔧 阶段8: 串行问题修复

**预计时间**: 30-60分钟（取决于问题数量）
**执行模式**: 严格串行修复

```yaml
修复序列:
1. 用户故事问题修复 (sm)
   成功标准: all_story_issues_resolved: 100%
   ↓ 100%完成后

2. 实现问题修复 (dev)
   依赖: story_fixes_completed
   成功标准: all_code_issues_resolved: 100%
   ↓ 100%完成后

3. 测试覆盖修复 (qa)
   依赖: implementation_fixes_completed
   成功标准: test_coverage: >90%

质量保证: 每个修复必须通过验证后才能进行下一个
```

### 🔄 阶段9: 质量保证循环

**预计时间**: 可变（最多5轮循环）
**退出条件**: 零关键问题

```yaml
循环条件:
- 最大迭代次数: 5
- 退出标准:
  ✅ no_critical_issues: true
  ✅ no_high_priority_issues: true
  ✅ quality_score: >90
  ✅ all_requirements_covered: true

每轮循环:
1. 重新审计 → 2. 问题分发 → 3. 串行修复 → 4. 修复验证
```

### 🎉 阶段10: 最终验证与发布

**预计时间**: 15-20分钟
**质量标准**: 发布就绪

```yaml
最终验收 (po):
  ✅ all_requirements_implemented: true
  ✅ zero_critical_defects: true
  ✅ performance_benchmarks_met: true
  ✅ security_clearance_obtained: true
  ✅ sequential_completion_verified: true

部署准备 (devops): ✅ validated_code
  ✅ database_migrations
  ✅ rollback_plan
```

## 🛡️ 质量保证机制

### 串行执行保障

```yaml
严格依赖验证:
  - wait_for_previous: true
  - dependency_validation: mandatory
  - completion_requirement: 100%

质量门控:
  - 100_percent_completion_validated: 每个任务
  - inter_task_dependencies_validated: 跨任务验证
  - sequential_completion_verified: 串行完成验证
```

### 监控指标

```yaml
串行执行专用指标:
  - sequential_completion_rate: 串行完成率
  - dependency_satisfaction_rate: 依赖满足率
  - inter_task_quality_gates: 任务间质量门控
  - quality_gate_pass_rate: 质量门控通过率

告警系统:
  - sequential_execution_blocked: 串行执行阻塞
  - dependency_validation_failed: 依赖验证失败
  - quality_gate_failure: 质量门控失败
```

## 📊 实时监控面板

### 关键指标监控

1. **执行进度追踪**
   - 当前阶段: 显示正在执行的具体任务
   - 完成百分比: 每个阶段的精确进度
   - 预计剩余时间: 基于历史数据的智能预估

2. **质量分数实时显示**
   - 整体质量分数: 实时更新 (目标≥95)
   - 7层验证状态: 每层的通过状态
   - 依赖验证状态: 前置任务完成确认

3. **串行执行状态**
   - 任务等待队列: 等待执行的任务列表
   - 阻塞原因分析: 如果有任务被阻塞的具体原因
   - 预期恢复时间: 阻塞问题的预期解决时间

## ⚠️ 注意事项与最佳实践

### 关键注意事项

1. **绝对不能跳过质量门控**
   - 每个阶段都必须100%通过才能继续
   - 质量门控失败会自动触发修复流程

2. **依赖关系不可违反**
   - 后续任务严格依赖前置任务完成
   - 系统会自动验证依赖关系

3. **问题修复必须串行**
   - 故事问题 → 实现问题 → 测试问题
   - 每类问题必须100%解决后才能修复下一类

### 性能优化建议

1. **项目准备**

   ```bash
   # 确保项目结构正确
   mkdir -p docs/{prd,stories,architecture}

   # 验证模板文件可访问
   ls xiaoma-core/templates/*.yaml

   # 确认写入权限
   touch docs/test-write-permission && rm docs/test-write-permission
   ```

2. **执行期间监控**
   - 关注实时监控面板的质量分数变化
   - 及时响应质量门控失败告警
   - 监控依赖验证状态

3. **问题处理**
   - 质量门控失败: 等待自动修复完成
   - 依赖验证失败: 检查前置任务是否真正完成
   - 串行执行阻塞: 查看阻塞原因并等待自动恢复

## 🎯 预期成果

### 技术成果

- ✅ **完美的串行执行**: 确保每个任务依序完成
- ✅ **100%质量保证**: 所有关键质量门控通过
- ✅ **零依赖违反**: 严格的前置条件验证
- ✅ **自动问题修复**: 智能的错误检测和纠正

### 业务成果

- ✅ **开发就绪交付**: 可直接进入开发的高质量文档
- ✅ **零返工需求**: 质量保证减少后期返工
- ✅ **可追踪进度**: 清晰的执行状态和质量指标
- ✅ **持续改进**: 基于执行数据的优化建议

## 🚀 立即开始

准备好体验严格串行执行的高质量工作流了吗？

```markdown
\*start-enhanced-workflow
```

**系统将自动按照严格的串行顺序执行所有阶段，确保每一步都达到最高质量标准！**

---

> **注意**: 此工作流采用严格串行执行模式，执行时间可能比并行模式稍长，但质量保证和可靠性大幅提升。适合对质量要求极高的关键项目使用。
