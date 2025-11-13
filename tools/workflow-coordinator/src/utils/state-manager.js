const fs = require('fs-extra');
const path = require('path');

class StateManager {
  constructor() {
    // 状态目录相对于项目根目录
    // 从 tools/workflow-coordinator/src/utils 向上找到项目根目录
    const projectRoot = path.resolve(__dirname, '../../../..');
    this.stateDir = path.join(projectRoot, '.xiaoma-core');
    this.stateFile = path.join(this.stateDir, '.coordinator-state.json');
  }

  /**
   * 保存工作流状态
   */
  async save(state) {
    await fs.ensureDir(this.stateDir);
    await fs.writeFile(
      this.stateFile,
      JSON.stringify(state, null, 2),
      'utf-8'
    );
  }

  /**
   * 加载工作流状态
   */
  async load() {
    if (!fs.existsSync(this.stateFile)) {
      return null;
    }

    try {
      const content = await fs.readFile(this.stateFile, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('状态文件加载失败:', error.message);
      return null;
    }
  }

  /**
   * 清除状态文件
   */
  async clear() {
    if (fs.existsSync(this.stateFile)) {
      await fs.remove(this.stateFile);
    }
  }

  /**
   * 检查是否存在状态文件
   */
  exists() {
    return fs.existsSync(this.stateFile);
  }
}

module.exports = StateManager;
