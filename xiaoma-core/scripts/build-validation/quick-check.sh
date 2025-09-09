#!/bin/bash
# <!-- Powered by XIAOMA™ Core -->
# 30秒快速验证脚本
# 用于开发过程中的快速反馈

echo "⚡ 执行30秒快速验证..."
echo "========================"

# 设置超时
timeout_duration=30

# 使用timeout命令限制执行时间
timeout $timeout_duration bash <<'EOF'
set -e

# 1. 快速编译检查（不清理）
echo "→ 快速编译检查..."
mvn compile -q -DskipTests=true
if [ $? -eq 0 ]; then
    echo "  ✓ 编译通过"
else
    echo "  ✗ 编译失败"
    exit 1
fi

# 2. 测试编译检查
echo "→ 测试编译检查..."
mvn test-compile -q
if [ $? -eq 0 ]; then
    echo "  ✓ 测试编译通过"
else
    echo "  ✗ 测试编译失败"
    exit 1
fi

# 3. 运行冒烟测试（如果存在）
echo "→ 运行冒烟测试..."
if ls src/test/java/**/*SmokeTest.java 1> /dev/null 2>&1; then
    mvn surefire:test -Dtest=*SmokeTest -q
    if [ $? -eq 0 ]; then
        echo "  ✓ 冒烟测试通过"
    else
        echo "  ✗ 冒烟测试失败"
        exit 1
    fi
else
    echo "  - 未找到冒烟测试，跳过"
fi

echo ""
echo "✅ 快速验证完成！"
EOF

exit_code=$?

if [ $exit_code -eq 124 ]; then
    echo ""
    echo "⚠️  验证超时（超过30秒）"
    echo "   建议检查编译性能"
    exit 1
elif [ $exit_code -ne 0 ]; then
    echo ""
    echo "❌ 快速验证失败"
    echo "   请修复问题后重试"
    exit $exit_code
fi

echo "========================"
echo "⚡ 所有检查通过（用时<30秒）"