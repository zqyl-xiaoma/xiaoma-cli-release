#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const WorkflowParser = require('./parser/workflow-parser');
const WorkflowController = require('./controller/workflow-controller');
const CoordinatorServer = require('./api/server');

require('dotenv').config();

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const workflowName = args[1];

  console.log(chalk.blue.bold('\n╔════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║   XiaoMa 工作流协调器   ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════╝\n'));

  if (command === 'start' && workflowName) {
    try {
      // 1. 解析工作流
      console.log(chalk.cyan(`📋 解析工作流: ${workflowName}`));
      const parser = new WorkflowParser();
      const executionPlan = await parser.parse(workflowName);

      console.log(chalk.green(`✅ 工作流解析完成`));
      console.log(chalk.gray(`   名称: ${executionPlan.metadata.name}`));
      console.log(chalk.gray(`   步骤数: ${executionPlan.steps.length}`));
      console.log(chalk.gray(`   类型: ${executionPlan.metadata.type}`));

      // 2. 创建控制器
      const controller = new WorkflowController(executionPlan);

      // 3. 启动HTTP服务
      console.log(chalk.cyan(`\n🌐 启动HTTP服务...`));
      const server = new CoordinatorServer(controller);
      const port = process.env.COORDINATOR_PORT || 3001;

      await server.start(port);

      console.log(chalk.green.bold(`✅ HTTP服务已启动: http://localhost:${port}\n`));

      console.log(chalk.yellow(`⏳ 等待Claude Code连接...\n`));
      console.log(chalk.gray(`提示: 在Claude Code中执行以下命令启动工作流:\n`));
      console.log(chalk.cyan(`  /workflow-helper`));
      console.log(chalk.cyan(`  *start-workflow ${workflowName}\n`));

      console.log(chalk.gray(`按 Ctrl+C 停止协调器\n`));

      // 处理退出信号
      process.on('SIGINT', async () => {
        console.log(chalk.yellow(`\n\n⏸️  收到停止信号,正在关闭...`));
        await server.stop();
        console.log(chalk.green(`✅ 协调器已停止\n`));
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red.bold(`\n❌ 启动失败\n`));
      console.error(chalk.red(`错误: ${error.message}\n`));

      if (error.message.includes('工作流文件未找到')) {
        console.log(chalk.yellow(`提示: 请确认工作流文件存在于 xiaoma-core/workflows/ 目录下\n`));
        console.log(chalk.gray(`可用的工作流文件应该是:\n`));
        console.log(chalk.gray(`  - requirements-analysis.yaml`));
        console.log(chalk.gray(`  - story-development.yaml`));
        console.log(chalk.gray(`  - 或其他 .yaml 文件\n`));
      }

      process.exit(1);
    }

  } else if (command === 'test-api') {
    // 测试API端点
    console.log(chalk.cyan(`🧪 API端点测试模式\n`));
    console.log(chalk.gray(`启动简单的测试服务器...\n`));

    const express = require('express');
    const app = express();
    app.use(express.json());

    app.post('/workflow/start', (req, res) => {
      console.log(chalk.green(`✓ 收到 /workflow/start 请求`));
      console.log(chalk.gray(`  请求体: ${JSON.stringify(req.body, null, 2)}`));
      res.json({ success: true, message: 'Test OK' });
    });

    const port = process.env.COORDINATOR_PORT || 3001;
    app.listen(port, () => {
      console.log(chalk.green(`✅ 测试服务器运行在 http://localhost:${port}\n`));
      console.log(chalk.gray(`测试命令:`));
      console.log(chalk.cyan(`  curl -X POST http://localhost:${port}/workflow/start -H "Content-Type: application/json" -d '{"workflowId":"test"}'\n`));
    });

  } else {
    // 显示帮助
    console.log(chalk.gray('用法:\n'));
    console.log(chalk.white('  xiaoma-coordinator start <workflow-name>'));
    console.log(chalk.gray('    启动工作流协调器\n'));
    console.log(chalk.white('  xiaoma-coordinator test-api'));
    console.log(chalk.gray('    启动API测试服务器\n'));
    console.log(chalk.gray('示例:\n'));
    console.log(chalk.cyan('  xiaoma-coordinator start requirements-analysis'));
    console.log(chalk.cyan('  xiaoma-coordinator start story-development\n'));
  }
}

main().catch(error => {
  console.error(chalk.red(`\n❌ 未处理的错误: ${error.message}\n`));
  console.error(error.stack);
  process.exit(1);
});
