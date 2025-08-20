let canvas, ctx, width, height, dpr = 1;
let points = [];
let paused = false;

// ==== 스타일(플랫폼 무관, CSS px 기준) ====
const DOT_COLOR = 'rgba(180,200,255,0.8)';
const LINE_COLOR = (a) => `rgba(180,200,255,${a})`;

// 밀도: 100,000 CSS px 당 몇 개의 점
const POINTS_PER_100K_CSSPX = 28;       // ← 체감 밀도 조절 포인트 (일관된 밀도)
const MAX_POINTS_PER_100K = 70;
const MIN_POINTS_PER_100K = 12;

// 연결 범위(가시 거리): CSS px
const LINK_RANGE_CSS = 120;             // ← 연결 거리(기기 동일 체감)

// 속도: CSS px / sec
const BASE_SPEED_CSS = 20;              // ← 속도(기기 동일 체감)

// 내부 상태
let lastTime = 0;

self.onmessage = (e) => {
  const data = e.data;

  if (data.canvas) {
    canvas = data.canvas;
    ctx = canvas.getContext('2d');
    width = canvas.width = data.width;
    height = canvas.height = data.height;
    dpr = data.dpr || (self.devicePixelRatio || 1);

    points = [];
    initPoints();
    lastTime = performance.now();
    animate();
  } else if (data.width && data.height) {
    // 리사이즈
    width = canvas.width = data.width;
    height = canvas.height = data.height;
    dpr = data.dpr || (self.devicePixelRatio || 1);

    points = [];
    initPoints();
  }

  if (data.pause !== undefined) paused = data.pause;
};

// CSS px 기준 면적을 계산해 기기별 동일 밀도 유지
function getNumPoints(deviceW, deviceH) {
  const cssW = deviceW / dpr;
  const cssH = deviceH / dpr;
  const cssArea = cssW * cssH;                 // CSS px^2

  const raw = (cssArea / 100000) * POINTS_PER_100K_CSSPX;
  const minPts = (cssArea / 100000) * MIN_POINTS_PER_100K;
  const maxPts = (cssArea / 100000) * MAX_POINTS_PER_100K;

  return Math.round(Math.max(minPts, Math.min(maxPts, raw)));
}

function initPoints() {
  const numPoints = getNumPoints(width, height);
  points.length = 0;

  const speedPerSecCss = BASE_SPEED_CSS;
  const speedPerFrameDevice = (speedPerSecCss * dpr) / 60; // 초기화 시 참고값

  for (let i = 0; i < numPoints; i++) {
    const rCss = Math.random() * 1.5 + 0.5;         // CSS px
    const r = rCss * dpr;                           // device px

    const x = Math.random() * (width - 2 * r) + r;
    const y = Math.random() * (height - 2 * r) + r;

    // 방향 랜덤, 크기는 CSS 기준 속도 → device px로 변환
    const ang = Math.random() * Math.PI * 2;
    const speed = speedPerFrameDevice;
    const dx = Math.cos(ang) * speed;
    const dy = Math.sin(ang) * speed;

    points.push({ x, y, dx, dy, r });
  }
}

function updatePoints(dtSec) {
  // dtSec: 초 단위(기기마다 동일 속도 체감)
  const speedScale = (BASE_SPEED_CSS * dpr) * dtSec; // device px

  for (const p of points) {
    // 벽 반사
    if (p.x + p.r > width || p.x - p.r < 0) p.dx = -p.dx;
    if (p.y + p.r > height || p.y - p.r < 0) p.dy = -p.dy;

    p.x += (p.dx === 0 && p.dy === 0) ? 0 : (p.dx / Math.hypot(p.dx, p.dy)) * speedScale;
    p.y += (p.dy === 0 && p.dx === 0) ? 0 : (p.dy / Math.hypot(p.dx, p.dy)) * speedScale;

    // 점 그리기 (반지름은 device px)
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = DOT_COLOR;
    ctx.fill();
  }
}

function connectPoints() {
  const maxDistance = LINK_RANGE_CSS * dpr; // 기기 동일 체감 → device px로 변환

  for (let a = 0; a < points.length; a++) {
    const pa = points[a];
    for (let b = a + 1; b < points.length; b++) {
      const pb = points[b];
      const dx = pa.x - pb.x;
      const dy = pa.y - pb.y;
      const dist = Math.hypot(dx, dy);
      if (dist < maxDistance) {
        ctx.beginPath();
        ctx.strokeStyle = LINE_COLOR(1 - dist / maxDistance);
        ctx.lineWidth = 1; // device px 기준: 얇은 선 유지
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }
  }
}

function animate(now = performance.now()) {
  const dtMs = now - lastTime;
  lastTime = now;
  const dtSec = Math.max(0, Math.min(0.05, dtMs / 1000)); // 안정성: 50ms cap

  ctx.clearRect(0, 0, width, height);

  if (!paused) {
    updatePoints(dtSec);
    connectPoints();
  }

  requestAnimationFrame(animate);
}
