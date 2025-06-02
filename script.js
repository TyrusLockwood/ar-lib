// AR应用的主要JavaScript逻辑

// 颜色数组用于切换卡通人物颜色
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
let currentColorIndex = 0;

// 应用状态
let appState = {
  mode: 'marker', // 'marker' 或 'fixed'
  characterActivated: false, // 卡通人物是否已被激活
  markerFound: false, // 标记是否被发现
  activationInProgress: false, // 是否正在激活过程中
  isWalking: false // 卡通人物是否正在行走
};

// 行走参数
const walkingParams = {
  speed: 0.012, // 移动速度
  boundary: {
    x: 0.8, // X轴边界 - 限制在可视区域内
    y: 0.4, // Y轴边界 - 限制在可视区域内
    z: 0.6  // Z轴边界 - 限制在可视区域内
  },
  direction: {
    x: 1,
    y: 0,
    z: 1
  },
  changeDirectionInterval: 4000, // 改变方向的间隔（毫秒）
  walkingInterval: null, // 行走定时器
  directionChangeInterval: null // 方向改变定时器
};

// 跟随参数
const followParams = {
  sensitivity: 1.5, // 跟随灵敏度
  smoothing: 0.2, // 移动平滑度
  maxDistance: 1.0, // 最大跟随距离
  followInterval: null, // 跟随定时器
  lastDeviceOrientation: { alpha: 0, beta: 0, gamma: 0 }, // 上次设备方向
  targetPosition: { x: 0, y: -0.3, z: -1.5 }, // 目标位置
  currentPosition: { x: 0, y: -0.3, z: -1.5 }, // 当前位置
  hasOrientationPermission: false, // 是否有方向权限
  orientationSupported: false // 是否支持方向传感器
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

  // 等待A-Frame场景加载完成后初始化固定卡通人物
  const scene = document.querySelector('a-scene');
  if (scene.hasLoaded) {
    initializeFixedCharacter();
  } else {
    scene.addEventListener('loaded', initializeFixedCharacter);
  }
});

