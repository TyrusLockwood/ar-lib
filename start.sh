#!/bin/bash

# AR圆柱体展示应用启动脚本

echo "🚀 正在启动AR圆柱体展示应用..."
echo ""

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    echo "✅ 使用Python3启动本地服务器..."
    echo "📱 请在手机浏览器中访问: http://$(hostname -I | awk '{print $1}'):8000"
    echo "💻 或在本地访问: http://localhost:8000"
    echo ""
    echo "⚠️  注意: 请确保手机和电脑在同一WiFi网络下"
    echo "🔒 如果遇到摄像头权限问题，请使用HTTPS或localhost访问"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用Python启动本地服务器..."
    echo "📱 请在手机浏览器中访问: http://$(hostname -I | awk '{print $1}'):8000"
    echo "💻 或在本地访问: http://localhost:8000"
    echo ""
    echo "⚠️  注意: 请确保手机和电脑在同一WiFi网络下"
    echo "🔒 如果遇到摄像头权限问题，请使用HTTPS或localhost访问"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "✅ 使用Node.js启动本地服务器..."
    echo "📱 请在手机浏览器中访问显示的网络地址"
    echo "💻 或在本地访问: http://localhost:8080"
    echo ""
    echo "⚠️  注意: 请确保手机和电脑在同一WiFi网络下"
    echo "🔒 如果遇到摄像头权限问题，请使用HTTPS或localhost访问"
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