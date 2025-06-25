// AR应用的核心JavaScript逻辑

// 应用状态
let appState = {
  characterActivated: false, // Lottie动画是否已被激活
  markerFound: false, // 标记是否被发现
  activationInProgress: false // 是否正在激活过程中
};

// Lottie动画实例
let lottieInstance = null;

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
  const marker = document.querySelector('#hiro-marker');

  if (marker) {
    // 标记被发现时
    marker.addEventListener('markerFound', function () {
      console.log('标记已发现！');
      appState.markerFound = true;

      if (!appState.characterActivated && !appState.activationInProgress) {
        // 标记用于激活Lottie动画
        activateLottieCharacter();
      }
    });

    // 标记丢失时 - 动画保持显示
    marker.addEventListener('markerLost', function () {
      console.log('标记已丢失！');
      appState.markerFound = false;

      // 如果动画已激活，标记丢失不影响显示
      if (appState.characterActivated) {
        showNotification('动画已固定，可以移开标记了！', 'info');
      }
    });
  }
}

// 激活Lottie动画
function activateLottieCharacter() {
  if (appState.activationInProgress) return;

  console.log('激活Lottie动画...');
  appState.activationInProgress = true;

  const lottieContainer = document.getElementById('lottie-character');
  
  if (lottieContainer) {
    // 显示Lottie容器
    lottieContainer.style.display = 'block';
    
    // 添加激活动画效果
    lottieContainer.style.animation = 'fadeInScale 1s ease-out';
    
    // 加载并播放Lottie动画
    loadLottieAnimation();
    
    appState.characterActivated = true;
    appState.activationInProgress = false;
    showNotification('Lottie动画已激活！现在可以移开标记了', 'success');
    updateUI();

    // 3秒后提示用户可以移开标记
    setTimeout(() => {
      if (appState.characterActivated) {
        showNotification('动画已固定在屏幕中央，可以自由移动手机！', 'info');
      }
    }, 3000);

    console.log('Lottie动画激活成功');
  } else {
    console.error('找不到Lottie容器');
    appState.activationInProgress = false;
  }
}

// 加载Lottie动画
function loadLottieAnimation() {
  const lottieContainer = document.getElementById('lottie-character');
  
  if (!lottieContainer) return;

  // 销毁现有实例
  if (lottieInstance) {
    lottieInstance.destroy();
    lottieInstance = null;
  }

  try {
    // 创建新的Lottie实例
    lottieInstance = lottie.loadAnimation({
      container: lottieContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/character.json'
    });

    // 监听动画加载完成
    lottieInstance.addEventListener('DOMLoaded', function() {
      console.log('Lottie动画加载完成');
      showNotification('Lottie动画加载成功！', 'success');
    });

    // 监听动画错误
    lottieInstance.addEventListener('error', function(error) {
      console.error('Lottie动画加载失败:', error);
      showNotification('Lottie动画加载失败，请检查文件路径', 'error');
    });

  } catch (error) {
    console.error('创建Lottie实例失败:', error);
    showNotification('Lottie动画初始化失败', 'error');
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
  showNotification('Lottie动画已重置，请用标记重新激活', 'info');
  updateUI();
}

// 更新UI状态
function updateUI() {
  const infoText = document.getElementById('info-text');
  const resetBtn = document.getElementById('reset-btn');

  if (appState.characterActivated) {
    infoText.textContent = 'Lottie动画已固定在屏幕中央';
    resetBtn.disabled = false;
  } else {
    infoText.textContent = '将摄像头对准Hiro标记来激活Lottie动画';
    resetBtn.disabled = true;
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