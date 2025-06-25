#!/bin/bash

# AR Lottie动画展示应用启动脚本

echo "🚀 正在启动AR Lottie动画展示应用..."
echo ""

# 检查Lottie文件是否存在
if [ ! -f "assets/character.json" ]; then
    echo "❌ 错误: 找不到Lottie动画文件 assets/character.json"
    echo "请确保Lottie动画文件已放置在assets目录中"
    exit 1
fi

echo "✅ 找到Lottie动画文件: assets/character.json"
echo ""

# 获取本机IP地址（兼容macOS和Linux）
get_ip_address() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    else
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    fi
}

IP_ADDRESS=$(get_ip_address)

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "✅ 使用Python3启动本地服务器..."
    echo "📱 请在手机浏览器中访问: http://$IP_ADDRESS:8000"
    echo "💻 或在本地访问: http://localhost:8000"
    echo ""
    echo "📋 使用说明:"
    echo "1. 将摄像头对准Hiro标记"
    echo "2. Lottie动画将在屏幕中央显示"
    echo "3. 移开标记时动画依然保留"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用Python启动本地服务器..."
    echo "📱 请在手机浏览器中访问: http://$IP_ADDRESS:8000"
    echo "💻 或在本地访问: http://localhost:8000"
    echo ""
    echo "📋 使用说明:"
    echo "1. 将摄像头对准Hiro标记"
    echo "2. Lottie动画将在屏幕中央显示"
    echo "3. 移开标记时动画依然保留"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "✅ 使用Node.js启动本地服务器..."
    echo "📱 请在手机浏览器中访问: http://$IP_ADDRESS:8080"
    echo "💻 或在本地访问: http://localhost:8080"
    echo ""
    echo "📋 使用说明:"
    echo "1. 将摄像头对准Hiro标记"
    echo "2. Lottie动画将在屏幕中央显示"
    echo "3. 移开标记时动画依然保留"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    npx http-server -p 8080
else
    echo "❌ 未找到Python或Node.js"
    echo "请安装Python或Node.js后重试"
    echo ""
    echo "安装方法:"
    echo "- Python: https://www.python.org/downloads/"
    echo "- Node.js: https://nodejs.org/"
    echo ""
    echo "或者直接在浏览器中打开 index.html 文件"
fi 