// 初始化固定卡通人物
function initializeFixedCharacter() {
  console.log('初始化固定卡通人物系统...');

  // 创建一个完全独立的固定卡通人物
  const scene = document.querySelector('a-scene');

  // 移除现有的固定卡通人物容器（如果存在）
  const existingContainer = document.querySelector('#fixed-character-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // 创建新的固定卡通人物容器
  const fixedContainer = document.createElement('a-entity');
  fixedContainer.setAttribute('id', 'fixed-character-container');
  fixedContainer.setAttribute('visible', 'false');
  fixedContainer.setAttribute('position', '0 -0.3 -1.5'); // 调整位置

  // 创建卡通人物 - 头部（球体）- 缩小1/3
  const head = document.createElement('a-sphere');
  head.setAttribute('id', 'character-head');
  head.setAttribute('radius', '0.1'); // 从0.15缩小到0.1
  head.setAttribute('position', '0 0.17 0'); // 从0 0.25 0调整到0 0.17 0
  head.setAttribute('color', colors[currentColorIndex]);
  head.setAttribute('metalness', '0.1');
  head.setAttribute('roughness', '0.6');

  // 创建眼睛 - 更大更可爱
  const leftEye = document.createElement('a-sphere');
  leftEye.setAttribute('radius', '0.018'); // 从0.02稍微减小到0.018，但相对头部更大
  leftEye.setAttribute('position', '-0.035 0.035 0.08'); // 调整位置
  leftEye.setAttribute('color', '#000000');

  const rightEye = document.createElement('a-sphere');
  rightEye.setAttribute('radius', '0.018');
  rightEye.setAttribute('position', '0.035 0.035 0.08');
  rightEye.setAttribute('color', '#000000');

  // 添加眼睛高光，让眼睛更生动
  const leftEyeLight = document.createElement('a-sphere');
  leftEyeLight.setAttribute('radius', '0.008');
  leftEyeLight.setAttribute('position', '-0.03 0.04 0.085');
  leftEyeLight.setAttribute('color', '#FFFFFF');

  const rightEyeLight = document.createElement('a-sphere');
  rightEyeLight.setAttribute('radius', '0.008');
  rightEyeLight.setAttribute('position', '0.04 0.04 0.085');
  rightEyeLight.setAttribute('color', '#FFFFFF');

  // 创建嘴巴 - 更小更可爱
  const mouth = document.createElement('a-torus');
  mouth.setAttribute('radius', '0.025'); // 从0.04缩小到0.025
  mouth.setAttribute('radius-tubular', '0.003'); // 从0.005缩小到0.003
  mouth.setAttribute('position', '0 -0.015 0.08'); // 调整位置
  mouth.setAttribute('rotation', '0 0 0');
  mouth.setAttribute('color', '#FF4444');

  // 添加腮红，让脸部更可爱
  const leftCheek = document.createElement('a-sphere');
  leftCheek.setAttribute('radius', '0.015');
  leftCheek.setAttribute('position', '-0.06 0.01 0.075');
  leftCheek.setAttribute('color', '#FFB6C1');
  leftCheek.setAttribute('opacity', '0.6');
  leftCheek.setAttribute('transparent', 'true');

  const rightCheek = document.createElement('a-sphere');
  rightCheek.setAttribute('radius', '0.015');
  rightCheek.setAttribute('position', '0.06 0.01 0.075');
  rightCheek.setAttribute('color', '#FFB6C1');
  rightCheek.setAttribute('opacity', '0.6');
  rightCheek.setAttribute('transparent', 'true');

  // 创建身体（圆柱体）- 缩小1/3，更苗条
  const body = document.createElement('a-cylinder');
  body.setAttribute('id', 'character-body');
  body.setAttribute('radius', '0.055'); // 从0.08缩小到0.055
  body.setAttribute('height', '0.2'); // 从0.3缩小到0.2
  body.setAttribute('position', '0 -0.03 0'); // 调整位置
  body.setAttribute('color', '#4ECDC4');
  body.setAttribute('metalness', '0.1');
  body.setAttribute('roughness', '0.6');

  // 添加身体装饰 - 可爱的纽扣
  const button1 = document.createElement('a-sphere');
  button1.setAttribute('radius', '0.008');
  button1.setAttribute('position', '0 0.05 0.056');
  button1.setAttribute('color', '#FFD700');

  const button2 = document.createElement('a-sphere');
  button2.setAttribute('radius', '0.008');
  button2.setAttribute('position', '0 0.02 0.056');
  button2.setAttribute('color', '#FFD700');

  const button3 = document.createElement('a-sphere');
  button3.setAttribute('radius', '0.008');
  button3.setAttribute('position', '0 -0.01 0.056');
  button3.setAttribute('color', '#FFD700');

  // 创建手臂（左）- 缩小1/3，更细
  const leftArm = document.createElement('a-cylinder');
  leftArm.setAttribute('id', 'left-arm');
  leftArm.setAttribute('radius', '0.013'); // 从0.02缩小到0.013
  leftArm.setAttribute('height', '0.1'); // 从0.15缩小到0.1
  leftArm.setAttribute('position', '-0.08 0.035 0'); // 调整位置
  leftArm.setAttribute('rotation', '0 0 30');
  leftArm.setAttribute('color', colors[currentColorIndex]);
  leftArm.setAttribute('animation', 'property: rotation; to: 0 0 -30; dir: alternate; loop: true; dur: 2000');

  // 创建手臂（右）- 缩小1/3，更细
  const rightArm = document.createElement('a-cylinder');
  rightArm.setAttribute('id', 'right-arm');
  rightArm.setAttribute('radius', '0.013');
  rightArm.setAttribute('height', '0.1');
  rightArm.setAttribute('position', '0.08 0.035 0');
  rightArm.setAttribute('rotation', '0 0 -30');
  rightArm.setAttribute('color', colors[currentColorIndex]);
  rightArm.setAttribute('animation', 'property: rotation; to: 0 0 30; dir: alternate; loop: true; dur: 2000');

  // 添加手部 - 小球形手掌
  const leftHand = document.createElement('a-sphere');
  leftHand.setAttribute('radius', '0.015');
  leftHand.setAttribute('position', '-0.12 -0.01 0');
  leftHand.setAttribute('color', colors[currentColorIndex]);

  const rightHand = document.createElement('a-sphere');
  rightHand.setAttribute('radius', '0.015');
  rightHand.setAttribute('position', '0.12 -0.01 0');
  rightHand.setAttribute('color', colors[currentColorIndex]);

  // 创建腿部（左）- 缩小1/3
  const leftLeg = document.createElement('a-cylinder');
  leftLeg.setAttribute('id', 'left-leg');
  leftLeg.setAttribute('radius', '0.017'); // 从0.025缩小到0.017
  leftLeg.setAttribute('height', '0.13'); // 从0.2缩小到0.13
  leftLeg.setAttribute('position', '-0.027 -0.2 0'); // 调整位置
  leftLeg.setAttribute('color', '#45B7D1');

  // 创建腿部（右）- 缩小1/3
  const rightLeg = document.createElement('a-cylinder');
  rightLeg.setAttribute('id', 'right-leg');
  rightLeg.setAttribute('radius', '0.017');
  rightLeg.setAttribute('height', '0.13');
  rightLeg.setAttribute('position', '0.027 -0.2 0');
  rightLeg.setAttribute('color', '#45B7D1');

  // 添加脚部 - 可爱的小鞋子
  const leftFoot = document.createElement('a-box');
  leftFoot.setAttribute('width', '0.04');
  leftFoot.setAttribute('height', '0.015');
  leftFoot.setAttribute('depth', '0.06');
  leftFoot.setAttribute('position', '-0.027 -0.275 0.01');
  leftFoot.setAttribute('color', '#8B4513');

  const rightFoot = document.createElement('a-box');
  rightFoot.setAttribute('width', '0.04');
  rightFoot.setAttribute('height', '0.015');
  rightFoot.setAttribute('depth', '0.06');
  rightFoot.setAttribute('position', '0.027 -0.275 0.01');
  rightFoot.setAttribute('color', '#8B4513');

  // 创建帽子 - 缩小1/3，更精致
  const hat = document.createElement('a-cone');
  hat.setAttribute('radius-bottom', '0.08'); // 从0.12缩小到0.08
  hat.setAttribute('radius-top', '0.013'); // 从0.02缩小到0.013
  hat.setAttribute('height', '0.1'); // 从0.15缩小到0.1
  hat.setAttribute('position', '0 0.23 0'); // 调整位置
  hat.setAttribute('color', '#FF9800');
  hat.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 8000');

  // 添加帽子装饰 - 小星星
  const hatStar = document.createElement('a-cone');
  hatStar.setAttribute('radius-bottom', '0.01');
  hatStar.setAttribute('radius-top', '0.005');
  hatStar.setAttribute('height', '0.02');
  hatStar.setAttribute('position', '0 0.28 0');
  hatStar.setAttribute('color', '#FFD700');
  hatStar.setAttribute('animation', 'property: rotation; to: 0 -360 0; loop: true; dur: 4000');

  // 创建文字标签 - 调整位置
  const text = document.createElement('a-text');
  text.setAttribute('value', '可爱小伙伴');
  text.setAttribute('position', '0 0.4 0'); // 从0 0.6 0调整到0 0.4 0
  text.setAttribute('align', 'center');
  text.setAttribute('color', '#FFFFFF');
  text.setAttribute('scale', '0.3 0.3 0.3'); // 从0.4缩小到0.3
  text.setAttribute('animation', 'property: position; to: 0 0.45 0; dir: alternate; loop: true; dur: 3000');

  // 创建装饰粒子 - 缩小并调整位置
  const particle1 = document.createElement('a-sphere');
  particle1.setAttribute('position', '0.13 0.27 0.07'); // 调整位置
  particle1.setAttribute('radius', '0.013'); // 从0.02缩小到0.013
  particle1.setAttribute('color', '#FFD93D');
  particle1.setAttribute('animation', 'property: position; to: 0.2 0.33 0.13; dir: alternate; loop: true; dur: 2500');

  const particle2 = document.createElement('a-sphere');
  particle2.setAttribute('position', '-0.13 0.27 0.07');
  particle2.setAttribute('radius', '0.013');
  particle2.setAttribute('color', '#FF6B6B');
  particle2.setAttribute('animation', 'property: position; to: -0.2 0.33 0.13; dir: alternate; loop: true; dur: 2800');

  // 添加光环效果
  const halo = document.createElement('a-ring');
  halo.setAttribute('radius-inner', '0.12');
  halo.setAttribute('radius-outer', '0.14');
  halo.setAttribute('position', '0 0.3 0');
  halo.setAttribute('rotation', '90 0 0');
  halo.setAttribute('color', '#FFD700');
  halo.setAttribute('opacity', '0.3');
  halo.setAttribute('transparent', 'true');
  halo.setAttribute('animation', 'property: rotation; to: 90 360 0; loop: true; dur: 6000');

  // 组装卡通人物
  head.appendChild(leftEye);
  head.appendChild(rightEye);
  head.appendChild(leftEyeLight);
  head.appendChild(rightEyeLight);
  head.appendChild(mouth);
  head.appendChild(leftCheek);
  head.appendChild(rightCheek);

  body.appendChild(button1);
  body.appendChild(button2);
  body.appendChild(button3);

  fixedContainer.appendChild(head);
  fixedContainer.appendChild(body);
  fixedContainer.appendChild(leftArm);
  fixedContainer.appendChild(rightArm);
  fixedContainer.appendChild(leftHand);
  fixedContainer.appendChild(rightHand);
  fixedContainer.appendChild(leftLeg);
  fixedContainer.appendChild(rightLeg);
  fixedContainer.appendChild(leftFoot);
  fixedContainer.appendChild(rightFoot);
  fixedContainer.appendChild(hat);
  fixedContainer.appendChild(hatStar);
  fixedContainer.appendChild(text);
  fixedContainer.appendChild(particle1);
  fixedContainer.appendChild(particle2);
  fixedContainer.appendChild(halo);

  // 将固定卡通人物添加到相机下
  const camera = document.querySelector('#main-camera');
  camera.appendChild(fixedContainer);

  console.log('固定卡通人物系统初始化完成');
}

// 设置AR事件监听
function setupAREvents() {
  const marker = document.querySelector('#hiro-marker');
  const markerCharacter = document.querySelector('#marker-character');

  if (marker) {
    // 标记被发现时
    marker.addEventListener('markerFound', function () {
      console.log('标记已发现！');
      appState.markerFound = true;

      if (appState.mode === 'marker') {
        showNotification('标记已发现！卡通人物正在显示', 'success');

        // 添加发现标记时的特效
        if (markerCharacter) {
          markerCharacter.setAttribute('animation__found', {
            property: 'scale',
            from: '0 0 0',
            to: '1 1 1',
            dur: 1000,
            easing: 'easeOutElastic'
          });
        }
      } else if (appState.mode === 'fixed' && !appState.characterActivated && !appState.activationInProgress) {
        // 在固定模式下，标记用于激活卡通人物
        activateFixedCharacter();
      }
    });

    // 标记丢失时
    marker.addEventListener('markerLost', function () {
      console.log('标记已丢失！');
      appState.markerFound = false;

      if (appState.mode === 'marker') {
        showNotification('标记已丢失，请重新对准标记', 'warning');
      } else if (appState.mode === 'fixed' && appState.characterActivated) {
        // 在固定模式下，如果卡通人物已激活，标记丢失不影响显示
        showNotification('卡通人物已固定，可以移开标记了！', 'info');
      }
    });
  }
}

// 激活固定卡通人物
function activateFixedCharacter() {
  if (appState.activationInProgress) return;

  console.log('激活固定卡通人物...');
  appState.activationInProgress = true;

  const fixedContainer = document.querySelector('#fixed-character-container');

  if (fixedContainer) {
    // 显示固定卡通人物
    fixedContainer.setAttribute('visible', 'true');

    // 添加激活动画
    fixedContainer.setAttribute('animation__activate', {
      property: 'scale',
      from: '0 0 0',
      to: '1 1 1',
      dur: 2000,
      easing: 'easeOutElastic'
    });

    appState.characterActivated = true;
    appState.activationInProgress = false;
    showNotification('卡通人物已激活！现在开始在可视区域内自由行走', 'success');
    updateUI();

    // 开始行走
    setTimeout(() => {
      startWalking();
    }, 2500); // 等待激活动画完成后开始行走

    console.log('固定卡通人物激活成功');

    // 3秒后提示用户可以移开标记
    setTimeout(() => {
      if (appState.mode === 'fixed' && appState.characterActivated) {
        showNotification('现在可以移开标记，卡通人物将继续在可视区域内漫步！', 'info');
      }
    }, 3000);
  } else {
    console.error('找不到固定卡通人物容器');
    appState.activationInProgress = false;
  }
}

// 开始行走
function startWalking() {
  if (appState.isWalking) return;

  console.log('卡通人物开始行走...');
  appState.isWalking = true;

  const fixedContainer = document.querySelector('#fixed-character-container');
  if (!fixedContainer) return;

  // 添加行走时的动画
  addWalkingAnimations();

  // 开始移动
  walkingParams.walkingInterval = setInterval(() => {
    updateCharacterPosition();
  }, 50); // 每50毫秒更新一次位置

  // 定期改变方向
  walkingParams.directionChangeInterval = setInterval(() => {
    changeWalkingDirection();
  }, walkingParams.changeDirectionInterval);

  updateUI();
  showNotification('卡通人物开始在可视区域内自由漫步！', 'info');
}

// 停止行走
function stopWalking() {
  if (!appState.isWalking) return;

  console.log('卡通人物停止行走...');
  appState.isWalking = false;

  // 清除定时器
  if (walkingParams.walkingInterval) {
    clearInterval(walkingParams.walkingInterval);
    walkingParams.walkingInterval = null;
  }

  if (walkingParams.directionChangeInterval) {
    clearInterval(walkingParams.directionChangeInterval);
    walkingParams.directionChangeInterval = null;
  }

  // 移除行走动画
  removeWalkingAnimations();

  updateUI();
  showNotification('卡通人物停止漫步', 'info');
}

// 添加行走动画
function addWalkingAnimations() {
  const leftLeg = document.querySelector('#left-leg');
  const rightLeg = document.querySelector('#right-leg');
  const leftArm = document.querySelector('#left-arm');
  const rightArm = document.querySelector('#right-arm');

  if (leftLeg) {
    leftLeg.setAttribute('animation__walk', 'property: rotation; to: 12 0 0; dir: alternate; loop: true; dur: 1000');
  }

  if (rightLeg) {
    rightLeg.setAttribute('animation__walk', 'property: rotation; to: -12 0 0; dir: alternate; loop: true; dur: 1000');
  }

  // 行走时的手臂摆动
  if (leftArm) {
    leftArm.setAttribute('animation', 'property: rotation; to: 0 0 -50; dir: alternate; loop: true; dur: 1000');
  }

  if (rightArm) {
    rightArm.setAttribute('animation', 'property: rotation; to: 0 0 50; dir: alternate; loop: true; dur: 1000');
  }
}

// 移除行走动画
function removeWalkingAnimations() {
  const leftLeg = document.querySelector('#left-leg');
  const rightLeg = document.querySelector('#right-leg');
  const leftArm = document.querySelector('#left-arm');
  const rightArm = document.querySelector('#right-arm');

  if (leftLeg) {
    leftLeg.removeAttribute('animation__walk');
  }

  if (rightLeg) {
    rightLeg.removeAttribute('animation__walk');
  }

  // 恢复正常手臂摆动
  if (leftArm) {
    leftArm.setAttribute('animation', 'property: rotation; to: 0 0 -30; dir: alternate; loop: true; dur: 2000');
  }

  if (rightArm) {
    rightArm.setAttribute('animation', 'property: rotation; to: 0 0 30; dir: alternate; loop: true; dur: 2000');
  }
}

// 更新卡通人物位置
function updateCharacterPosition() {
  const fixedContainer = document.querySelector('#fixed-character-container');
  if (!fixedContainer) return;

  // 获取当前位置
  const currentPosition = fixedContainer.getAttribute('position');
  let x = currentPosition.x;
  let y = currentPosition.y;
  let z = currentPosition.z;

  // 更新位置
  x += walkingParams.direction.x * walkingParams.speed;
  y += walkingParams.direction.y * walkingParams.speed;
  z += walkingParams.direction.z * walkingParams.speed;

  // 检查边界并反弹 - 限制在可视区域内
  if (Math.abs(x) > walkingParams.boundary.x) {
    walkingParams.direction.x *= -1;
    x = Math.sign(x) * walkingParams.boundary.x;
  }

  // Y轴边界检查 - 保持在合理的高度范围内
  if (y > -0.3 + walkingParams.boundary.y || y < -0.3 - walkingParams.boundary.y) {
    walkingParams.direction.y *= -1;
    y = Math.max(-0.3 - walkingParams.boundary.y, Math.min(-0.3 + walkingParams.boundary.y, y));
  }

  // Z轴边界检查 - 相对于初始位置-1.5，保持在可视区域
  if (Math.abs(z + 1.5) > walkingParams.boundary.z) {
    walkingParams.direction.z *= -1;
    z = Math.sign(z + 1.5) * walkingParams.boundary.z - 1.5;
  }

  // 应用新位置
  fixedContainer.setAttribute('position', `${x} ${y} ${z}`);

  // 让卡通人物面向移动方向
  const rotationY = Math.atan2(walkingParams.direction.x, walkingParams.direction.z) * 180 / Math.PI;
  fixedContainer.setAttribute('rotation', `0 ${rotationY} 0`);
}

// 改变行走方向
function changeWalkingDirection() {
  // 随机改变方向
  walkingParams.direction.x = (Math.random() - 0.5) * 2;
  walkingParams.direction.y = (Math.random() - 0.5) * 0.3; // Y轴变化较小
  walkingParams.direction.z = (Math.random() - 0.5) * 2;

  // 标准化方向向量
  const length = Math.sqrt(
    walkingParams.direction.x ** 2 +
    walkingParams.direction.y ** 2 +
    walkingParams.direction.z ** 2
  );

  if (length > 0) {
    walkingParams.direction.x /= length;
    walkingParams.direction.y /= length;
    walkingParams.direction.z /= length;
  }

  console.log('改变行走方向:', walkingParams.direction);
}

// 切换行走状态
function toggleWalking() {
  if (appState.mode === 'fixed' && appState.characterActivated) {
    if (appState.isWalking) {
      stopWalking();
    } else {
      startWalking();
    }
  }
}

// 切换模式
function toggleMode() {
  if (appState.mode === 'marker') {
    // 切换到固定模式
    appState.mode = 'fixed';
    showNotification('已切换到固定模式，用标记来激活卡通人物', 'info');
  } else {
    // 切换到标记模式
    appState.mode = 'marker';

    // 停止行走
    stopWalking();

    // 隐藏固定卡通人物
    const fixedContainer = document.querySelector('#fixed-character-container');
    if (fixedContainer) {
      fixedContainer.setAttribute('visible', 'false');
    }

    appState.characterActivated = false;
    appState.activationInProgress = false;
    showNotification('已切换到标记模式', 'info');
  }

  updateUI();
}

// 重置卡通人物
function resetCharacter() {
  if (appState.mode === 'fixed') {
    console.log('重置固定卡通人物...');

    // 停止行走
    stopWalking();

    const fixedContainer = document.querySelector('#fixed-character-container');
    if (fixedContainer) {
      fixedContainer.setAttribute('visible', 'false');
      // 重置位置
      fixedContainer.setAttribute('position', '0 -0.3 -1.5');
      fixedContainer.setAttribute('rotation', '0 0 0');
    }

    // 重置行走参数
    walkingParams.direction = { x: 1, y: 0, z: 1 };

    appState.characterActivated = false;
    appState.activationInProgress = false;
    showNotification('卡通人物已重置，请用标记重新激活', 'info');
    updateUI();
  }
}

// 更新UI状态
function updateUI() {
  const modeText = document.getElementById('mode-text');
  const infoText = document.getElementById('info-text');
  const modeBtn = document.getElementById('mode-btn');
  const resetBtn = document.getElementById('reset-btn');
  const walkBtn = document.getElementById('walk-btn');

  if (appState.mode === 'marker') {
    modeText.textContent = '标记模式';
    infoText.textContent = '将摄像头对准Hiro标记来显示卡通人物';
    modeBtn.textContent = '切换到固定模式';
    modeBtn.classList.remove('active');
    resetBtn.disabled = true;
    walkBtn.disabled = true;
  } else {
    modeText.textContent = '固定模式';
    if (appState.characterActivated) {
      if (appState.isWalking) {
        infoText.textContent = '卡通人物正在可视区域内自由漫步';
      } else {
        infoText.textContent = '卡通人物已固定，点击按钮开始行走';
      }
      resetBtn.disabled = false;
      walkBtn.disabled = false;
      walkBtn.textContent = appState.isWalking ? '停止行走' : '开始行走';
    } else {
      infoText.textContent = '将摄像头对准Hiro标记来激活卡通人物';
      resetBtn.disabled = true;
      walkBtn.disabled = true;
      walkBtn.textContent = '开始/停止行走';
    }
    modeBtn.textContent = '切换到标记模式';
    modeBtn.classList.add('active');
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

// 改变卡通人物颜色
function changeColor() {
  currentColorIndex = (currentColorIndex + 1) % colors.length;
  const newColor = colors[currentColorIndex];

  // 更新标记模式下的卡通人物颜色
  const markerCharacterHead = document.querySelector('#marker-character-head');
  if (markerCharacterHead) {
    markerCharacterHead.setAttribute('color', newColor);

    // 更新标记模式下的手臂和手部颜色
    const markerCharacter = document.querySelector('#marker-character');
    if (markerCharacter) {
      const arms = markerCharacter.querySelectorAll('a-cylinder[animation]');
      arms.forEach(arm => {
        arm.setAttribute('color', newColor);
      });

      // 更新手部颜色
      const hands = markerCharacter.querySelectorAll('a-sphere[position*="-0.12"], a-sphere[position*="0.12"]');
      hands.forEach(hand => {
        if (hand.getAttribute('position').includes('-0.01') || hand.getAttribute('position').includes('-0.01')) {
          hand.setAttribute('color', newColor);
        }
      });
    }

    // 添加颜色变化动画
    markerCharacterHead.setAttribute('animation__color', {
      property: 'rotation',
      from: '0 0 0',
      to: '360 0 0',
      dur: 1000,
      easing: 'easeInOutQuad'
    });
  }

  // 更新固定模式下的卡通人物颜色
  const characterHead = document.querySelector('#character-head');
  if (characterHead) {
    characterHead.setAttribute('color', newColor);

    // 更新手臂和手部颜色
    const fixedContainer = document.querySelector('#fixed-character-container');
    if (fixedContainer) {
      const arms = fixedContainer.querySelectorAll('a-cylinder[animation]');
      arms.forEach(arm => {
        arm.setAttribute('color', newColor);
      });

      // 更新手部颜色
      const leftHand = fixedContainer.querySelector('a-sphere[position="-0.12 -0.01 0"]');
      const rightHand = fixedContainer.querySelector('a-sphere[position="0.12 -0.01 0"]');
      if (leftHand) leftHand.setAttribute('color', newColor);
      if (rightHand) rightHand.setAttribute('color', newColor);
    }

    // 添加颜色变化动画
    characterHead.setAttribute('animation__color', {
      property: 'rotation',
      from: '0 0 0',
      to: '360 0 0',
      dur: 1000,
      easing: 'easeInOutQuad'
    });
  }

  showNotification(`颜色已更改为 ${newColor}`, 'info');
  console.log('卡通人物颜色已更改为:', newColor);
}

// 重置函数名更新
function resetCylinder() {
  resetCharacter();
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

// 添加触摸事件支持（移动设备）
document.addEventListener('touchstart', function (e) {
  // 防止页面滚动
  if (e.target.tagName !== 'BUTTON') {
    e.preventDefault();
  }
}, { passive: false });

// 添加键盘快捷键
document.addEventListener('keydown', function (e) {
  switch (e.key) {
    case 'c':
    case 'C':
      changeColor();
      break;
    case 'm':
    case 'M':
      const markerDisplay = document.getElementById('marker-display');
      if (markerDisplay.style.display === 'none' || !markerDisplay.style.display) {
        showMarker();
      } else {
        hideMarker();
      }
      break;
    case 't':
    case 'T':
      toggleMode();
      break;
    case 'r':
    case 'R':
      if (appState.mode === 'fixed' && appState.characterActivated) {
        resetCharacter();
      }
      break;
    case 'w':
    case 'W':
      if (appState.mode === 'fixed' && appState.characterActivated) {
        toggleWalking();
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