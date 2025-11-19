const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs").promises;
const WebBuilder = require("./builders/web-builder");
const DependencyResolver = require("./lib/dependency-resolver");

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化构建器
const rootDir = path.join(__dirname, "..");
const builder = new WebBuilder({ rootDir });
const resolver = new DependencyResolver(rootDir);

// ==================== API 路由 ====================

/**
 * 健康检查
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * 获取所有可用的智能体列表
 * GET /api/agents
 */
app.get("/api/agents", async (req, res) => {
  try {
    const agents = await resolver.listAgents();
    res.json({
      success: true,
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    console.error("Error listing agents:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 获取所有可用的团队列表
 * GET /api/teams
 */
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await resolver.listTeams();
    res.json({
      success: true,
      data: teams,
      count: teams.length,
    });
  } catch (error) {
    console.error("Error listing teams:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 获取特定智能体的详细信息
 * GET /api/agents/:name/info
 */
app.get("/api/agents/:name/info", async (req, res) => {
  try {
    const agentName = req.params.name;
    const agentPath = path.join(rootDir, "xiaoma-core", "agents", `${agentName}.md`);

    // 检查文件是否存在
    try {
      await fs.access(agentPath);
    } catch {
      return res.status(404).json({
        success: false,
        error: `Agent '${agentName}' not found`,
      });
    }

    const content = await fs.readFile(agentPath, "utf-8");

    // 解析 YAML 配置 (简单提取)
    const yamlMatch = content.match(/```yaml\n([\s\S]*?)\n```/);
    let config = null;
    if (yamlMatch) {
      const yaml = require("js-yaml");
      config = yaml.load(yamlMatch[1]);
    }

    res.json({
      success: true,
      data: {
        name: agentName,
        path: agentPath,
        config: config,
      },
    });
  } catch (error) {
    console.error("Error getting agent info:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 获取智能体的完整 bundle 内容
 * GET /api/agents/:name/bundle
 */
app.get("/api/agents/:name/bundle", async (req, res) => {
  try {
    const agentName = req.params.name;
    const bundlePath = path.join(rootDir, "dist", "agents", `${agentName}.txt`);

    // 检查 bundle 是否存在
    try {
      await fs.access(bundlePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: `Bundle for agent '${agentName}' not found. Please run 'npm run build' first.`,
      });
    }

    const content = await fs.readFile(bundlePath, "utf-8");

    res.json({
      success: true,
      data: {
        agent: agentName,
        bundle: content,
        size: content.length,
      },
    });
  } catch (error) {
    console.error("Error getting agent bundle:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 获取团队的完整 bundle 内容
 * GET /api/teams/:name/bundle
 */
app.get("/api/teams/:name/bundle", async (req, res) => {
  try {
    const teamName = req.params.name;
    const bundlePath = path.join(rootDir, "dist", "teams", `${teamName}.txt`);

    // 检查 bundle 是否存在
    try {
      await fs.access(bundlePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: `Bundle for team '${teamName}' not found. Please run 'npm run build' first.`,
      });
    }

    const content = await fs.readFile(bundlePath, "utf-8");

    res.json({
      success: true,
      data: {
        team: teamName,
        bundle: content,
        size: content.length,
      },
    });
  } catch (error) {
    console.error("Error getting team bundle:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 构建智能体 bundles
 * POST /api/build/agents
 */
app.post("/api/build/agents", async (req, res) => {
  try {
    console.log("Building agent bundles...");
    await builder.buildAgents();

    res.json({
      success: true,
      message: "Agent bundles built successfully",
    });
  } catch (error) {
    console.error("Error building agents:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 构建团队 bundles
 * POST /api/build/teams
 */
app.post("/api/build/teams", async (req, res) => {
  try {
    console.log("Building team bundles...");
    await builder.buildTeams();

    res.json({
      success: true,
      message: "Team bundles built successfully",
    });
  } catch (error) {
    console.error("Error building teams:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 构建所有 bundles
 * POST /api/build/all
 */
app.post("/api/build/all", async (req, res) => {
  try {
    console.log("Building all bundles...");
    await builder.buildAgents();
    await builder.buildTeams();

    res.json({
      success: true,
      message: "All bundles built successfully",
    });
  } catch (error) {
    console.error("Error building all:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 验证配置
 * POST /api/validate
 */
app.post("/api/validate", async (req, res) => {
  try {
    const agents = await resolver.listAgents();
    const teams = await resolver.listTeams();

    const validationResults = {
      agents: [],
      teams: [],
    };

    // 验证智能体
    for (const agent of agents) {
      try {
        await resolver.resolveAgentDependencies(agent);
        validationResults.agents.push({ name: agent, valid: true });
      } catch (error) {
        validationResults.agents.push({
          name: agent,
          valid: false,
          error: error.message
        });
      }
    }

    // 验证团队
    for (const team of teams) {
      try {
        await resolver.resolveTeamDependencies(team);
        validationResults.teams.push({ name: team, valid: true });
      } catch (error) {
        validationResults.teams.push({
          name: team,
          valid: false,
          error: error.message
        });
      }
    }

    const allValid = validationResults.agents.every(a => a.valid) &&
                     validationResults.teams.every(t => t.valid);

    res.json({
      success: allValid,
      message: allValid ? "All configurations are valid" : "Some configurations have errors",
      data: validationResults,
    });
  } catch (error) {
    console.error("Error validating:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         XiaoMa-CLI API Server Started                  ║
╠════════════════════════════════════════════════════════╣
║  Port:        ${PORT}                                      ║
║  Environment: ${process.env.NODE_ENV || "development"}                         ║
║  Root Dir:    ${rootDir.substring(0, 40)}...   ║
╠════════════════════════════════════════════════════════╣
║  Available Endpoints:                                  ║
║  - GET  /health                    Health check        ║
║  - GET  /api/agents                List agents         ║
║  - GET  /api/teams                 List teams          ║
║  - GET  /api/agents/:name/info     Agent info          ║
║  - GET  /api/agents/:name/bundle   Agent bundle        ║
║  - GET  /api/teams/:name/bundle    Team bundle         ║
║  - POST /api/build/agents          Build agents        ║
║  - POST /api/build/teams           Build teams         ║
║  - POST /api/build/all             Build all           ║
║  - POST /api/validate              Validate configs    ║
╚════════════════════════════════════════════════════════╝
  `);
  console.log(`API Server is running at http://localhost:${PORT}`);
});

module.exports = app;
