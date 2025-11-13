const fs = require('fs-extra');
const path = require('path');

class Validator {
  /**
   * 验证步骤输出
   */
  async validateOutputs(stepDef, actualOutputs) {
    const issues = [];

    // 验证所有预期输出文件
    for (const expectedOutput of stepDef.outputs || []) {
      const filePath = expectedOutput.file;
      const actualOutput = actualOutputs.find(o => o.file === filePath);

      if (!actualOutput) {
        issues.push({
          level: 'error',
          message: `输出文件未报告: ${filePath}`
        });
        continue;
      }

      if (!actualOutput.exists) {
        issues.push({
          level: 'error',
          message: `输出文件不存在: ${filePath}`
        });
        continue;
      }

      if (actualOutput.size === 0) {
        issues.push({
          level: 'warning',
          message: `输出文件为空: ${filePath}`
        });
      }
    }

    // 验证validation_criteria
    for (const criterion of stepDef.validationCriteria || []) {
      if (typeof criterion === 'string') {
        // 验证file_created标准
        if (criterion.includes('file_created:')) {
          const filePath = criterion.split('file_created:')[1].trim().replace(/["']/g, '');
          const actualOutput = actualOutputs.find(o => o.file === filePath);

          if (!actualOutput || !actualOutput.exists) {
            issues.push({
              level: 'error',
              message: `验证失败: ${criterion}`
            });
          }
        }
      }
    }

    return {
      passed: issues.filter(i => i.level === 'error').length === 0,
      issues: issues,
      warnings: issues.filter(i => i.level === 'warning').length,
      errors: issues.filter(i => i.level === 'error').length
    };
  }

  /**
   * 验证文件是否存在
   */
  validateFileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * 验证文件内容是否非空
   */
  async validateFileNotEmpty(filePath) {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const stats = await fs.stat(filePath);
    return stats.size > 0;
  }
}

module.exports = Validator;
