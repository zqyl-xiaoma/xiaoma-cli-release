# Phase 5: 自动测试验证

> **工作流 ID**: phase-test
> **触发命令**: `*phase-test`
> **角色激活**: TEA (测试架构师)

---

## 阶段目标

执行全面的测试验证，包括单元测试、集成测试、端到端测试，以及质量门禁检查，确保实现符合所有需求和质量标准。

---

## 输入要求

```yaml
inputs:
  required:
    - name: implemented_code
      description: Phase 4 实现的代码
      path: "{project-root}/src/"

    - name: test_code
      description: Phase 4 编写的测试
      path: "{project-root}/tests/"

    - name: prd
      description: PRD 文档
      path: "prd.md"

    - name: stories
      description: 用户故事
      path: "stories/"

  auto_loaded:
    - name: test_kb
      description: 测试知识库
      path: "knowledge-base/technical/testing-standards/"
```

---

## 执行步骤

### Step 5.1: 测试套件执行

```yaml
task: execute_test_suites
actions:
  - name: 运行单元测试
    command: "npm run test:unit"
    collect:
      - 通过/失败数量
      - 覆盖率报告
      - 失败详情

  - name: 运行集成测试
    command: "npm run test:integration"
    collect:
      - 通过/失败数量
      - API 测试结果
      - 数据库测试结果

  - name: 运行端到端测试
    command: "npm run test:e2e"
    if: e2e_tests_exist
    collect:
      - 通过/失败数量
      - 用户流程测试结果
```

**测试执行报告**:

```yaml
test_execution:
  unit_tests:
    total: 45
    passed: 45
    failed: 0
    skipped: 0
    duration: "12.5s"
    coverage:
      statements: 87%
      branches: 82%
      functions: 90%
      lines: 87%

  integration_tests:
    total: 15
    passed: 15
    failed: 0
    skipped: 0
    duration: "45.2s"

  e2e_tests:
    total: 8
    passed: 8
    failed: 0
    skipped: 0
    duration: "2m 15s"

  summary:
    total_tests: 68
    total_passed: 68
    total_failed: 0
    overall_pass_rate: 100%
```

---

### Step 5.2: 需求追溯验证

```yaml
task: requirement_traceability
actions:
  - name: 构建追溯矩阵
    map:
      - FR → Stories → Tests
      - AC → Test Cases

  - name: 验证覆盖率
    check:
      - 每个 FR 都有对应测试
      - 每个 AC 都有对应测试用例
      - 无遗漏的需求

  - name: 生成追溯报告
    output: "traceability-matrix.md"
```

**追溯矩阵**:

```markdown
# 需求追溯矩阵

## FR → Story → Test 映射

| FR ID | FR 名称 | Story ID | Test File | Test Cases | 状态 |
|-------|--------|----------|-----------|------------|------|
| FR-001 | 用户偏好设置 | STORY-001 | preferenceService.test.ts | 6 | ✅ |
| FR-002 | 偏好导出 | STORY-002 | exportService.test.ts | 4 | ✅ |

## AC → Test Case 映射

| Story ID | AC ID | AC 描述 | Test Case | 状态 |
|----------|-------|--------|-----------|------|
| STORY-001 | AC-001 | 获取用户偏好 | should return user preferences | ✅ |
| STORY-001 | AC-002 | 用户不存在 | should throw UserNotFoundError | ✅ |

## 覆盖率统计

- FR 覆盖率: 100% (12/12)
- AC 覆盖率: 100% (24/24)
- 未覆盖项: 0
```

---

### Step 5.3: 质量门禁检查

```yaml
task: quality_gate_check
actions:
  - name: 代码覆盖率检查
    threshold:
      statements: ">= 80%"
      branches: ">= 75%"
      functions: ">= 85%"
      lines: ">= 80%"

  - name: 代码质量检查
    run: "npm run lint"
    threshold:
      errors: 0
      warnings: "<= 10"

  - name: 安全扫描
    run: "npm audit"
    threshold:
      critical: 0
      high: 0

  - name: 类型检查
    run: "npm run type-check"
    threshold:
      errors: 0

  - name: 构建验证
    run: "npm run build"
    threshold:
      success: true
```

