/**
 * 工作流协调器集成测试
 *
 * 测试完整的工作流执行流程:
 * 1. 启动工作流
 * 2. 模拟步骤完成
 * 3. 验证下一步指令
 * 4. 测试失败重试
 * 5. 测试工作流完成
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// 辅助函数:发送POST请求
async function post(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

// 辅助函数:发送GET请求
async function get(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  return response.json();
}

// 测试1: 健康检查
async function testHealthCheck() {
  console.log('\n=== 测试1: 健康检查 ===');

  const result = await get('/health');
  console.log('✓ 健康检查响应:', result);

  if (result.status !== 'ok') {
    throw new Error('健康检查失败');
  }
}

// 测试2: 启动工作流
async function testStartWorkflow() {
  console.log('\n=== 测试2: 启动工作流 ===');

  const result = await post('/workflow/start', {
    workflowId: 'test-workflow-' + Date.now(),
    context: {
      userRequirement: '用户需求示例'
    }
  });

  console.log('✓ 工作流启动响应:');
  console.log('  - 工作流名称:', result.workflowName);
  console.log('  - 总步骤数:', result.totalSteps);
  console.log('  - 第一步ID:', result.firstStep.stepId);
  console.log('  - 智能体:', result.firstStep.agent);

  if (!result.success) {
    throw new Error('工作流启动失败');
  }

  return result;
}

// 测试3: 查询状态
async function testQueryStatus() {
  console.log('\n=== 测试3: 查询状态 ===');

  const result = await get('/workflow/status');
  console.log('✓ 工作流状态:', result);

  if (result.status === 'not_started') {
    throw new Error('工作流未启动');
  }
}

// 测试4: 步骤完成(带输出验证失败)
async function testStepCompleteWithValidationFailure(workflowData) {
  console.log('\n=== 测试4: 步骤完成(输出验证失败) ===');

  // 模拟文件不存在的情况
  const result = await post('/workflow/step-complete', {
    workflowId: workflowData.workflowId,
    stepId: workflowData.firstStep.stepId,
    status: 'completed',
    outputs: [
      {
        file: workflowData.firstStep.expectedOutputs[0],
        exists: false,  // 文件不存在
        size: 0
      }
    ],
    duration: 5000
  });

  console.log('✓ 验证失败响应:');
  console.log('  - 成功标志:', result.success);
  console.log('  - 操作:', result.action);
  console.log('  - 问题数:', result.issues?.length || 0);

  if (result.success !== false || result.action !== 'fix_quality') {
    throw new Error('应该返回验证失败');
  }
}

// 测试5: 步骤完成(成功)
async function testStepCompleteSuccess(workflowData) {
  console.log('\n=== 测试5: 步骤完成(成功) ===');

  // 模拟所有文件都存在
  const outputs = workflowData.firstStep.expectedOutputs.map(file => ({
    file: file,
    exists: true,
    size: 1024
  }));

  const result = await post('/workflow/step-complete', {
    workflowId: workflowData.workflowId,
    stepId: workflowData.firstStep.stepId,
    status: 'completed',
    outputs: outputs,
    duration: 10000
  });

  console.log('✓ 步骤完成响应:');
  console.log('  - 成功标志:', result.success);
  console.log('  - 有下一步:', result.hasNextStep);

  if (result.hasNextStep) {
    console.log('  - 下一步ID:', result.nextStep.stepId);
    console.log('  - 智能体:', result.nextStep.agent);
    console.log('  - 进度:', `${result.progress.percentComplete}%`);
  }

  if (!result.success) {
    throw new Error('步骤完成失败');
  }

  return result;
}

// 测试6: 步骤失败和重试
async function testStepFailure(workflowData, currentStepId) {
  console.log('\n=== 测试6: 步骤失败和重试 ===');

  const result = await post('/workflow/step-failed', {
    workflowId: workflowData.workflowId,
    stepId: currentStepId,
    error: '模拟错误:文件未找到',
    errorDetails: {
      missingFile: 'templates/test.md'
    }
  });

  console.log('✓ 失败处理响应:');
  console.log('  - 成功标志:', result.success);
  console.log('  - 操作:', result.action);

  if (result.action === 'retry') {
    console.log('  - 重试次数:', `${result.retryCount}/${result.maxRetries}`);
  }

  return result;
}

// 测试7: 完成所有剩余步骤
async function testCompleteAllSteps(workflowData) {
  console.log('\n=== 测试7: 完成所有剩余步骤 ===');

  let hasNext = true;
  let currentStepIndex = 1; // 已经完成了第一步
  let nextStep = null;

  // 获取当前状态
  const status = await get('/workflow/status');
  const totalSteps = status.totalSteps;

  console.log(`需要完成 ${totalSteps - currentStepIndex} 个步骤`);

  while (hasNext && currentStepIndex < totalSteps) {
    // 获取当前步骤
    const statusNow = await get('/workflow/status');
    const currentStep = statusNow.currentStep;

    console.log(`\n正在完成步骤 ${currentStepIndex + 1}/${totalSteps}: ${currentStep}`);

    // 模拟步骤完成
    const result = await post('/workflow/step-complete', {
      workflowId: workflowData.workflowId,
      stepId: currentStep,
      status: 'completed',
      outputs: [], // 简化:不验证输出
      duration: 5000
    });

    hasNext = result.hasNextStep;
    currentStepIndex++;

    if (result.hasNextStep) {
      console.log(`✓ 进度: ${result.progress.percentComplete}%`);
    } else {
      console.log('\n✓ 工作流执行完成!');
      console.log('摘要:');
      console.log('  - 总耗时:', result.summary.totalDurationFormatted);
      console.log('  - 完成步骤:', result.summary.totalSteps);
      console.log('  - 错误数:', result.summary.errors);
    }
  }
}

// 主测试函数
async function runTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   工作流协调器集成测试   ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    // 确保协调器正在运行
    console.log('\n检查协调器是否运行...');
    await testHealthCheck();

    // 启动工作流
    const workflowData = await testStartWorkflow();

    // 等待一下让状态保存
    await new Promise(resolve => setTimeout(resolve, 100));

    // 查询状态
    await testQueryStatus();

    // 测试输出验证失败
    await testStepCompleteWithValidationFailure(workflowData);

    // 测试步骤成功完成
    const step1Result = await testStepCompleteSuccess(workflowData);

    if (step1Result.hasNextStep) {
      // 测试步骤失败和重试
      await testStepFailure(workflowData, step1Result.nextStep.stepId);

      // 重试后成功完成
      await testStepCompleteSuccess({
        ...workflowData,
        firstStep: step1Result.nextStep
      });
    }

    // 完成所有剩余步骤
    await testCompleteAllSteps(workflowData);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   所有测试通过! ✓   ║');
    console.log('╚════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行测试
runTests().catch(console.error);
