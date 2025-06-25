#!/bin/bash

# 修复端口占用问题的脚本

echo "🔧 正在检查端口8000占用情况..."

# 检查端口8000是否被占用
PORT_PID=$(lsof -ti:8000 2>/dev/null)

if [ -n "$PORT_PID" ]; then
    echo "⚠️  发现端口8000被进程 $PORT_PID 占用"
    echo "🔄 正在终止占用进程..."
    
    # 尝试优雅地终止进程
    kill $PORT_PID 2>/dev/null
    
    # 等待2秒
    sleep 2
    
    # 检查进程是否还在运行
    if kill -0 $PORT_PID 2>/dev/null; then
        echo "⚠️  进程仍在运行，强制终止..."
        kill -9 $PORT_PID 2>/dev/null
    fi
    
    echo "✅ 端口8000已释放"
else
    echo "✅ 端口8000未被占用"
fi

echo "🎯 现在可以重新启动应用了" 