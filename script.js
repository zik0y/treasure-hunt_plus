    const map = document.getElementById('map');
    const character = document.getElementById('character');
    const cluePoint = document.getElementById('clue-point');
    const eventText = document.getElementById('event-text');
    const startButton = document.getElementById('startButton');
    const clueAnimation = document.getElementById('clue-animation');
    const chestAnimation = document.getElementById('chest-animation');
    const castle = document.getElementById('castle');
    const guard = document.getElementById('guard');
    const gameOverScreen = document.getElementById('gameOver');
    const congratulationsScreen = document.getElementById('congratulations');
    const restartButtonGameOver = document.getElementById('restartButtonGameOver');
    const restartButtonCongratulations = document.getElementById('restartButtonCongratulations');
    // 获取背景音乐和按钮的引用
    const backgroundMusic = document.getElementById('backgroundMusic');
    const musicToggleButton = document.getElementById('musicToggleButton');
    let clueFound = false;
    let treasureFound = false;
    let castleVisible = false;
    let guardMoving = null;
    // 定义守卫巡逻路径点（示例坐标，可根据实际调整）
    const guardPatrolPoints = [
      { x: 100, y: 100 },
      { x: 300, y: 100 },
      { x: 300, y: 300 },
      { x: 100, y: 300 }
    ];
    let currentPatrolIndex = 0;


    // 设置发光点的随机位置
    function placeClue() {
      let clueX = Math.random() * (map.offsetWidth - 50);
      let clueY = Math.random() * (map.offsetHeight - 50);
      cluePoint.style.left = clueX + 'px';
      cluePoint.style.top = clueY + 'px';
      cluePoint.style.opacity = 1;
    }


    async function loadCluesAndProcess() {
      try {
        const response = await fetch('clues.txt');
        const clues = await response.json();
        const randomClue = clues[Math.floor(Math.random() * clues.length)];
        if (randomClue.type === "useful") {
          eventText.textContent = randomClue.content;
          if (randomClue.content.includes("城堡")) {
            map.className = 'temple-background'; // 切换背景
            cluePoint.style.opacity = 0; // 隐藏发光点
            showCastle(); // 显示城堡
                // 显示城堡和守卫信息
         showCastleAndGuardInfo();
          }
        } else {
          eventText.textContent = "此线索无用";
          clueFound = false;
          clueAnimation.style.opacity = 0;
          setTimeout(() => clueAnimation.style.display = 'none', 1000);
          placeClue(); // 重新放置线索
        }
      } catch (error) {
        eventText.textContent = "出现错误：" + error.message;
      }
    }

    // 显示城堡
    function showCastle() {
      castle.style.display = 'block';
      castleVisible = true;
      showGuard(); // 显示守卫
    }

    // 显示守卫
    function showGuard() {
      guard.style.display = 'block';
      moveGuardOnPath(); // 启动守卫按路径移动
    }
// 让守卫沿着路径移动
function moveGuardOnPath() {
  if (!castleVisible) return;
  // 获取当前目标路径点
  let targetPoint = guardPatrolPoints[currentPatrolIndex];
  let guardX = parseFloat(guard.style.left) || 0;
  let guardY = parseFloat(guard.style.top) || 0;
  // 计算移动方向和速度
  let speed = 5;
  let dx = targetPoint.x - guardX;
  let dy = targetPoint.y - guardY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 0) {
    // 归一化方向向量
    dx /= distance;
    dy /= distance;
    // 更新守卫位置
    guard.style.left = (guardX + dx * speed) + 'px';
    guard.style.top = (guardY + dy * speed) + 'px';
  }
  // 判断是否到达当前路径点，到达则切换到下一个路径点
  if (distance < 5) {
    currentPatrolIndex = (currentPatrolIndex + 1) % guardPatrolPoints.length;
    targetPoint = guardPatrolPoints[currentPatrolIndex]; // 重新获取目标点
  }
  guardMoving = setTimeout(moveGuardOnPath, 100); // 根据需求调整移动间隔时间
}