**质量门禁报告**:

```yaml
quality_gates:
  code_coverage:
    status: "PASS"
    results:
      statements: { actual: 87%, threshold: 80%, status: "PASS" }
      branches: { actual: 82%, threshold: 75%, status: "PASS" }
      functions: { actual: 90%, threshold: 85%, status: "PASS" }
      lines: { actual: 87%, threshold: 80%, status: "PASS" }

  code_quality:
    status: "PASS"
    results:
      lint_errors: 0
      lint_warnings: 3
      complexity_issues: 0

  security:
    status: "PASS"
    results:
      critical_vulnerabilities: 0
      high_vulnerabilities: 0
      medium_vulnerabilities: 2
      low_vulnerabilities: 5

  type_check:
    status: "PASS"
    results:
      type_errors: 0

  build:
    status: "PASS"
    results:
      build_success: true
      build_time: "45s"

  overall_status: "PASS"
```

---

### Step 5.4: NFR 验证

```yaml
task: nfr_validation
actions:
  - name: 性能测试
    tests:
      - 响应时间测试
      - 并发测试
      - 负载测试

  - name: 安全测试
    tests:
      - 认证测试
      - 授权测试
      - 输入验证测试

  - name: 可用性检查
    checks:
      - 响应式布局
      - 错误处理友好性
      - 加载状态
```

**NFR 验证报告**:

```yaml
nfr_validation:
  performance:
    - nfr_id: "NFR-PERF-001"
      requirement: "页面响应时间 < 2s"
      actual: "1.2s"
      status: "PASS"

    - nfr_id: "NFR-PERF-002"
      requirement: "API 响应时间 < 500ms"
      actual: "320ms"
      status: "PASS"

  security:
    - nfr_id: "NFR-SEC-001"
      requirement: "所有 API 需要认证"
      tested: true
      status: "PASS"

    - nfr_id: "NFR-SEC-002"
      requirement: "敏感数据加密传输"
      tested: true
      status: "PASS"

  usability:
    - nfr_id: "NFR-USA-001"
      requirement: "支持响应式布局"
      tested: true
      status: "PASS"
```

---

### Step 5.5: 回归测试

```yaml
task: regression_testing
actions:
  - name: 运行现有测试套件
    command: "npm run test:all"
    purpose: "确保新代码未破坏现有功能"

  - name: 比较测试结果
    compare:
      - 与上次测试结果对比
      - 识别新失败的测试
      - 识别新通过的测试

  - name: 分析回归问题
    if: has_regression
    actions:
      - 定位问题代码
      - 查询知识库获取修复方案
      - 自动修复或标记
```

---

### Step 5.6: 生成测试报告

**完整测试报告**:

```markdown
# 测试验证报告

## 报告信息
- **生成时间**: [时间戳]
- **迭代**: [迭代名称]
- **测试环境**: [环境信息]

---

## 1. 执行摘要

| 指标 | 结果 | 状态 |
|-----|------|------|
| 总测试数 | 68 | - |
| 通过测试 | 68 | ✅ |
| 失败测试 | 0 | ✅ |
| 通过率 | 100% | ✅ |
| 代码覆盖率 | 87% | ✅ |
| 质量门禁 | 全部通过 | ✅ |

**整体状态**: ✅ **验证通过**

---

## 2. 测试执行详情

### 2.1 单元测试
- 总数: 45
- 通过: 45
- 失败: 0
- 耗时: 12.5s

### 2.2 集成测试
- 总数: 15
- 通过: 15
- 失败: 0
- 耗时: 45.2s

### 2.3 端到端测试
- 总数: 8
- 通过: 8
- 失败: 0
- 耗时: 2m 15s

---

## 3. 代码覆盖率

```
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   87.2  |   82.1   |   90.0  |   87.2  |
 src/services/            |   92.5  |   88.0   |   95.0  |   92.5  |
 src/controllers/         |   85.0  |   78.0   |   88.0  |   85.0  |
 src/models/              |   88.0  |   82.0   |   90.0  |   88.0  |
