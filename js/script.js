// GSAP과 ScrollTrigger 등록
gsap.registerPlugin(ScrollTrigger);

// Locomotive Scroll 초기화 (inertia: 0.5)
const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#smooth-scroll"),
    smooth: true,
    inertia: 0.5,
});
locoScroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy("#smooth-scroll", {
    scrollTop(value) {
        return arguments.length 
            ? locoScroll.scrollTo(value, 0, 0)
            : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: document.querySelector("#smooth-scroll").style.transform ? "transform" : "fixed"
});
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
ScrollTrigger.refresh();

// 기존 패널 애니메이션 (패널 고정 및 이미지 줌)
gsap.utils.toArray('.panel').forEach((panel, index, panelsArr) => {
    // 마지막 패널은 pin 효과 없이 스크롤하도록 처리
    ScrollTrigger.create({
        trigger: panel,
        scroller: "#smooth-scroll",
        start: "top top",
        pin: index !== panelsArr.length - 1,
        pinSpacing: false,
        anticipatePin: 1
    });
});

// 네비게이션 막대 클릭 시 해당 섹션으로 이동 (페이지 이미지가 전체화면으로 보이도록)
const panels = document.querySelectorAll('.panel');
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach((item) => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const targetID = this.getAttribute('href');
        const targetEl = document.querySelector(targetID);
        if (!targetEl) return;
        // panels 배열에서 targetEl의 인덱스 계산 (각 패널이 100vh라고 가정)
        const panelIndex = Array.from(panels).findIndex(panel => `#${panel.id}` === targetID);
        // 계산된 인덱스에 따라 스크롤할 위치 결정
        const targetPosition = panelIndex * window.innerHeight;
        locoScroll.scrollTo(targetPosition, { duration: 800 });
    });
});

// -----------------------------------------------------------------------------
// 캔버스 효과: cover page(pensilCanvas)에서 점들을 연결하는 애니메이션 효과
// -----------------------------------------------------------------------------

// DOMContentLoaded 혹은 window load 이후에 캔버스 코드를 실행하여 요소들이 로드된 후 작업하도록 함
window.addEventListener('load', () => {
    const canvas = document.getElementById('pensilCanvas');
    if (canvas.transferControlToOffscreen) {
        const offscreen = canvas.transferControlToOffscreen();
        const worker = new Worker('js/canvas-worker.js');
        worker.postMessage({ canvas: offscreen, width: canvas.clientWidth, height: canvas.clientHeight }, [offscreen]);
    } else {
        // 브라우저에서 OffscreenCanvas를 지원하지 않을 경우 기존 코드 실행
        const ctx = canvas.getContext('2d');
        const coverSection = document.querySelector('.cover');
        let width, height;
        
        function resizeCanvas() {
            width = canvas.width = coverSection.offsetWidth;
            height = canvas.height = coverSection.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Point {
            constructor(x, y, dx, dy, r) {
                this.x = x; this.y = y;
                this.dx = dx; this.dy = dy;
                this.r = r;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
                ctx.fillStyle = 'black';
                ctx.fill();
            }
            update() {
                if (this.x + this.r > width || this.x - this.r < 0) this.dx = -this.dx;
                if (this.y + this.r > height || this.y - this.r < 0) this.dy = -this.dy;
                this.x += this.dx;
                this.y += this.dy;
                this.draw();
            }
        }

        const points = [];
        const numPoints = 999;
        for (let i = 0; i < numPoints; i++) {
            const r = 2;
            const x = Math.random() * (width - r * 2) + r;
            const y = Math.random() * (height - r * 2) + r;
            const dx = (Math.random() - 0.5) * 1.5;
            const dy = (Math.random() - 0.5) * 1.5;
            points.push(new Point(x, y, dx, dy, r));
        }

        function connectPoints() {
            const maxDistance = 90;
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

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);
            points.forEach(p => p.update());
            connectPoints();
            requestAnimationFrame(animateCanvas);
        }
        animateCanvas();
    }
});