function startGuardChase(characterX, characterY) {
  let guardX = parseFloat(guard.style.left) || 0;
  let guardY = parseFloat(guard.style.top) || 0;
  let dx = characterX - guardX;
  let dy = characterY - guardY;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // 如果角色距离守卫太近，则认为守卫追到了角色
  if (distance < 5) {
    endGame("遇到守卫！游戏结束！");
    return;
  }

  // 计算追逐速度和移动方向
  let speed = 1; // 降低追逐速度
  dx /= distance;
  dy /= distance;
  guardX += dx * speed;
  guardY += dy * speed;
  guard.style.left = guardX + 'px';
  guard.style.top = guardY + 'px';

  // 继续追逐
  guardMoving = setTimeout(() => {
    let newCharacterX = parseFloat(character.style.left) || 0;
    let newCharacterY = parseFloat(character.style.top) || 0;
    startGuardChase(newCharacterX, newCharacterY);
  }, 100); // 保持时间间隔不变，确保追逐动作平滑
}

// 定义守卫检测角色的范围（可调整）
const guardDetectionRange = 200; // 原始值，你可以根据需要调整这个值

    // 检查是否碰到守卫
    function checkForGuard(x, y) {
      let guardX = parseFloat(guard.style.left);
      let guardY = parseFloat(guard.style.top);
      const withinDetectionRange = Math.sqrt((x - guardX) * (x - guardX) + (y - guardY) * (y - guardY)) < guardDetectionRange;
      if (withinDetectionRange) {
        console.log('Guard detected you!');
        startGuardChase(x, y); // 调用追逐函数，传入角色坐标
      } else if (Math.abs(x - guardX) < 20 && Math.abs(y - guardY) < 20) {
        console.log('Guard encountered!');
        endGame("遇到守卫！游戏结束！");
      }
    }


// 检查是否找到了宝藏
function checkForTreasure(x, y) {
  if (!castleVisible) return; // 如果城堡不可见，则不进行检查

  let centerX = map.offsetWidth / 2;
  let centerY = map.offsetHeight / 2;
  if (Math.abs(x - centerX) < 20 && Math.abs(y - centerY) < 20 && !treasureFound) {
    chestAnimation.style.left = centerX + 'px';
    chestAnimation.style.top = centerY + 'px';
    chestAnimation.style.display = 'block';
    chestAnimation.style.opacity = 1;
    eventText.textContent = "恭喜!你找到了传说中的宝藏!";
    treasureFound = true;
    endGame("恭喜！你找到了宝藏！");
  }
}

    function moveCharacter(event) {
      const speed = 10; // 移动速度
      let x = parseFloat(character.style.left) || 0;
      let y = parseFloat(character.style.top) || 0;
      const mapWidth = map.offsetWidth;
      const mapHeight = map.offsetHeight;
      const characterWidth = character.offsetWidth;
      const characterHeight = character.offsetHeight;

      // 根据键盘按键更新角色位置
      switch (event.key) {
        case 'ArrowUp': y -= speed; break;
        case 'ArrowDown': y += speed; break;
        case 'ArrowLeft': x -= speed; break;
        case 'ArrowRight': x += speed; break;
      }

      // 限制角色在地图边界内
      x = Math.max(0, Math.min(x, mapWidth - characterWidth));
      y = Math.max(0, Math.min(y, mapHeight - characterHeight));

      // 更新角色位置
      character.style.left = x + 'px';
      character.style.top = y + 'px';

      // 检查其他游戏逻辑
      if (!treasureFound) {
        checkForClue(x, y);
        if (castleVisible) {
          checkForGuard(x, y);
        }
        checkForTreasure(x, y);
      }
    }
// 绑定启动按钮的点击事件
startButton.addEventListener('click', startGame);


// 异步加载元素信息并显示
async function loadElementInfo(elementId) {
  try {
    const response = await fetch('elements.txt');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const elements = await response.json();
    console.log(elements); // 打印解析出的数据，用于调试
    const element = elements.find(e => e.triggerElementId === elementId);
    if (element) {
      // 只设置描述信息，不包含名称
      eventText.textContent = element.description;
    } else {
      console.error(`Element with id '${elementId}' not found in elements.txt`);
    }
  } catch (error) {
    eventText.textContent = "出现错误：" + error.message;
    console.error(error);
  }
}

// 在页面加载时显示图书馆信息
document.addEventListener('DOMContentLoaded', () => {
  loadElementInfo('library');
});

// 显示城堡和守卫信息
function showCastleAndGuardInfo() {
   loadElementInfo('guard').then(() => {
    // 此处可以添加任何需要在守卫信息加载后执行的代码
  });
  loadElementInfo('castle').then(() => {
    // 此处可以添加任何需要在城堡信息加载后执行的代码
  });
}



