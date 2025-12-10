const fs = require('fs-extra');
const path = require('node:path');
const chalk = require('chalk');

/**
 * IDE Manager - handles IDE-specific setup
 * Dynamically discovers and loads IDE handlers
 */
class IdeManager {
  constructor() {
    this.handlers = new Map();
    this.loadHandlers();
    this.xiaomaFolderName = 'xiaoma'; // Default, can be overridden
  }

  /**
   * Set the xiaoma folder name for all IDE handlers
   * @param {string} xiaomaFolderName - The xiaoma folder name
   */
  setBmadFolderName(xiaomaFolderName) {
    this.xiaomaFolderName = xiaomaFolderName;
    // Update all loaded handlers
    for (const handler of this.handlers.values()) {
      if (typeof handler.setBmadFolderName === 'function') {
        handler.setBmadFolderName(xiaomaFolderName);
      }
    }
  }

  /**
   * Dynamically load all IDE handlers from directory
   */
  loadHandlers() {
    const ideDir = __dirname;

    try {
      // Get all JS files in the IDE directory
      const files = fs.readdirSync(ideDir).filter((file) => {
        // Skip base class, manager, utility files (starting with _), and helper modules
        return (
          file.endsWith('.js') &&
          !file.startsWith('_') &&
          file !== 'manager.js' &&
          file !== 'workflow-command-generator.js' &&
          file !== 'task-tool-command-generator.js'
        );
      });

      // Sort alphabetically for consistent ordering
      files.sort();

      for (const file of files) {
        const moduleName = path.basename(file, '.js');

        try {
          const modulePath = path.join(ideDir, file);
          const HandlerModule = require(modulePath);

          // Get the first exported class (handles various export styles)
          const HandlerClass = HandlerModule.default || HandlerModule[Object.keys(HandlerModule)[0]];

          if (HandlerClass) {
            const instance = new HandlerClass();
            // Use the name property from the instance (set in constructor)
            // Only add if the instance has a valid name
            if (instance.name && typeof instance.name === 'string') {
              this.handlers.set(instance.name, instance);
            } else {
              console.log(chalk.yellow(`  Warning: ${moduleName} handler missing valid 'name' property`));
            }
          }
        } catch (error) {
          console.log(chalk.yellow(`  Warning: Could not load ${moduleName}: ${error.message}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Failed to load IDE handlers:'), error.message);
    }
  }

  /**
   * Get all available IDEs with their metadata
   * @returns {Array} Array of IDE information objects
   */
  getAvailableIdes() {
    const ides = [];

    for (const [key, handler] of this.handlers) {
      // Skip handlers without valid names
      const name = handler.displayName || handler.name || key;

      // Filter out invalid entries (undefined name, empty key, etc.)
      if (!key || !name || typeof key !== 'string' || typeof name !== 'string') {
        continue;
      }

      ides.push({
        value: key,
        name: name,
        preferred: handler.preferred || false,
      });
    }

    // Sort: preferred first, then alphabetical
    ides.sort((a, b) => {
      if (a.preferred && !b.preferred) return -1;
      if (!a.preferred && b.preferred) return 1;
      return a.name.localeCompare(b.name);
    });

    return ides;
  }

  /**
   * Get preferred IDEs (only Claude Code and Cursor)
   * @returns {Array} Array of preferred IDE information
   */
  getPreferredIdes() {
    const allowedIdes = new Set(['claude-code', 'cursor']);
    return this.getAvailableIdes().filter((ide) => allowedIdes.has(ide.value));
  }

  /**
   * Get non-preferred IDEs (disabled - only Claude Code and Cursor are available)
   * @returns {Array} Empty array - no additional IDEs shown
   */
  getOtherIdes() {
    return [];
  }

  /**
   * Setup IDE configuration
   * @param {string} ideName - Name of the IDE
   * @param {string} projectDir - Project directory
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {Object} options - Setup options
   */
  async setup(ideName, projectDir, xiaomaDir, options = {}) {
    const handler = this.handlers.get(ideName.toLowerCase());

    if (!handler) {
      console.warn(chalk.yellow(`⚠️  IDE '${ideName}' is not yet supported`));
      console.log(chalk.dim('Supported IDEs:', [...this.handlers.keys()].join(', ')));
      return { success: false, reason: 'unsupported' };
    }

    try {
      await handler.setup(projectDir, xiaomaDir, options);
      return { success: true, ide: ideName };
    } catch (error) {
      console.error(chalk.red(`Failed to setup ${ideName}:`), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cleanup IDE configurations
   * @param {string} projectDir - Project directory
   */
  async cleanup(projectDir) {
    const results = [];

    for (const [name, handler] of this.handlers) {
      try {
        await handler.cleanup(projectDir);
        results.push({ ide: name, success: true });
      } catch (error) {
        results.push({ ide: name, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get list of supported IDEs
   * @returns {Array} List of supported IDE names
   */
  getSupportedIdes() {
    return [...this.handlers.keys()];
  }

  /**
   * Check if an IDE is supported
   * @param {string} ideName - Name of the IDE
   * @returns {boolean} True if IDE is supported
   */
  isSupported(ideName) {
    return this.handlers.has(ideName.toLowerCase());
  }

  /**
   * Detect installed IDEs
   * @param {string} projectDir - Project directory
   * @returns {Array} List of detected IDEs
   */
  async detectInstalledIdes(projectDir) {
    const detected = [];

    for (const [name, handler] of this.handlers) {
      if (typeof handler.detect === 'function' && (await handler.detect(projectDir))) {
        detected.push(name);
      }
    }

    return detected;
  }

  /**
   * Install custom agent launchers for specified IDEs
   * @param {Array} ides - List of IDE names to install for
   * @param {string} projectDir - Project directory
   * @param {string} agentName - Agent name (e.g., "fred-commit-poet")
   * @param {string} agentPath - Path to compiled agent (relative to project root)
   * @param {Object} metadata - Agent metadata
   * @returns {Object} Results for each IDE
   */
  async installCustomAgentLaunchers(ides, projectDir, agentName, agentPath, metadata) {
    const results = {};

    for (const ideName of ides) {
      const handler = this.handlers.get(ideName.toLowerCase());

      if (!handler) {
        console.warn(chalk.yellow(`⚠️  IDE '${ideName}' is not yet supported for custom agent installation`));
        continue;
      }

      try {
        if (typeof handler.installCustomAgentLauncher === 'function') {
          const result = await handler.installCustomAgentLauncher(projectDir, agentName, agentPath, metadata);
          if (result) {
            results[ideName] = result;
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to install ${ideName} launcher: ${error.message}`));
      }
    }

    return results;
  }
}

module.exports = { IdeManager };
