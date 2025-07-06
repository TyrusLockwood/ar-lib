# AR Lottie动画展示应用

一个基于AR.js和Lottie的增强现实应用，通过识别不同的AR标记来激活对应的Lottie动画，动画激活后会固定在屏幕中央，即使移开标记也会继续显示。

## 功能特点

- 🎯 **多标记识别**: 支持Hiro、Letter、Kanji三种不同的AR标记
- 🎬 **多动画支持**: 每个标记对应不同的Lottie动画
- 📱 **固定显示**: 动画激活后固定在屏幕中央，不依赖标记
- 🔄 **持久播放**: 移开标记后动画继续播放
- 🎮 **简单控制**: 提供重置动画和显示标记的功能
- 🎨 **动态切换**: 扫描不同标记可以实时切换不同的动画

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
1. 将摄像头对准任意支持的标记（Hiro、Letter或Kanji）
2. 对应的Lottie动画将在屏幕中央显示
3. 移开标记时动画依然保留
4. 扫描不同标记可以实时切换不同的动画
5. 按"R"键或点击重置按钮来重置动画

## 项目结构

```
ar-lib/
├── index.html          # 主页面
├── script.js           # 核心JavaScript逻辑
├── test.html           # 功能测试页面
├── animation-switch-test.html # 动画切换测试页面
├── start.sh            # 启动脚本
├── fix-port.sh         # 端口修复脚本
├── assets/
│   ├── character.json  # 第一个Lottie动画文件
│   ├── character-1.json # 第二个Lottie动画文件
│   ├── character-2.json # 第三个Lottie动画文件
│   ├── pattern-letter.patt # Letter标记文件
│   └── pattern-kanji.patt  # Kanji标记文件
└── README.md           # 说明文档
```

## 支持的标记和动画

| 标记类型 | 标记文件 | 动画文件 | 描述 |
|---------|---------|---------|------|
| Hiro标记 | 内置Hiro | `character.json` | 标准Hiro标记，激活第一个动画 |
| Letter标记 | `pattern-letter.patt` | `character-1.json` | 字母标记，激活第二个动画 |
| Kanji标记 | `pattern-kanji.patt` | `character-2.json` | 汉字标记，激活第三个动画 |

## 技术栈

- **AR.js**: 用于AR标记识别
- **A-Frame**: 3D Web框架
- **Lottie**: 矢量动画播放
- **Python/Node.js**: 本地服务器

## 控制功能

- **显示标记**: 显示所有可用标记的预览
- **重置动画**: 重置当前Lottie动画状态
- **键盘快捷键**:
  - `M`: 显示/隐藏标记预览
  - `R`: 重置动画

## 技术实现

### 多标记支持
- 使用`querySelectorAll('a-marker')`获取所有标记元素
- 为每个标记添加独立的事件监听器
- 通过`data-animation`属性关联标记和动画文件

### 动画映射
```javascript
const animationConfig = {
  'hiro-marker': {
    file: 'assets/character.json',
    name: '动画1',
    description: 'Hiro标记动画'
  },
  'letter-marker': {
    file: 'assets/character-1.json',
    name: '动画2',
    description: 'Letter标记动画'
  },
  'kanji-marker': {
    file: 'assets/character-2.json',
    name: '动画3',
    description: 'Kanji标记动画'
  }
};
```

### 状态管理
- 扩展`appState`以跟踪当前激活的标记和动画
- 支持动态切换不同动画
- 提供详细的用户反馈信息
- 防止动画切换过程中的冲突

### 动画切换逻辑
- 首次扫描标记：激活对应动画
- 扫描不同标记：切换到新动画
- 重复扫描同一标记：保持当前动画
- 移开标记：动画继续播放

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
- 检查`assets/`目录下的动画文件是否存在
- 确认网络连接正常
- 查看浏览器控制台的错误信息

### 标记识别问题
- 确保标记文件路径正确
- 检查标记文件格式是否支持
- 尝试在不同光线条件下测试

## 扩展功能

### 添加新标记
1. 将新的`.patt`文件放入`assets/`目录
2. 将对应的Lottie动画文件放入`assets/`目录
3. 在HTML中添加新的`<a-marker>`元素
4. 在`animationConfig`中添加新的配置项

### 自定义动画
- 支持任何Lottie格式的JSON动画文件
- 可以调整动画大小、位置和播放参数
- 支持循环播放和单次播放模式

## 许可证

MIT License 