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
    // === 원래 느낌 유지: percent/min/max 퍼센트 방식 그대로 ===
    const percent = 0.03;      // 기본 밀도
    const maxPercent = 0.08;   // 상한
    const minPercent = 0.015;  // 하한

    const area = w * h;
    const vwvh = 100 * 100;

    // === 보정 포인트 ===
    // 1) 작은 화면일수록 조금 더 촘촘하게 (원래 감성 유지 선에서만 boost)
    let deviceBoost = 1.0;
    const minSide = Math.min(w, h);
    if (minSide < 700)       deviceBoost = 1.8;   // 모바일
    else if (minSide < 1100) deviceBoost = 1.35;  // 태블릿

    // 2) 고해상도(DPR)에서 너무 성글지 않도록 약한 보정
    const dpr = Math.min(self.devicePixelRatio || 1, 2);
    const dprBoost = Math.pow(dpr, 0.4); // 과하지 않게

    // 3) 원래 계산식 유지 + 보정 계수 곱
    const raw    = (area / vwvh) * 100 * percent    * deviceBoost * dprBoost;
    const maxPts = (area / vwvh) * 100 * maxPercent * deviceBoost * dprBoost;
    const minPts = (area / vwvh) * 100 * minPercent * deviceBoost * dprBoost;

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
    // === 원래 120px 감성 유지 + 화면 크기에 따른 아주 약한 스케일 ===
    const BASE_MAX_DISTANCE = 120;
    // 1366x768(흔한 랩탑) 대각선 기준으로 0.85~1.2 범위 내에서만 살짝 보정
    const refDiag = Math.hypot(1366, 768);
    const diag = Math.hypot(width, height);
    const scale = Math.max(0.85, Math.min(1.20, Math.pow(diag / refDiag, 0.5)));
    const maxDistance = BASE_MAX_DISTANCE * scale;

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
