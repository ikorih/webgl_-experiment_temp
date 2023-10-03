// 定数
const REPULSE_STRENGTH = 0.01;

class Particle {
    static count = 0;
    static cw = 0;
    static ch = 0;
    static wh = 0;
    static mouseX = 0;
    static mouseY = 0;
    static isEnter = false;

    constructor(id, color, shapeType, minSizePercent = 0.25, maxSizePercent = 1.0) {
        if (!(this instanceof Particle)) {
            throw new TypeError("Cannot call a class as a function");
        }
        this.id = id;
        this.color = color;
        this.shape = shapeType === 'random' ? (Math.random() < 0.5 ? 'rectangle' : 'square') : shapeType; // 形状の選択
        this.minSizePercent = minSizePercent;
        this.maxSizePercent = maxSizePercent;
        this.sizePercent = this.minSizePercent + (this.maxSizePercent - this.minSizePercent) * Math.random(); // 最小値と最大値の間でランダムな値を選択
        this.initializeProperties();
    }

    initializeProperties() {
        this.isFirst = true;
        this.pc = Math.random() > 0.75;
        this.progress = 2 * Math.random();
        this.progressOpa = 360 * Math.random();
        this.opacity = 0;
        this.targetX = 0;
        this.currentX = 0;
        this.baseX = (this.id / Particle.count); // 均等に出現
        // this.baseX = (this.id / Particle.count) * 0.65; // 左側に偏った出現
        // this.baseY = (1 - (9 * ((20 * this.baseX) / 13 + 0.2)) / 12) * Math.random() + (1 - (20 * this.baseX) / 13) / 5;
        this.baseY = Math.random();
        this.targetY = 0;
        this.currentY = 0;
        this.sizePercent = this.minSizePercent + (this.maxSizePercent - this.minSizePercent) * Math.random(); // 最小値と最大値の間でランダムな値を選択
        this.size = 0;
        this.remove = false;
        this.speed = 0.45 * Math.random() + 0.05;
        this.speedOpa = 0.5 * Math.random() + 0.25;
        this.triangle = 0;
        this.radian = 0;
        this.diffX = 0;
        this.diffY = 0;
    }

    // Static methods
    static resize(width, height, wh) {
        this.cw = width;
        this.ch = height;
        this.wh = wh;
    }

    static scroll(top, left) {
        this.gbcrTop = top;
        this.customGbcrTop = -this.gbcrTop / this.ch / 2;
        this.gbcrLeft = left;
    }

    static countUp(count) {
        this.count = count;
    }

    static mousemove(x, y) {
        this.mouseX = x / this.cw;
        this.mouseY = y / this.ch;
        // this.mouseX = (x - this.gbcrLeft) / this.cw;
        // this.mouseY = (y - this.gbcrTop) / this.ch;
    }

    static toggleEnter(isEnter) {
        this.isEnter = isEnter;
    }

    // Instance methods

    render(context) {
        if (this.pc && Particle.cw < 768) {
            return;
        }
        context.save();
        context.fillStyle = this.color;
        context.globalAlpha = this.opacity;

        const x = Particle.cw * this.currentX;
        const y = this.currentY * Particle.ch;
        const width = this.size;
        const height = this.shape === 'rectangle' ? this.size * 1.2 : this.size;
        const radius = 2; // 丸みの半径を調整

        context.beginPath();
        context.moveTo(x + radius, y);
        context.lineTo(x + width - radius, y);
        context.arcTo(x + width, y, x + width, y + radius, radius);
        context.lineTo(x + width, y + height - radius);
        context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        context.lineTo(x + radius, y + height);
        context.arcTo(x, y + height, x, y + height - radius, radius);
        context.lineTo(x, y + radius);
        context.arcTo(x, y, x + radius, y, radius);
        context.closePath();
        context.fill();

        context.restore();
        this.update();
    }

