const path = require('node:path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { BaseIdeSetup } = require('./_base-ide');
const { AgentCommandGenerator } = require('./shared/agent-command-generator');
const { WorkflowCommandGenerator } = require('./shared/workflow-command-generator');
const { TaskToolCommandGenerator } = require('./shared/task-tool-command-generator');

/**
 * Rovo Dev IDE setup handler
 *
 * Installs XIAOMA agents as Rovo Dev subagents in .rovodev/subagents/
 * Installs workflows and tasks/tools as reference guides in .rovodev/
 * Rovo Dev automatically discovers agents and integrates with XIAOMA like other IDEs
 */
class RovoDevSetup extends BaseIdeSetup {
  constructor() {
    super('rovo-dev', 'Atlassian Rovo Dev', true); // preferred IDE
    this.configDir = '.rovodev';
    this.subagentsDir = 'subagents';
    this.workflowsDir = 'workflows';
    this.referencesDir = 'references';
  }

  /**
   * Cleanup old XIAOMA installation before reinstalling
   * @param {string} projectDir - Project directory
   */
  async cleanup(projectDir) {
    const rovoDevDir = path.join(projectDir, this.configDir);

    if (!(await fs.pathExists(rovoDevDir))) {
      return;
    }

    // Clean XIAOMA agents from subagents directory
    const subagentsDir = path.join(rovoDevDir, this.subagentsDir);
    if (await fs.pathExists(subagentsDir)) {
      const entries = await fs.readdir(subagentsDir);
      const xiaomaFiles = entries.filter((file) => file.startsWith('xiaoma-') && file.endsWith('.md'));

      for (const file of xiaomaFiles) {
        await fs.remove(path.join(subagentsDir, file));
      }
    }

    // Clean XIAOMA workflows from workflows directory
    const workflowsDir = path.join(rovoDevDir, this.workflowsDir);
    if (await fs.pathExists(workflowsDir)) {
      const entries = await fs.readdir(workflowsDir);
      const xiaomaFiles = entries.filter((file) => file.startsWith('xiaoma-') && file.endsWith('.md'));

      for (const file of xiaomaFiles) {
        await fs.remove(path.join(workflowsDir, file));
      }
    }

    // Clean XIAOMA tasks/tools from references directory
    const referencesDir = path.join(rovoDevDir, this.referencesDir);
    if (await fs.pathExists(referencesDir)) {
      const entries = await fs.readdir(referencesDir);
      const xiaomaFiles = entries.filter((file) => file.startsWith('xiaoma-') && file.endsWith('.md'));

      for (const file of xiaomaFiles) {
        await fs.remove(path.join(referencesDir, file));
      }
    }
  }

  /**
   * Setup Rovo Dev configuration
   * @param {string} projectDir - Project directory
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {Object} options - Setup options
   */
  async setup(projectDir, xiaomaDir, options = {}) {
    console.log(chalk.cyan(`Setting up ${this.name}...`));

    // Clean up old XIAOMA installation first
    await this.cleanup(projectDir);

    // Create .rovodev directory structure
    const rovoDevDir = path.join(projectDir, this.configDir);
    const subagentsDir = path.join(rovoDevDir, this.subagentsDir);
    const workflowsDir = path.join(rovoDevDir, this.workflowsDir);
    const referencesDir = path.join(rovoDevDir, this.referencesDir);

    await this.ensureDir(subagentsDir);
    await this.ensureDir(workflowsDir);
    await this.ensureDir(referencesDir);

    // Generate and install agents
    const agentGen = new AgentCommandGenerator(this.xiaomaFolderName);
    const { artifacts: agentArtifacts } = await agentGen.collectAgentArtifacts(xiaomaDir, options.selectedModules || []);

    let agentCount = 0;
    for (const artifact of agentArtifacts) {
      const subagentFilename = `xiaoma-${artifact.module}-${artifact.name}.md`;
      const targetPath = path.join(subagentsDir, subagentFilename);
      const subagentContent = this.convertToRovoDevSubagent(artifact.content, artifact.name, artifact.module);
      await this.writeFile(targetPath, subagentContent);
      agentCount++;
    }

    // Generate and install workflows
    const workflowGen = new WorkflowCommandGenerator(this.xiaomaFolderName);
    const { artifacts: workflowArtifacts, counts: workflowCounts } = await workflowGen.collectWorkflowArtifacts(xiaomaDir);

    let workflowCount = 0;
    for (const artifact of workflowArtifacts) {
      if (artifact.type === 'workflow-command') {
        const workflowFilename = path.basename(artifact.relativePath);
        const targetPath = path.join(workflowsDir, workflowFilename);
        await this.writeFile(targetPath, artifact.content);
        workflowCount++;
      }
    }

    // Generate and install tasks and tools
    const taskToolGen = new TaskToolCommandGenerator();
    const { tasks: taskCount, tools: toolCount } = await this.generateTaskToolReferences(xiaomaDir, referencesDir, taskToolGen);

    // Summary output
    console.log(chalk.green(`✓ ${this.name} configured:`));
    console.log(chalk.dim(`  - ${agentCount} agents installed to .rovodev/subagents/`));
    if (workflowCount > 0) {
      console.log(chalk.dim(`  - ${workflowCount} workflows installed to .rovodev/workflows/`));
    }
    if (taskCount + toolCount > 0) {
      console.log(
        chalk.dim(`  - ${taskCount + toolCount} tasks/tools installed to .rovodev/references/ (${taskCount} tasks, ${toolCount} tools)`),
      );
    }
    console.log(chalk.yellow(`\n  Note: Agents are automatically discovered by Rovo Dev`));
    console.log(chalk.dim(`  - Access agents by typing @ in Rovo Dev to see available options`));
    console.log(chalk.dim(`  - Workflows and references are available in .rovodev/ directory`));

    return {
      success: true,
      agents: agentCount,
      workflows: workflowCount,
      tasks: taskCount,
      tools: toolCount,
    };
  }

  /**
   * Generate task and tool reference guides
   * @param {string} xiaomaDir - XIAOMA directory
   * @param {string} referencesDir - References directory
   * @param {TaskToolCommandGenerator} taskToolGen - Generator instance
   */
  async generateTaskToolReferences(xiaomaDir, referencesDir, taskToolGen) {
    const tasks = await taskToolGen.loadTaskManifest(xiaomaDir);
    const tools = await taskToolGen.loadToolManifest(xiaomaDir);

    const standaloneTasks = tasks ? tasks.filter((t) => t.standalone === 'true' || t.standalone === true) : [];
    const standaloneTools = tools ? tools.filter((t) => t.standalone === 'true' || t.standalone === true) : [];

    let taskCount = 0;
    for (const task of standaloneTasks) {
      const commandContent = taskToolGen.generateCommandContent(task, 'task');
      const targetPath = path.join(referencesDir, `xiaoma-task-${task.module}-${task.name}.md`);
      await this.writeFile(targetPath, commandContent);
      taskCount++;
    }

    let toolCount = 0;
    for (const tool of standaloneTools) {
      const commandContent = taskToolGen.generateCommandContent(tool, 'tool');
      const targetPath = path.join(referencesDir, `xiaoma-tool-${tool.module}-${tool.name}.md`);
      await this.writeFile(targetPath, commandContent);
      toolCount++;
    }

    return { tasks: taskCount, tools: toolCount };
  }

  /**
   * Convert XIAOMA agent launcher to Rovo Dev subagent format
   *
   * Rovo Dev subagents use Markdown files with YAML frontmatter containing:
   * - name: Unique identifier for the subagent
   * - description: One-line description of the subagent's purpose
   * - tools: Array of tools the subagent can use (optional)
   * - model: Specific model for this subagent (optional)
   * - load_memory: Whether to load memory files (optional, defaults to true)
   *
   * @param {string} launcherContent - Original agent launcher content
   * @param {string} agentName - Name of the agent
   * @param {string} moduleName - Name of the module
   * @returns {string} Rovo Dev subagent-formatted content
   */
  convertToRovoDevSubagent(launcherContent, agentName, moduleName) {
    // Extract metadata from the launcher XML
    const titleMatch = launcherContent.match(/title="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : this.formatTitle(agentName);

    const descriptionMatch = launcherContent.match(/description="([^"]+)"/);
    const description = descriptionMatch ? descriptionMatch[1] : `XIAOMA agent: ${title}`;

    const roleDefinitionMatch = launcherContent.match(/roleDefinition="([^"]+)"/);
    const roleDefinition = roleDefinitionMatch ? roleDefinitionMatch[1] : `You are a specialized agent for ${title.toLowerCase()} tasks.`;

    // Extract the main system prompt from the launcher (content after closing tags)
    let systemPrompt = roleDefinition;

    // Try to extract additional instructions from the launcher content
    const instructionsMatch = launcherContent.match(/<instructions>([\s\S]*?)<\/instructions>/);
    if (instructionsMatch) {
      systemPrompt += '\n\n' + instructionsMatch[1].trim();
    }

    // Build YAML frontmatter for Rovo Dev subagent
    const frontmatter = {
      name: `xiaoma-${moduleName}-${agentName}`,
      description: description,
      // Note: tools and model can be added by users in their .rovodev/subagents/*.md files
      // We don't enforce specific tools since XIAOMA agents are flexible
    };

    // Create YAML frontmatter string with proper quoting for special characters
    let yamlContent = '---\n';
    yamlContent += `name: ${frontmatter.name}\n`;
    // Quote description to handle colons and other special characters in YAML
    yamlContent += `description: "${frontmatter.description.replaceAll('"', String.raw`\"`)}"\n`;
    yamlContent += '---\n';

    // Combine frontmatter with system prompt
    const subagentContent = yamlContent + systemPrompt;

    return subagentContent;
  }

  /**
   * Detect whether Rovo Dev is already configured in the project
   * @param {string} projectDir - Project directory
   * @returns {boolean}
   */
  async detect(projectDir) {
    const rovoDevDir = path.join(projectDir, this.configDir);

    if (!(await fs.pathExists(rovoDevDir))) {
      return false;
    }

    // Check for XIAOMA agents in subagents directory
    const subagentsDir = path.join(rovoDevDir, this.subagentsDir);
    if (await fs.pathExists(subagentsDir)) {
      try {
        const entries = await fs.readdir(subagentsDir);
        if (entries.some((entry) => entry.startsWith('xiaoma-') && entry.endsWith('.md'))) {
          return true;
        }
      } catch {
        // Continue checking other directories
      }
    }

    // Check for XIAOMA workflows in workflows directory
    const workflowsDir = path.join(rovoDevDir, this.workflowsDir);
    if (await fs.pathExists(workflowsDir)) {
      try {
        const entries = await fs.readdir(workflowsDir);
        if (entries.some((entry) => entry.startsWith('xiaoma-') && entry.endsWith('.md'))) {
          return true;
        }
      } catch {
        // Continue checking other directories
      }
    }

    // Check for XIAOMA tasks/tools in references directory
    const referencesDir = path.join(rovoDevDir, this.referencesDir);
    if (await fs.pathExists(referencesDir)) {
      try {
        const entries = await fs.readdir(referencesDir);
        if (entries.some((entry) => entry.startsWith('xiaoma-') && entry.endsWith('.md'))) {
          return true;
        }
      } catch {
        // Continue
      }
    }

    return false;
  }
}

module.exports = { RovoDevSetup };
