const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d", {
  willReadFrequently: true,
});
function initCanvasSize() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}
initCanvasSize();
/**
 * 获取一个范围的随机数
 * */
function getRandom(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}
//创建粒子的构造函数  粒子位于大圆的半径上
class Particle {
  constructor(params) {
    //小圆圈的半径随机获取
    this.size = getRandom(2 * devicePixelRatio, 5 * devicePixelRatio);
    //大圆的半径
    const r = Math.min(canvas.width, canvas.height) / 2;
    //粒子随机分布在大圆的半径上
    const rad = (getRandom(0, 360) * Math.PI) / 180;
    //大圆的x,y坐标 就是圆心的坐标
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    //小圆圈的坐标
    this.x = cx + r * Math.cos(rad);
    this.y = cy + r * Math.sin(rad);
  }
  //画出粒子
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = "#544";
    ctx.fill();
  }
  //移动粒子到
  moveTo(tx, ty) {
    const duration = 500; //运动的时间
    const sx = this.x,
      sy = this.y;
    const xSpeed = (tx - sx) / duration;
    const ySpeed = (ty - sy) / duration;
    const startTime = Date.now();
    const _move = () => {
      const t = Date.now() - startTime;
      const x = sx + xSpeed * t;
      const y = sy + ySpeed * t;
      this.x = x;
      this.y = y;
      if (t > duration) {
        this.x = tx;
        this.y = ty;
        return;
      }
      requestAnimationFrame(_move);
    };
    _move();
  }
}
const particles = [];
//清空画布
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
let text = null;
//全局的画
function draw() {
  clear();
  //更新粒子
  update();
  for (let i = 0; i < particles.length; i++) {
    particles[i].draw();
  }
  //更新后 画
  requestAnimationFrame(draw);
}
draw();

function update() {
  //1,画文字
  const curText = getText();
  if (text == curText) {
    return;
  }
  //clear();
  text = curText;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.font = `${120 * devicePixelRatio}px Arial`;
  ctx.textAlign = "center";
  const { width, height } = canvas;
  ctx.fillText(text, width / 2, height / 2);
  //拿到画布像素信息
  const points = getPoints();
  clear();
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    let p = particles[i];
    if (!p) {
      p = new Particle();
      particles.push(p);
    }
    p.moveTo(x, y);
  }
  if (particles.length > points.length) {
    particles.splice(points.length);
  }
}
//拿到画布所有的黑色的像素信息
function getPoints() {
  let points = [];
  const gap = 6;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < canvas.width; i += gap) {
    for (let j = 0; j < canvas.height; j += gap) {
      let index = (j * canvas.width + i) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      if (r == 0 && g == 0 && b == 0 && a == 255) {
        points.push([i, j]);
      }
    }
  }
  return points;
}
function getText() {
  return new Date().toTimeString().substring(0, 8);
}
