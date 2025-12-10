const path = require('node:path');
const fs = require('fs-extra');
const yaml = require('js-yaml');

/**
 * Manages IDE configuration persistence
 * Saves and loads IDE-specific configurations to/from xiaoma/_cfg/ides/
 */
class IdeConfigManager {
  constructor() {}

  /**
   * Get path to IDE config directory
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @returns {string} Path to IDE config directory
   */
  getIdeConfigDir(xiaomaDir) {
    return path.join(xiaomaDir, '_cfg', 'ides');
  }

  /**
   * Get path to specific IDE config file
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {string} ideName - IDE name (e.g., 'claude-code')
   * @returns {string} Path to IDE config file
   */
  getIdeConfigPath(xiaomaDir, ideName) {
    return path.join(this.getIdeConfigDir(xiaomaDir), `${ideName}.yaml`);
  }

  /**
   * Save IDE configuration
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {string} ideName - IDE name
   * @param {Object} configuration - IDE-specific configuration object
   */
  async saveIdeConfig(xiaomaDir, ideName, configuration) {
    const configDir = this.getIdeConfigDir(xiaomaDir);
    await fs.ensureDir(configDir);

    const configPath = this.getIdeConfigPath(xiaomaDir, ideName);
    const now = new Date().toISOString();

    // Check if config already exists to preserve configured_date
    let configuredDate = now;
    if (await fs.pathExists(configPath)) {
      try {
        const existing = await this.loadIdeConfig(xiaomaDir, ideName);
        if (existing && existing.configured_date) {
          configuredDate = existing.configured_date;
        }
      } catch {
        // Ignore errors reading existing config
      }
    }

    const configData = {
      ide: ideName,
      configured_date: configuredDate,
      last_updated: now,
      configuration: configuration || {},
    };

    const yamlContent = yaml.dump(configData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    // Ensure POSIX-compliant final newline
    const content = yamlContent.endsWith('\n') ? yamlContent : yamlContent + '\n';
    await fs.writeFile(configPath, content, 'utf8');
  }

  /**
   * Load IDE configuration
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {string} ideName - IDE name
   * @returns {Object|null} IDE configuration or null if not found
   */
  async loadIdeConfig(xiaomaDir, ideName) {
    const configPath = this.getIdeConfigPath(xiaomaDir, ideName);

    if (!(await fs.pathExists(configPath))) {
      return null;
    }

    try {
      const content = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(content);
      return config;
    } catch (error) {
      console.warn(`Warning: Failed to load IDE config for ${ideName}:`, error.message);
      return null;
    }
  }

  /**
   * Load all IDE configurations
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @returns {Object} Map of IDE name to configuration
   */
  async loadAllIdeConfigs(xiaomaDir) {
    const configDir = this.getIdeConfigDir(xiaomaDir);
    const configs = {};

    if (!(await fs.pathExists(configDir))) {
      return configs;
    }

    try {
      const files = await fs.readdir(configDir);
      for (const file of files) {
        if (file.endsWith('.yaml')) {
          const ideName = file.replace('.yaml', '');
          const config = await this.loadIdeConfig(xiaomaDir, ideName);
          if (config) {
            configs[ideName] = config.configuration;
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Failed to load IDE configs:', error.message);
    }

    return configs;
  }

  /**
   * Check if IDE has saved configuration
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {string} ideName - IDE name
   * @returns {boolean} True if configuration exists
   */
  async hasIdeConfig(xiaomaDir, ideName) {
    const configPath = this.getIdeConfigPath(xiaomaDir, ideName);
    return await fs.pathExists(configPath);
  }

  /**
   * Delete IDE configuration
   * @param {string} xiaomaDir - XIAOMA installation directory
   * @param {string} ideName - IDE name
   */
  async deleteIdeConfig(xiaomaDir, ideName) {
    const configPath = this.getIdeConfigPath(xiaomaDir, ideName);
    if (await fs.pathExists(configPath)) {
      await fs.remove(configPath);
    }
  }
}

module.exports = { IdeConfigManager };