// 重新开始游戏的处理
function restartGame() {
  // 重新询问玩家昵称
  const playerName = prompt("请输入你的昵称:");

  // 加载历史记录
  const playerInfo = loadPlayerInfo(playerName);
  if (playerInfo) {
    const { gameHistory } = playerInfo;
    console.log(`玩家：${playerName}，历史记录：`, gameHistory);
    // 根据游戏历史恢复游戏状态
  } else {
    console.log(`没有找到历史记录，新玩家！`);
    gameOverScreen.style.display = 'none';
    congratulationsScreen.style.display = 'none';
    clueFound = false;
    treasureFound = false;
    cluePoint.style.opacity = 0;
    chestAnimation.style.opacity = 0;
    castle.style.display = 'none';
    guard.style.display = 'none';
    castleVisible = false;
    currentPatrolIndex = 0;
    clueAnimation.style.display = 'none';
    map.className = ''; // 恢复原背景
    character.style.left = '0px';
    character.style.top = '0px';
    eventText.textContent = "游戏重置。重新开始！";
    backgroundMusic.play(); // 重新播放背景音乐
  }

  // 初始化游戏状态
  clueFound = false;
  treasureFound = false;
  castleVisible = false;
  currentPatrolIndex = 0; // 重置守卫路径索引
  guardMoving = null; // 清空守卫移动的定时器
  character.style.left = '50%';
  character.style.top = '50%';
  cluePoint.style.opacity = 0;
  clueAnimation.style.opacity = 0;
  chestAnimation.style.opacity = 0;
  castle.style.display = 'none';
  guard.style.display = 'none';
  eventText.textContent = '';
  map.className = 'library-background'; // 重置背景为图书馆

  // 隐藏游戏结束和恭喜消息
  gameOverScreen.style.display = 'none';
  gameOverScreen.style.opacity = 0; // 隐藏动画
  congratulationsScreen.style.display = 'none';
  congratulationsScreen.style.opacity = 0; // 隐藏动画

  // 解除所有之前的事件监听器
  document.removeEventListener('keydown', moveCharacter);

  // 重新放置线索并启动其他游戏逻辑
  placeClue();
  document.addEventListener('keydown', moveCharacter); // 重新绑定角色移动事件
  moveGuardOnPath(); // 重新启动守卫按路径移动
}

// 绑定重新开始按钮的点击事件
restartButtonGameOver.addEventListener('click', () => {
  restartGame();
});

restartButtonCongratulations.addEventListener('click', () => {
  restartGame();
});


// 恢复游戏状态
function restoreGameState(gameHistory) {
  gameHistory.forEach(event => {
    if (event === "找到线索") {
      clueFound = true;
      clueAnimation.style.display = 'block';
      clueAnimation.style.opacity = 1;
      eventText.textContent = "继续寻找宝藏...";
    } else if (event === "找到宝藏") {
      treasureFound = true;
      chestAnimation.style.display = 'block';
      chestAnimation.style.opacity = 1;
      eventText.textContent = "你已经找到了宝藏！";
    } else if (event === "遇到守卫") {
      gameOverScreen.style.display = 'flex';
      gameOverScreen.style.opacity = 1;
      eventText.textContent = "遇到守卫！游戏结束！";
    }
  });
}

// 更新游戏历史
function updateGameHistory(newEvent) {
  const playerName = localStorage.getItem('playerName'); // 获取保存的玩家昵称
  if (!playerName) {
    // 如果没有存储昵称，提示用户输入
    const inputName = prompt("请输入你的昵称:");
    localStorage.setItem('playerName', inputName); // 存储昵称
  }

  const playerInfo = loadPlayerInfo(playerName); // 加载玩家历史记录
  if (playerInfo) {
    playerInfo.gameHistory.push(newEvent); // 更新历史
    savePlayerInfo(playerInfo.playerName, playerInfo.gameHistory); // 保存
  }
}

// 保存玩家信息到 localStorage
function savePlayerInfo(playerName, gameHistory) {
  const playerInfo = { playerName, gameHistory };
  localStorage.setItem(playerName, JSON.stringify(playerInfo)); // 将玩家信息保存到 localStorage，键为玩家的昵称
}

