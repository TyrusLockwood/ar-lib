// AR应用的核心JavaScript逻辑

// 应用状态
let appState = {
  characterActivated: false, // Lottie动画是否已被激活
  markerFound: false, // 标记是否被发现
  activationInProgress: false, // 是否正在激活过程中
  currentAnimation: null, // 当前激活的动画文件
  currentMarker: null // 当前激活的标记ID
};

// Lottie动画实例
let lottieInstance = null;

// 动画配置映射
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
  },
  'fixed-animate': {
    file: 'assets/character-3.json',
    name: '动画4',
    description: '固定动画'
  }
};

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function () {
  console.log('AR应用正在初始化...');

  // 隐藏加载界面
  setTimeout(() => {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }, 2000);

  // 监听AR标记事件
  setupAREvents();

  // 检查设备支持
  checkDeviceSupport();

  // 初始化UI状态
  updateUI();

  // 初始化Lottie动画
  initializeLottieCharacter();
});

// 初始化Lottie动画
function initializeLottieCharacter() {
  console.log('初始化Lottie动画...');
  
  const lottieContainer = document.getElementById('lottie-character');
  if (!lottieContainer) {
    console.error('找不到Lottie容器');
    return;
  }

  // 设置容器样式 - 固定在屏幕中央
  lottieContainer.style.cssText = `
    width: 300px;
    height: 300px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: none;
    z-index: 1000;
    pointer-events: none;
    background: transparent;
  `;

  console.log('Lottie动画初始化完成');
}

// 设置AR事件监听
function setupAREvents() {
  // 获取所有标记
  const markers = document.querySelectorAll('a-marker');
  
  markers.forEach(marker => {
    const markerId = marker.id;
    
    // 标记被发现时
    marker.addEventListener('markerFound', function () {
      console.log(`标记 ${markerId} 已发现！`);
      appState.markerFound = true;

      // 如果当前没有动画激活，或者扫描的是不同的标记，则激活新动画
      if (!appState.characterActivated && !appState.activationInProgress) {
        // 首次激活动画
        activateLottieCharacter(markerId);
      } else if (appState.characterActivated && appState.currentMarker !== markerId) {
        // 切换到不同的动画
        console.log(`切换到新标记: ${markerId}`);
        switchToNewAnimation(markerId);
      }
    });

    // 标记丢失时 - 动画保持显示
    marker.addEventListener('markerLost', function () {
      console.log(`标记 ${markerId} 已丢失！`);
      appState.markerFound = false;

      // 如果动画已激活，标记丢失不影响显示
      if (appState.characterActivated) {
        const config = animationConfig[markerId];
        showNotification(`${config.name}已固定，可以移开标记了！`, 'info');
      }
    });
  });
}

// 激活Lottie动画
function activateLottieCharacter(markerId) {
  if (appState.activationInProgress) return;

  console.log(`激活Lottie动画... ${markerId}`);
  appState.activationInProgress = true;

  const lottieContainer = document.getElementById('lottie-character');
  
  if (lottieContainer) {
    // 显示Lottie容器
    lottieContainer.style.display = 'block';
    
    // 添加激活动画效果
    lottieContainer.style.animation = 'fadeInScale 1s ease-out';
    
    // 加载并播放Lottie动画
    loadLottieAnimation(markerId);
    
    appState.characterActivated = true;
    appState.currentAnimation = animationConfig[markerId].file;
    appState.activationInProgress = false;
    
    const config = animationConfig[markerId];
    showNotification(`${config.name}已激活！现在可以移开标记了`, 'success');
    updateUI();

    // 3秒后提示用户可以移开标记
    setTimeout(() => {
      if (appState.characterActivated) {
        showNotification(`${config.name}已固定在屏幕中央，可以自由移动手机！`, 'info');
      }
    }, 3000);

    console.log(`${config.name}激活成功`);
  } else {
    console.error('找不到Lottie容器');
    appState.activationInProgress = false;
  }
}

// 切换到新动画
function switchToNewAnimation(markerId) {
  if (appState.activationInProgress) return;

  console.log(`切换到新动画: ${markerId}`);
  appState.activationInProgress = true;

  const lottieContainer = document.getElementById('lottie-character');
  
  if (lottieContainer) {
    // 添加切换动画效果
    lottieContainer.style.animation = 'fadeInScale 0.5s ease-out';
    
    // 加载并播放新的Lottie动画
    loadLottieAnimation(markerId);
    
    appState.currentAnimation = animationConfig[markerId].file;
    appState.currentMarker = markerId;
    appState.activationInProgress = false;
    
    const config = animationConfig[markerId];
    showNotification(`已切换到${config.name}！`, 'success');
    updateUI();

    console.log(`切换到${config.name}成功`);
  } else {
    console.error('找不到Lottie容器');
    appState.activationInProgress = false;
  }
}

// 加载Lottie动画
function loadLottieAnimation(markerId) {
  const lottieContainer = document.getElementById('lottie-character');
  
  if (!lottieContainer) return;

  // 销毁现有实例
  if (lottieInstance) {
    lottieInstance.destroy();
    lottieInstance = null;
  }

  const config = animationConfig[markerId];
  if (!config) {
    console.error(`未找到标记 ${markerId} 的配置`);
    return;
  }

  try {
    // 创建新的Lottie实例
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: config.file
    });

    // 监听动画加载完成
    lottieInstance.addEventListener('DOMLoaded', function() {
      console.log(`${config.name}加载完成`);
      // 只有在首次加载时才显示加载成功通知，避免切换时重复显示
      if (!appState.characterActivated) {
        showNotification(`${config.name}加载成功！`, 'success');
      }
    });

    // 监听动画错误
    lottieInstance.addEventListener('error', function(error) {
      console.error(`${config.name}加载失败:`, error);
      showNotification(`${config.name}加载失败，请检查文件路径`, 'error');
    });

  } catch (error) {
    console.error(`创建${config.name}实例失败:`, error);
    showNotification(`${config.name}初始化失败`, 'error');
  }
}

