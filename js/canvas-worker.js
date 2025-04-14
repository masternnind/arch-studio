let canvas, ctx, width, height;
const numPoints = 800;
const points = [];
let paused = false;

// 메시지 처리 (메인 스레드와 통신)
self.onmessage = (e) => {
    const { canvas: offscreenCanvas, width: w, height: h, pause } = e.data;

    if (offscreenCanvas) {
        canvas = offscreenCanvas;
        ctx = canvas.getContext('2d');
        width = canvas.width = w;
        height = canvas.height = h;
        initPoints();
        animate();
    }

    if (pause !== undefined) {
        paused = pause;
    }
};

// 점 초기화
function initPoints() {
    points.length = 0; // 기존 점 배열 초기화
    for (let i = 0; i < numPoints; i++) {
        const r = 2;
        const x = Math.random() * (width - r * 2) + r;
        const y = Math.random() * (height - r * 2) + r;
        const dx = (Math.random() - 0.5) * 1.5;
        const dy = (Math.random() - 0.5) * 1.5;
        points.push({ x, y, dx, dy, r });
    }
}

// 점 업데이트 및 그리기
function updatePoints() {
    points.forEach((p) => {
        // 경계 충돌 처리
        if (p.x + p.r > width || p.x - p.r < 0) p.dx = -p.dx;
        if (p.y + p.r > height || p.y - p.r < 0) p.dy = -p.dy;

        // 위치 업데이트
        p.x += p.dx;
        p.y += p.dy;

        // 점 그리기
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    });
}

// 점 연결
function connectPoints() {
    const maxDistance = 100;
    points.forEach((p1, a) => {
        points.slice(a + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.hypot(dx, dy);

            if (distance < maxDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance / maxDistance})`;
                ctx.lineWidth = 1;
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
}

// 애니메이션 루프
function animate() {
    ctx.clearRect(0, 0, width, height);

    if (!paused) {
        updatePoints();
        connectPoints();
    }

    requestAnimationFrame(animate);
}
