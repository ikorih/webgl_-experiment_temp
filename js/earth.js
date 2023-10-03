class EarthParticles {
    constructor(canvasId, density, color, maxDistance, repulsionFactor) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.density = density || 10;
        this.color = color || 'blue';
        this.maxDistance = maxDistance || 100; // 反発効果が始まる距離
        this.repulsionFactor = repulsionFactor || 1; // 反発する度合い
        this.particles = [];
        this.mouse = { x: null, y: null };

        // 画像を読み込む
        this.earthImage = new Image();
        this.earthImage.src = 'img/earth.png'; // 大陸のシェイプを含む画像へのパスを指定

        this.init();
        this.animate();
    }

    init() {
        this.particles = [];

        this.earthImage.onload = () => {
            this.ctx.drawImage(this.earthImage, 0, 0, this.width, this.height);
            const data = this.ctx.getImageData(0, 0, this.width, this.height);
            this.ctx.clearRect(0, 0, this.width, this.height);

            for (let y = 0; y < this.height; y += this.density) {
                for (let x = 0; x < this.width; x += this.density) {
                    const pixel = data.data[(y * this.width + x) * 4];
                    if (pixel > 128) {
                        this.particles.push(new Particle(this.ctx, x, y, this.color, this.maxDistance, this.repulsionFactor)); // ここを修正
                    }
                }
            }
        };

        this.canvas.addEventListener('mousemove', (event) => {
            this.mouse.x = event.x;
            this.mouse.y = event.y;
        });

        this.canvas.addEventListener('mouseout', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(this.mouse);
        }
    }
}

class Particle {
    constructor(ctx, x, y, color, maxDistance, repulsionFactor) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.size = 2;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = color;
        this.maxDistance = maxDistance;
        this.repulsionFactor = repulsionFactor;
    }

    update(mouse) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let force = (this.maxDistance - distance) / this.maxDistance;
        let directionX = forceDirectionX * force * this.repulsionFactor * -1;
        let directionY = forceDirectionY * force * this.repulsionFactor * -1;

        if (distance < this.maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }

        this.draw();
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

// インスタンスの作成
new EarthParticles('canvas', 10, 'blue', 102, 1);