function loadLottieAnimationFixed() {
  const lottieContainer = document.getElementById('lottie-character-fixed');
  
  if (!lottieContainer) return;

  // 销毁现有实例
  if (lottieInstance) {
    lottieInstance.destroy();
    lottieInstance = null;
  }

  const config = animationConfig['fixed-animate'];

  try {
    // 创建新的Lottie实例
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: config.file
    });

    // 监听动画加载完成
    lottieInstance.addEventListener('DOMLoaded', function() {
      console.log(`${config.name}加载完成`);
      // 只有在首次加载时才显示加载成功通知，避免切换时重复显示
      if (!appState.characterActivated) {
        showNotification(`${config.name}加载成功！`, 'success');
      }
    });

    // 监听动画错误
    lottieInstance.addEventListener('error', function(error) {
      console.error(`${config.name}加载失败:`, error);
      showNotification(`${config.name}加载失败，请检查文件路径`, 'error');
    });

  } catch (error) {
    console.error(`创建${config.name}实例失败:`, error);
    showNotification(`${config.name}初始化失败`, 'error');
  }
}

// 重置Lottie动画
function resetCharacter() {
  console.log('重置Lottie动画...');

  const lottieContainer = document.getElementById('lottie-character');
  if (lottieContainer) {
    lottieContainer.style.display = 'none';
  }

  if (lottieInstance) {
    lottieInstance.destroy();
    lottieInstance = null;
  }

  appState.characterActivated = false;
  appState.activationInProgress = false;
  appState.currentAnimation = null;
  appState.currentMarker = null;
  showNotification('Lottie动画已重置，请用标记重新激活', 'info');
  updateUI();
}

// 更新UI状态
function updateUI() {
  const infoText = document.getElementById('info-text');
  const resetBtn = document.getElementById('reset-btn');

  if (appState.characterActivated) {
    const config = appState.currentMarker ? animationConfig[appState.currentMarker] : null;
    const animationName = config ? config.name : 'Lottie动画';
    infoText.textContent = `${animationName}已固定在屏幕中央`;
    resetBtn.disabled = false;
  } else {
    infoText.textContent = '将摄像头对准任意标记来激活对应的Lottie动画';
    resetBtn.disabled = true;
  }
}

// 显示标记
function showLine(isShow) {
  console.log('showLine', isShow);
  const tipLine = document.getElementById('tip-line');
  const tipText = document.getElementById('tip-text');
  if (tipLine && tipText) {
    tipLine.style.display = isShow ? 'block' : 'none';
    tipText.style.display = isShow ? 'block' : 'none';
  } 

  if (isShow) {
    const tipNumber = document.getElementById('tip-number');
    if (tipNumber) {
      tipNumber.style.display = 'block';

      let count = 3;
      let delay = 1000;
      let timer = setInterval(() => {
        count--;
        tipNumber.textContent = count;
        if (count === 0) {
          tipNumber.style.display = 'none';
          clearInterval(timer);
          switchToNewAnimation('fixed-animate');
          count = 3;
        }
      }, delay);
    }
  }
}

// 显示标记
function showMarker() {
  const markerDisplay = document.getElementById('marker-display');
  if (markerDisplay) {
    markerDisplay.style.display = 'block';
  }
}

// 隐藏标记
function hideMarker() {
  const markerDisplay = document.getElementById('marker-display');
  if (markerDisplay) {
    markerDisplay.style.display = 'none';
  }
}

// 显示通知消息
function showNotification(message, type = 'info') {
  // 移除现有通知
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 创建新通知
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // 设置通知样式
  notification.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: ${getNotificationColor(type)};
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 1500;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    animation: slideDown 0.3s ease-out;
    max-width: 300px;
    text-align: center;
  `;

  // 添加动画样式
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // 3秒后自动移除通知
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 3000);
}

// 获取通知颜色
function getNotificationColor(type) {
  switch (type) {
    case 'success': return '#4CAF50';
    case 'warning': return '#FF9800';
    case 'error': return '#F44336';
    case 'info':
    default: return '#2196F3';
  }
}

// 检查设备支持
function checkDeviceSupport() {
  // 检查是否支持摄像头
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showNotification('您的设备不支持摄像头访问', 'error');
    return;
  }

  // 检查是否为HTTPS或localhost
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    showNotification('AR功能需要HTTPS连接或本地环境', 'warning');
  }

  // 检查是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isMobile) {
    showNotification('建议在移动设备上使用以获得最佳体验', 'info');
  }
}

// 添加键盘快捷键
document.addEventListener('keydown', function (e) {
  switch (e.key) {
    case 'm':
    case 'M':
      const markerDisplay = document.getElementById('marker-display');
      if (markerDisplay.style.display === 'none' || !markerDisplay.style.display) {
        showMarker();
      } else {
        hideMarker();
      }
      break;
    case 'r':
    case 'R':
      if (appState.characterActivated) {
        resetCharacter();
      }
      break;
  }
});

// 错误处理
window.addEventListener('error', function (e) {
  console.error('应用错误:', e.error);
  showNotification('应用出现错误，请刷新页面重试', 'error');
});

// AR.js 错误处理
document.addEventListener('arjs-error', function (e) {
  console.error('AR.js 错误:', e.detail);
  showNotification('AR初始化失败，请检查摄像头权限', 'error');
});

console.log('AR应用脚本已加载完成'); 