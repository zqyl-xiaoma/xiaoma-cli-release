/**
 * 快速测试脚本
 * 测试核心功能:启动->完成多步->查看进度
 */

const fetch = require('node-fetch');
const chalk = require('chalk');

const BASE_URL = 'http://localhost:3001';

async function post(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

async function get(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  return response.json();
}

async function main() {
  console.log(chalk.blue.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║   工作流协调器快速测试   ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════╝\n'));

  try {
    // 1. 健康检查
    console.log(chalk.cyan('1. 健康检查...'));
    const health = await get('/health');
    console.log(chalk.green(`   ✓ 状态: ${health.status}\n`));

    // 2. 启动工作流
    console.log(chalk.cyan('2. 启动工作流...'));
    const workflowId = 'test-' + Date.now();
    const startResult = await post('/workflow/start', {
      workflowId: workflowId,
      context: {}
    });

    if (!startResult.success) {
      throw new Error('工作流启动失败');
    }

    console.log(chalk.green(`   ✓ 工作流: ${startResult.workflowName}`));
    console.log(chalk.gray(`   - ID: ${startResult.workflowId}`));
    console.log(chalk.gray(`   - 总步骤: ${startResult.totalSteps}`));
    console.log(chalk.gray(`   - 第一步: ${startResult.firstStep.stepId}`));
    console.log(chalk.gray(`   - 智能体: ${startResult.firstStep.agent || '未指定'}\n`));

    // 3. 查询状态
    console.log(chalk.cyan('3. 查询初始状态...'));
    const status1 = await get('/workflow/status');
    console.log(chalk.green(`   ✓ 状态: ${status1.status}`));
    console.log(chalk.gray(`   - 当前步骤: ${status1.currentStep}`));
    console.log(chalk.gray(`   - 进度: ${status1.currentStepIndex}/${status1.totalSteps}\n`));

    // 4. 完成多个步骤
    console.log(chalk.cyan('4. 模拟完成所有步骤...\n'));

    let hasNext = true;
    let completedCount = 0;

    while (hasNext) {
      const currentStatus = await get('/workflow/status');
      const currentStepId = currentStatus.currentStep;

      console.log(chalk.yellow(`   步骤 ${completedCount + 1}: ${currentStepId}`));

      const completeResult = await post('/workflow/step-complete', {
        workflowId: workflowId,
        stepId: currentStepId,
        status: 'completed',
        outputs: [],  // 简化:不检查输出
        duration: 5000
      });

      completedCount++;

      if (completeResult.hasNextStep) {
        console.log(chalk.green(`      ✓ 完成 (进度: ${completeResult.progress.percentComplete}%)`));
        hasNext = true;
      } else {
        console.log(chalk.green.bold(`      ✓ 完成 - 工作流全部完成!\n`));
        hasNext = false;

        // 显示摘要
        const summary = completeResult.summary;
        console.log(chalk.cyan('5. 工作流完成摘要:'));
        console.log(chalk.green(`   ✓ 工作流名称: ${summary.workflowName}`));
        console.log(chalk.gray(`   - 总耗时: ${summary.totalDurationFormatted}`));
        console.log(chalk.gray(`   - 完成步骤: ${summary.totalSteps}`));
        console.log(chalk.gray(`   - 错误数: ${summary.errors}`));

        if (summary.outputs.length > 0) {
          console.log(chalk.gray(`   - 输出文件: ${summary.outputs.length}个`));
          summary.outputs.slice(0, 5).forEach(file => {
            console.log(chalk.gray(`     • ${file}`));
          });
          if (summary.outputs.length > 5) {
            console.log(chalk.gray(`     ... 还有 ${summary.outputs.length - 5} 个文件`));
          }
        }
      }
    }

    console.log(chalk.green.bold('\n╔════════════════════════════════════════╗'));
    console.log(chalk.green.bold('║   测试全部通过! ✓   ║'));
    console.log(chalk.green.bold('╚════════════════════════════════════════╝\n'));

  } catch (error) {
    console.error(chalk.red.bold('\n❌ 测试失败'));
    console.error(chalk.red(`错误: ${error.message}\n`));

    if (error.code === 'ECONNREFUSED') {
      console.log(chalk.yellow('提示: 请确保协调器正在运行'));
      console.log(chalk.gray('启动命令: node src/index.js start automated-requirements-analysis\n'));
    }

    process.exit(1);
  }
}

main();
