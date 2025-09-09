#!/bin/bash
# <!-- Powered by XIAOMA™ Core -->
# 预开发构建验证脚本
# 基于首周期经验优化：防止Lombok和编译问题

echo "🔍 执行预开发构建验证..."
echo "================================"

# 设置错误时退出
set -e

# 1. 检查Java版本
echo "✓ 检查Java版本..."
java_version=$(java -version 2>&1 | grep version | awk -F '"' '{print $2}' | cut -d'.' -f1)
if [ "$java_version" -lt "17" ]; then
    echo "❌ Java版本过低，需要Java 17或更高版本"
    echo "   当前版本: Java $java_version"
    exit 1
fi
echo "  Java版本: $java_version ✓"

# 2. 检查Maven版本
echo "✓ 检查Maven版本..."
mvn_version=$(mvn -version | head -n 1 | awk '{print $3}')
echo "  Maven版本: $mvn_version ✓"

# 3. 清理并编译（关键步骤）
echo "✓ 执行Maven清理编译..."
mvn clean compile -DskipTests=true -q
if [ $? -ne 0 ]; then
    echo "❌ 编译失败，请修复编译错误后再继续"
    echo "   提示: 检查Lombok配置和依赖"
    exit 1
fi
echo "  编译成功 ✓"

# 4. 依赖分析
echo "✓ 执行依赖分析..."
mvn dependency:analyze -DskipTests=true -q > dependency-report.txt 2>&1
if grep -q "Unused declared dependencies" dependency-report.txt; then
    echo "⚠️  发现未使用的依赖，建议清理"
fi
if grep -q "Used undeclared dependencies" dependency-report.txt; then
    echo "⚠️  发现未声明的依赖，请添加到pom.xml"
fi

# 5. Lombok配置检查
echo "✓ 检查Lombok配置..."
if ! grep -q "lombok" pom.xml; then
    echo "❌ 未找到Lombok依赖"
    exit 1
fi
if ! grep -q "annotationProcessorPaths" pom.xml; then
    echo "⚠️  警告: 未配置Lombok注解处理器路径"
    echo "   建议添加maven-compiler-plugin的annotationProcessorPaths配置"
fi
echo "  Lombok配置 ✓"

# 6. 版本更新检查
echo "✓ 检查依赖版本更新..."
mvn versions:display-dependency-updates -DskipTests=true -q | head -20

echo ""
echo "================================"
echo "✅ 预开发验证通过！"
echo "   - Java版本兼容 ✓"
echo "   - Maven编译成功 ✓"
echo "   - 依赖检查完成 ✓"
echo "   - Lombok配置正确 ✓"
echo ""
echo "可以开始开发工作！"