    update() {
        this.progress += (1 / Particle.cw) * this.speed * 5;
        this.size = (this.sizePercent * Particle.wh) / 100 + 5; // パーティクルのサイズを計算。whは画面の幅か高さの小さい方。
        this.progressOpa += this.speedOpa;
        this.opacity = Math.sin((this.progressOpa / 180) * Math.PI) + 0.9;

        if (this.opacity < 0) { 
            this.opacity = 0 
        }

        this.targetX = this.baseX + (Math.cos(this.progress * Math.PI) * this.size) / 200; // 目標のX座標。進行度に応じた振動を追加。
        this.targetY = this.baseY; // 目標のY座標。基本位置に設定。

        if (Particle.isEnter) { 
            this.repulse() 
        }

        this.currentX += (this.targetX - this.currentX) / 10;
        this.currentY += (this.targetY - this.currentY) / 10;

        if (this.isFirst) {
            this.isFirst = false;
            this.currentX = this.targetX;
            this.currentY = this.targetY;
        }
    }
    repulse() {
        const distanceX = this.currentX - Particle.mouseX; // パーティクルとマウスのX座標の差
        const distanceY = this.currentY - Particle.mouseY; // パーティクルとマウスのY座標の差
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY); // パーティクルとマウスの距離

        const thresholdDistance = 0.6; // 反発効果を適用する距離の閾値

        if (distance < thresholdDistance) { // 距離が閾値未満の場合、反発効果を適用
            const angle = Math.atan2(distanceY, distanceX); // パーティクルからマウスへの角度
            const force = (thresholdDistance - distance) / thresholdDistance; // 反発する力。距離が近いほど大きくなる。

            this.targetX += Math.cos(angle) * force * REPULSE_STRENGTH; // X方向の反発
            this.targetY += Math.sin(angle) * force * REPULSE_STRENGTH; // Y方向の反発
        }
    }
}


// キャンバスとコンテキストの取得
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

// 親要素のサイズに合わせてキャンバスのサイズを設定する関数
const resizeCanvas = () => {
  const parentElement = canvas.parentElement; // 親要素を取得
  const dpr = window.devicePixelRatio || 1; // デバイスピクセル比を取得
  
  canvas.style.width = `${parentElement.clientWidth}px`;   // CSSの幅
  canvas.style.height = `${parentElement.clientHeight}px`; // CSSの高さ
  canvas.width = parentElement.clientWidth * dpr;           // 物理的な幅
  canvas.height = parentElement.clientHeight * dpr;         // 物理的な高さ
  
  context.scale(dpr, dpr); // スケールをデバイスピクセル比に合わせる
  Particle.resize(canvas.width / dpr, canvas.height / dpr, Math.min(canvas.width / dpr, canvas.height / dpr));
};

// 読み込み時にリサイズ関数を呼び出す
resizeCanvas();

// リサイズイベントリスナーを追加
window.addEventListener('resize', resizeCanvas);

// パーティクルのプロパティ
const particleCount = 10; // パーティクルの数
const colorVariations = ['#ff0000', '#00ff00', '#0000ff']; // 色のバリエーション

// パーティクルの初期化
Particle.resize(canvas.width, canvas.height, Math.min(canvas.width, canvas.height));
Particle.countUp(particleCount);
const shapeType = 'random'; // 'square', 'rectangle', 'random' から選ぶことができます。
// sizePercentの値を変数に格納（ここでは例として0.5に設定）
// sizePercentの最小値と最大値を変数に格納
const minSizePercent = 0.2; // 任意の最小値を設定
const maxSizePercent = 7.75; // 任意の最大値を設定
const particles = Array.from({ length: particleCount }, (_, id) => new Particle(id, colorVariations[id % colorVariations.length], shapeType, minSizePercent, maxSizePercent));

// マウスイベントの追加
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    Particle.mousemove(x, y);
    Particle.toggleEnter(true);
});

// アニメーションのループ
function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
        particle.render(context);
    });
    requestAnimationFrame(animate);
}

animate();

