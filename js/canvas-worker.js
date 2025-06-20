let canvas, ctx, width, height;
let points = [];
let paused = false;

// 화면 크기에 따라 포인트 개수 동적 결정
function getNumPoints(w, h) {
    const percent = 0.04; // 전체 면적의 4%만큼 점 생성
    const maxPercent = 0.05; // 최대 40%
    const minPercent = 0.02; // 최소 2%
    const area = w * h;
    const vwvh = 100 * 100; // 100vw * 100vh
    const numPoints = Math.round((area / vwvh) * 100 * percent);
    const maxPoints = Math.round((area / vwvh) * 100 * maxPercent);
    const minPoints = Math.round((area / vwvh) * 100 * minPercent);
    return Math.max(minPoints, Math.min(maxPoints, numPoints));
}

self.onmessage = (e) => {
    const data = e.data;
    if (data.canvas) {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        if (!ctx) {
          // 디버깅용 메시지
          self.postMessage({ error: 'ctx is null' });
        }
        width = canvas.width = data.width;
        height = canvas.height = data.height;
        points = [];
        initPoints();
        animate();
    }
    // 크기만 변경하는 메시지 처리
    if (data.width && data.height && !data.canvas) {
        width = canvas.width = data.width;
        height = canvas.height = data.height;
        points = [];
        initPoints();
    }
    if (data.pause !== undefined) {
        paused = data.pause;
    }
};

function initPoints() {
    const numPoints = getNumPoints(width, height);
    for (let i = 0; i < numPoints; i++) {
        const r = 1.2;
        const x = Math.random() * (width - r * 2) + r;
        const y = Math.random() * (height - r * 2) + r;
        const dx = (Math.random() - 0.5) * 1;
        const dy = (Math.random() - 0.5) * 1;
        points.push({ x, y, dx, dy, r });
    }
}

function updatePoints() {
    for (const p of points) {
        if (p.x + p.r > width || p.x - p.r < 0) p.dx = -p.dx;
        if (p.y + p.r > height || p.y - p.r < 0) p.dy = -p.dy;
        p.x += p.dx;
        p.y += p.dy;
        // Draw each point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
}

function connectPoints() {
    const maxDistance = 100;
    for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
            const dx = points[a].x - points[b].x;
            const dy = points[a].y - points[b].y;
            const distance = Math.hypot(dx, dy);
            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(225,225,225, ${1 - distance / maxDistance})`;
                ctx.lineWidth = 1;
                ctx.moveTo(points[a].x, points[a].y);
                ctx.lineTo(points[b].x, points[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    if (!paused) {
        updatePoints();
        connectPoints();
    }
    requestAnimationFrame(animate);
}