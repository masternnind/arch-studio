let canvas, ctx, width, height;
let points = [];
let paused = false;

// 몽환적 파스텔톤 색상
const DOT_COLOR = 'rgba(180,200,255,0.8)';
const LINE_COLOR = (alpha) => `rgba(180,200,255,${alpha})`;

// 고정 속도(px/frame)
const BASE_SPEED = 0.6;

// 화면 크기에 따라 포인트 개수 동적 결정
function getNumPoints(w, h) {
    // 몽환적이면서도 적당히 꽉 찬 밀도
    const percent = 0.03;      // 전체 면적의 3%
    const maxPercent = 0.08;   // 최대 8%
    const minPercent = 0.015;  // 최소 1.5%
    const area = w * h;
    const vwvh = 100 * 100;
    const raw = (area / vwvh) * 100 * percent;
    const maxPts = (area / vwvh) * 100 * maxPercent;
    const minPts = (area / vwvh) * 100 * minPercent;
    return Math.round(Math.max(minPts, Math.min(maxPts, raw)));
}

self.onmessage = (e) => {
    const data = e.data;
    if (data.canvas) {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        width = canvas.width = data.width;
        height = canvas.height = data.height;
        points = [];
        initPoints();
        animate();
    } else if (data.width && data.height) {
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
        // 반지름을 조금 랜덤하게
        const r = Math.random() * 1.5 + 0.5;
        const x = Math.random() * (width - 2 * r) + r;
        const y = Math.random() * (height - 2 * r) + r;
        // 화면 크기와 무관하게 항상 같은 속도
        const dx = (Math.random() - 0.5) * BASE_SPEED;
        const dy = (Math.random() - 0.5) * BASE_SPEED;
        points.push({ x, y, dx, dy, r });
    }
}

function updatePoints() {
    for (const p of points) {
        if (p.x + p.r > width || p.x - p.r < 0) p.dx = -p.dx;
        if (p.y + p.r > height || p.y - p.r < 0) p.dy = -p.dy;
        p.x += p.dx;
        p.y += p.dy;
        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = DOT_COLOR;
        ctx.fill();
    }
}

function connectPoints() {
    const maxDistance = 120; // 조금 더 넓게 연결
    for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
            const dx = points[a].x - points[b].x;
            const dy = points[a].y - points[b].y;
            const dist = Math.hypot(dx, dy);
            if (dist < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = LINE_COLOR(1 - dist / maxDistance);
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