// 从 localStorage 加载玩家信息
function loadPlayerInfo(playerName) {
  const playerInfo = localStorage.getItem(playerName);
  return playerInfo ? JSON.parse(playerInfo) : null; // 如果有该昵称的历史数据，解析并返回，否则返回 null
}

// 游戏开始逻辑
function startGame() {
  const dialog = document.createElement('dialog');
  dialog.innerHTML = `
    <h2>游戏操作提示</h2>
    <p>使用键盘的上下左右箭头键移动角色，去寻找宝藏哦，注意避开守卫，祝你好运！</p>
    <button id="closeDialog">关闭提示</button>
  `;
  document.body.appendChild(dialog);
  const closeButton = dialog.querySelector('#closeDialog');

  closeButton.addEventListener('click', () => {
    dialog.close();

    // 每次重新进入时询问玩家昵称
    const playerName = prompt("请输入你的昵称:");

    // 根据昵称检查是否有历史记录
    const playerInfo = loadPlayerInfo(playerName);

    if (playerInfo) {
      eventText.textContent = `欢迎回来, ${playerInfo.playerName}!`;
      // 根据历史记录初始化游戏状态
      restoreGameState(playerInfo.gameHistory);
    } else {
      eventText.textContent = `欢迎新玩家, ${playerName}!`;
      savePlayerInfo(playerName, [], []); // 新玩家保存昵称并初始化历史记录
    }

    // 游戏启动后的一些初始化逻辑
    eventText.textContent += " 请用键盘移动小人，开始寻宝";

    // 监听键盘事件来移除提示信息
    const removeHint = () => {
      eventText.textContent = "";
      document.removeEventListener('keydown', removeHint);
    };
    document.addEventListener('keydown', removeHint);

    // 放置线索并启动其他游戏逻辑
    placeClue();
    document.addEventListener('keydown', moveCharacter);
    moveGuardOnPath();
    backgroundMusic.play(); // 播放背景音乐
  });

  // 显示提示框
  dialog.showModal();
}


// 音乐开关按钮的点击事件
musicToggleButton.addEventListener('click', () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play();
    musicToggleButton.textContent = '关闭音乐';
  } else {
    backgroundMusic.pause();
    musicToggleButton.textContent = '开启音乐';
  }
});



// 检查并更新历史记录
function checkForClue(x, y) {
  let clueX = parseFloat(cluePoint.style.left);
  let clueY = parseFloat(cluePoint.style.top);
  if (Math.abs(x - clueX) < 20 && Math.abs(y - clueY) < 20 && !clueFound) {
    clueFound = true;
    clueAnimation.style.left = clueX + 'px';
    clueAnimation.style.top = clueY + 'px';
    clueAnimation.style.display = 'block';
    clueAnimation.style.opacity = 1;
    eventText.textContent = "在古老的图书馆里找到了一个线索...";
    updateGameHistory("找到线索");
    setTimeout(() => {
      loadCluesAndProcess();
    }, 2000);
  }
}


 // 游戏结束时显示恭喜页面或游戏结束页面
function endGame(message = "") {
  clearTimeout(guardMoving); // 停止守卫移动
  guardMoving = null;
  eventText.textContent = message;
  gameOverScreen.style.display = 'block';
  backgroundMusic.pause(); // 暂停背景音乐
  backgroundMusic.currentTime = 0; // 重置到开头
  document.removeEventListener('keydown', moveCharacter);
   document.removeEventListener('keydown', moveCharacter);
  if (message.includes("宝藏")) {
    congratulationsScreen.style.display = 'flex';
  } else if (message.includes("守卫")) {
    gameOverScreen.style.display = 'flex';
  }
  // 显示游戏结束画面
  if (message.includes("守卫")) {
    gameOverScreen.style.display = 'flex'; // 显示游戏结束画面
    setTimeout(() => {
      gameOverScreen.style.opacity = 1; // 触发动画
    updateGameHistory("遇到守卫");
    }, 100);
  } else if (message.includes("宝藏")) {
    updateGameHistory("找到宝藏");
    // 显示恭喜画面并添加动画
    congratulationsScreen.style.display = 'flex'; // 显示恭喜页面
    setTimeout(() => {
      congratulationsScreen.style.opacity = 1; // 触发动画
    }, 100);
  }
}
