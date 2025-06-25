# AR Lottie动画展示应用

一个基于AR.js和Lottie的增强现实应用，通过识别Hiro标记来激活Lottie动画，动画激活后会固定在屏幕中央，即使移开标记也会继续显示。

## 功能特点

- 🎯 **AR标记识别**: 使用Hiro标记触发Lottie动画
- 🎬 **Lottie动画**: 支持播放高质量的矢量动画
- 📱 **固定显示**: 动画激活后固定在屏幕中央，不依赖标记
- 🔄 **持久播放**: 移开标记后动画继续播放
- 🎮 **简单控制**: 提供重置动画和显示标记的功能

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd ar-lib
```

### 2. 启动应用
```bash
./start.sh
```

### 3. 访问应用
- 本地访问: http://localhost:8000
- 手机访问: http://[你的IP地址]:8000

### 4. 使用说明
1. 将摄像头对准Hiro标记
2. Lottie动画将在屏幕中央显示
3. 移开标记时动画依然保留

## 项目结构

```
ar-lib/
├── index.html          # 主页面
├── script.js           # 核心JavaScript逻辑
├── start.sh            # 启动脚本
├── fix-port.sh         # 端口修复脚本
├── assets/
│   └── character.json  # Lottie动画文件
└── README.md           # 说明文档
```

## 技术栈

- **AR.js**: 用于AR标记识别
- **A-Frame**: 3D Web框架
- **Lottie**: 矢量动画播放
- **Python/Node.js**: 本地服务器

## 控制功能

- **显示标记**: 显示Hiro标记图片
- **重置动画**: 重置Lottie动画状态
- **键盘快捷键**:
  - `M`: 显示/隐藏标记
  - `R`: 重置动画

## 系统要求

- 支持WebGL的现代浏览器
- 摄像头权限
- HTTPS连接或本地环境

## 故障排除

### 端口被占用
```bash
./fix-port.sh
```

### 摄像头权限问题
- 确保使用HTTPS或localhost访问
- 检查浏览器摄像头权限设置

### 动画不显示
- 检查`assets/character.json`文件是否存在
- 确认网络连接正常

## 许可证

MIT License 