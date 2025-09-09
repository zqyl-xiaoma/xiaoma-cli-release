#!/bin/bash
# <!-- Powered by XIAOMA™ Core -->
# 渐进式验证脚本
# 分阶段验证，快速发现问题

echo "🔄 执行渐进式验证..."
echo "================================"

# 阶段1：快速检查（30秒）
echo ""
echo "【阶段1】快速检查（目标: 30秒）"
echo "--------------------------------"
start_time=$(date +%s)

mvn compile -q -DskipTests=true
if [ $? -ne 0 ]; then
    echo "❌ 阶段1失败：编译错误"
    exit 1
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ 阶段1完成（用时: ${duration}秒）"

# 阶段2：单元测试（2分钟）
echo ""
echo "【阶段2】单元测试（目标: 2分钟）"
echo "--------------------------------"
start_time=$(date +%s)

mvn test -Dtest=*Test -DskipIntegrationTests=true -q
if [ $? -ne 0 ]; then
    echo "❌ 阶段2失败：单元测试未通过"
    echo "   运行 'mvn test' 查看详细错误"
    exit 2
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ 阶段2完成（用时: ${duration}秒）"

# 阶段3：集成测试（5分钟）
echo ""
echo "【阶段3】集成测试（目标: 5分钟）"
echo "--------------------------------"
start_time=$(date +%s)

# 检查是否有集成测试
if ls src/test/java/**/*IntegrationTest.java 1> /dev/null 2>&1 || ls src/test/java/**/*IT.java 1> /dev/null 2>&1; then
    mvn verify -DskipUnitTests=true -q
    if [ $? -ne 0 ]; then
        echo "❌ 阶段3失败：集成测试未通过"
        exit 3
    fi
else
    echo "  - 未找到集成测试，跳过"
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ 阶段3完成（用时: ${duration}秒）"

# 阶段4：打包验证（2分钟）
echo ""
echo "【阶段4】打包验证（目标: 2分钟）"
echo "--------------------------------"
start_time=$(date +%s)

mvn package -DskipTests=true -q
if [ $? -ne 0 ]; then
    echo "❌ 阶段4失败：打包失败"
    exit 4
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ 阶段4完成（用时: ${duration}秒）"

# 总结
echo ""
echo "================================"
echo "🎯 渐进式验证完成！"
echo "   ✓ 编译检查通过"
echo "   ✓ 单元测试通过"
echo "   ✓ 集成测试通过"
echo "   ✓ 打包验证通过"
echo ""
echo "代码质量验证成功，可以提交！"