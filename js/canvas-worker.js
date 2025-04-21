let canvas, ctx, width, height;
const numPoints = 800;
const points = [];
let paused = false;

self.onmessage = (e) => {
    const data = e.data;
    if (data.canvas) {
        canvas = data.canvas;
        ctx = canvas.getContext('2d');
        width = canvas.width = data.width;
        height = canvas.height = data.height;
        initPoints();
        animate();
    }
    if (data.pause !== undefined) {
        paused = data.pause;
    }
};

function initPoints() {
    for (let i = 0; i < numPoints; i++) {
        const r = 2;
        const x = Math.random() * (width - r * 2) + r;
        const y = Math.random() * (height - r * 2) + r;
        const dx = (Math.random() - 0.5) * 1.5;
        const dy = (Math.random() - 0.5) * 1.5;
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
        ctx.fillStyle = 'black';
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
                ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance / maxDistance})`;
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