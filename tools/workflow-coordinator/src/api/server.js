const express = require('express');
const cors = require('cors');
const chalk = require('chalk');

class CoordinatorServer {
  constructor(controller) {
    this.app = express();
    this.controller = controller;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(cors());

    // 请求日志
    this.app.use((req, res, next) => {
      const timestamp = new Date().toISOString();
      console.log(chalk.gray(`[${timestamp}] ${req.method} ${req.path}`));
      next();
    });
  }

  setupRoutes() {
    // API: 启动工作流
    this.app.post('/workflow/start', async (req, res) => {
      try {
        const { workflowId, context } = req.body;

        console.log(chalk.cyan(`\n📥 收到启动请求: ${workflowId}`));

        const result = await this.controller.startWorkflow(workflowId, context);

        console.log(chalk.green(`✅ 返回第一步指令: ${result.firstStep.stepId}`));
        console.log(chalk.gray(`   智能体: ${result.firstStep.agent}`));

        res.json(result);
      } catch (error) {
        console.error(chalk.red(`❌ 启动失败: ${error.message}`));
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 步骤完成回调
    this.app.post('/workflow/step-complete', async (req, res) => {
      try {
        const { workflowId, stepId, status, outputs, duration } = req.body;

        console.log(chalk.cyan(`\n📥 步骤完成: ${stepId}`));
        console.log(chalk.gray(`   耗时: ${Math.round(duration / 1000)}秒`));
        console.log(chalk.gray(`   输出: ${outputs.length}个文件`));

        outputs.forEach(output => {
          const icon = output.exists ? '✓' : '✗';
          const color = output.exists ? chalk.green : chalk.red;
          console.log(color(`     ${icon} ${output.file} (${output.size} bytes)`));
        });

        const result = await this.controller.onStepComplete({
          workflowId,
          stepId,
          status,
          outputs,
          duration
        });

        if (result.hasNextStep) {
          console.log(chalk.green(`✅ 返回下一步指令: ${result.nextStep.stepId}`));
          console.log(chalk.yellow(`   进度: ${result.progress.percentComplete}% (${result.progress.currentStepIndex}/${result.progress.totalSteps})`));
        } else {
          console.log(chalk.green.bold(`\n🎉 工作流执行完成!\n`));
          if (result.summary) {
            console.log(chalk.cyan(`总耗时: ${result.summary.totalDurationFormatted}`));
            console.log(chalk.cyan(`完成步骤: ${result.summary.totalSteps}`));
            console.log(chalk.cyan(`生成文档: ${result.summary.outputs.length}个`));
          }
        }

        res.json(result);
      } catch (error) {
        console.error(chalk.red(`❌ 处理失败: ${error.message}`));
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 步骤失败回调
    this.app.post('/workflow/step-failed', async (req, res) => {
      try {
        const { workflowId, stepId, error, errorDetails } = req.body;

        console.log(chalk.red(`\n❌ 步骤失败: ${stepId}`));
        console.log(chalk.red(`   错误: ${error}`));

        const result = await this.controller.onStepFailed({
          workflowId,
          stepId,
          error,
          errorDetails
        });

        if (result.action === 'retry') {
          console.log(chalk.yellow(`⏳ 准备重试: ${result.retryCount}/${result.maxRetries}`));
        } else if (result.action === 'abort') {
          console.log(chalk.red.bold(`🚨 工作流中止`));
          console.log(chalk.red(`   ${result.escalation}`));
        }

        res.json(result);
      } catch (error) {
        console.error(chalk.red(`❌ 处理失败: ${error.message}`));
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 查询状态
    this.app.get('/workflow/status', (req, res) => {
      try {
        const status = this.controller.getStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: 中止工作流
    this.app.post('/workflow/abort', async (req, res) => {
      try {
        const { workflowId, reason } = req.body;

        console.log(chalk.yellow(`\n⏸️  中止工作流: ${reason}`));

        await this.controller.abort(workflowId, reason);

        res.json({
          success: true,
          message: '工作流已中止,状态已保存'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    });

    // 根路径
    this.app.get('/', (req, res) => {
      res.json({
        name: 'XiaoMa Workflow Coordinator',
        version: '1.0.0',
        endpoints: [
          'POST /workflow/start',
          'POST /workflow/step-complete',
          'POST /workflow/step-failed',
          'GET  /workflow/status',
          'POST /workflow/abort',
          'GET  /health'
        ]
      });
    });
  }

  async start(port) {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          resolve();
        });
      });
    }
  }
}

module.exports = CoordinatorServer;
