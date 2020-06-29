//index.js
import { showToast } from '../../utils/util'

Page({
  data: {
    modeArr: ['普通模式'],// 游戏模式,, '加速模式', '障碍模式'
    index: 0, // modeArr下标
    score: 0,// 当前得分
    maxScore: 0,// 历史最高分
    gameState: '开始',// 游戏状态
    ground: [],// 操场
    rows: 40,// 行数
    cols: 35,// 列数
    snake: [[0, 0], [0, 1], [0, 2]], // 蛇
    food: [], // 食物
    isQuick: false,// 是否加速
    direction: 'right',// 蛇的移动方向
    timer: null,// 移动定时器
    interval: 400,// 间隔500ms移动
  },
  onLoad() {
    this.init();
  },
  // 初始化操场、蛇、食物
  init() {
    let { ground, rows, cols, snake, food } = this.data;
    // 从缓存中获取历史最高分
    const maxScore = wx.getStorageSync('maxScore') || 0;

    // 创建操场
    for(let i = 0; i < rows; i++) {
      ground.push([]);
      for(let j = 0; j < cols; j++) {
        ground[i].push(0)
      }
    }

    // 创建蛇
    for(let i = 0; i < 3; i++) {
      ground[0][i] = 1
    }

    // 创建食物
    food = this.createFood();
    const [x, y] = food;
    ground[x][y] = 2;
    this.setData({
      maxScore,
      ground,
      snake,
      food
    })
  },
  // 创建食物
  createFood() {
    const { ground, rows, cols, snake } = this.data;
    const x = Math.floor(Math.random() * rows);
    const y = Math.floor(Math.random() * cols);
    for(let i of snake) {
      if(x === i[0] && y === i[1]) {
        createFood();
        return
      }
    }
    return [x, y]
  },
  // 启动定时器，开始游戏
  starGame() {
    const { interval } = this.data;
    this.data.timer = setInterval(() => {
      this.checkGameState()
    }, interval);
  },
  // 检查游戏状态
  checkGameState() {
    let { ground, rows, cols, snake, food, timer } = this.data;
    let len = snake.length;
    let snakeHead = snake[len - 1];
    let snakeTail = snake[0];
    let arr = this.snakeMove();
    let newSnakeHead = [snakeHead[0] + arr[0], snakeHead[1] + arr[1]];
    const [headX, headY] = newSnakeHead;
    const [tailX, tailY] = snakeTail;
    // 操场内移动
    if(headX >= 0 && headX < rows && headY >= 0 && headY < cols) {
      // 碰到自身
      for(let i = 0; i < len - 1; i++) {
        if(headX == snake[i][0] && headY == snake[i][1]) {
          clearInterval(timer);
          this.storeMaxScore();
          return
        }
      }
      // 修改蛇
      for(let i = 0; i < len - 1; i++) {
        snake[i] = snake[i + 1]
      }
      snake[len - 1] = newSnakeHead;

      // 修改操场
      ground[tailX][tailY] = 0;
      ground[headX][headY] = 1;
    } else { // 移出边界
      clearInterval(timer);
      this.storeMaxScore();
      return
    }
    // 吃到食物
    if(headX == food[0] && headY == food[1]) {
      // 分数加10， 蛇长度加1，创建新的食物
      snake.unshift(snakeTail);
      ground[tailX][tailY] = 1;
      food = this.createFood();
      const [x, y] = food;
      ground[x][y] = 2;
      this.setData({
        score: this.data.score + 10,
        food
      })
    }
    this.setData({
      snake,
      ground
    })
  },
  // 存储历史最高分
  async storeMaxScore() {
    const { score, maxScore } = this.data;
    if(score > maxScore) {
      this.setData({ maxScore: score });
      wx.setStorageSync('maxScore', score);
      await showToast('恭喜你，突破了历史最高分！')
    } else {
      await showToast('真遗憾，请再接再厉！')
    }
    this.setData({
      ground: [],
      snake: [[0, 0], [0, 1], [0, 2]],
      food: [],
      direction: 'right',
      gameState: '开始',
      score: 0,
      isQuick: false,
      interval: 400
    })
    this.init()
  },
  // 蛇移动
  snakeMove() {
    const { direction } = this.data;
    switch(direction) {
      case 'top':
        return [-1, 0]
      case 'bottom':
        return [1, 0]
      case 'left':
        return [0, -1]
      case 'right':
        return [0, 1]
    }
  },
  // 改变游戏模式
  handlePickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  // 游戏开始、暂停
  handleStateChange() {
    if(this.data.gameState == '开始') { // 暂停游戏
      this.setData({
        gameState: '暂停'
      })
      this.starGame()
    } else {  // 开始游戏
      this.setData({
        gameState: '开始'
      })
      clearInterval(this.data.timer)
    }
  },
  // 速度改变（加速、减速）
  handleSpeedChange() {
    let { isQuick, interval } = this.data;
    interval = isQuick ? 400 : 100;
    this.setData({
      isQuick: !isQuick,
      interval
    })
    clearInterval(this.data.timer);
    this.starGame()
  },
  // 方向改变
  handleDirectionChange(e) {
    const newDirection = e.currentTarget.dataset.direction;
    const { direction } = this.data;
    if(direction == 'top' && newDirection == 'bottom') return
    else if(direction == 'bottom' && newDirection == 'top') return
    else if(direction == 'left' && newDirection == 'right') return
    else if(direction == 'right' && newDirection == 'left') return
    this.setData({
      direction: newDirection
    })
  }
})