```

---

## 4. 需求追溯

### 4.1 FR 覆盖率: 100%
所有功能需求都有对应的测试用例覆盖。

### 4.2 AC 覆盖率: 100%
所有接受标准都有对应的测试用例验证。

---

## 5. 质量门禁

| 门禁项 | 阈值 | 实际 | 状态 |
|-------|-----|-----|------|
| 代码覆盖率 | >= 80% | 87% | ✅ |
| Lint 错误 | 0 | 0 | ✅ |
| 安全漏洞(严重) | 0 | 0 | ✅ |
| 类型错误 | 0 | 0 | ✅ |
| 构建成功 | true | true | ✅ |

---

## 6. NFR 验证

| NFR | 要求 | 实际 | 状态 |
|-----|-----|-----|------|
| 响应时间 | < 2s | 1.2s | ✅ |
| API 延迟 | < 500ms | 320ms | ✅ |
| 安全认证 | 必需 | 已实现 | ✅ |

---

## 7. 问题和建议

### 7.1 发现的问题
无严重问题。

### 7.2 改进建议
1. 建议增加更多边界条件测试
2. 考虑添加性能基准测试

---

## 8. 结论

本次迭代的所有测试验证均已通过：
- ✅ 功能测试通过
- ✅ 质量门禁通过
- ✅ NFR 验证通过
- ✅ 需求追溯完整

**建议**: 可以进行发布。
```

---

## 失败处理

```yaml
failure_handlers:
  - scenario: "测试失败"
    actions:
      - 分析失败原因
      - 查询知识库获取解决方案
      - 如果是代码问题，返回 Phase 4 修复
      - 如果是测试问题，修复测试

  - scenario: "覆盖率不足"
    actions:
      - 识别未覆盖的代码路径
      - 生成补充测试
      - 重新运行测试

  - scenario: "质量门禁失败"
    actions:
      - 识别失败的门禁项
      - 自动修复可自动修复的问题
      - 重新检查
```

---

## 状态更新

```yaml
phases:
  phase_5_test:
    status: "completed"
    started_at: "[时间戳]"
    completed_at: "[时间戳]"
    outputs:
      - "test-report.md"
      - "quality-report.md"
      - "traceability-matrix.md"
      - "coverage-report/"
    metrics:
      total_tests: 68
      passed_tests: 68
      failed_tests: 0
      pass_rate: 100%
      code_coverage: 87%
      quality_gates_passed: true
      nfr_validated: true
    conclusion: "验证通过，可以发布"
```

---

## 最终输出

Phase 5 完成后，整个自动迭代开发流程结束，输出最终执行报告。

```yaml
final_report:
  execution_id: "[执行 ID]"
  status: "SUCCESS"

  phases_summary:
    phase_1_analyze: "completed"
    phase_2_plan: "completed"
    phase_3_design: "completed"
    phase_4_develop: "completed"
    phase_5_test: "completed"

  deliverables:
    documentation:
      - "requirement-analysis.md"
      - "prd.md"
      - "architecture.md"
      - "test-report.md"
    code:
      files_created: 12
      files_modified: 8
      tests_written: 68
    quality:
      test_coverage: 87%
      all_tests_passed: true
      quality_gates_passed: true

  knowledge_base_usage:
    business_rules_matched: 23
    technical_specs_referenced: 15
    new_knowledge_suggestions: 3

  recommendations:
    - "建议将本次迭代中的新增业务规则添加到知识库"
    - "建议更新性能基准测试"

  next_steps:
    - "代码合并到主分支"
    - "部署到测试环境"
    - "产品验收"
```
