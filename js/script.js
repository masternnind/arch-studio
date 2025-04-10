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
gsap.utils.toArray('.panel').forEach(panel => {
    ScrollTrigger.create({
        trigger: panel,
        scroller: "#smooth-scroll",
        start: "top top",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1
    });
    const image = panel.querySelector('img');
    if (image) {
        gsap.fromTo(image,
            { scale: 1 },
            {
                scale: 1.3,
                ease: "none",
                scrollTrigger: {
                    trigger: panel,
                    scroller: "#smooth-scroll",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            }
        );
    }
});

// 네비게이션 막대 클릭 시 해당 섹션으로 이동
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        const targetID = this.getAttribute('href');
        if (targetID === "#page1") {
            locoScroll.scrollTo(0, { duration: 800 });
        } else {
            const targetEl = document.querySelector(targetID);
            if (targetEl) locoScroll.scrollTo(targetEl, { duration: 800 });
        }
    });
});

// -----------------------------------------------------------------------------
// 캔버스 효과: cover page(pensilCanvas)에서 점들을 연결하는 애니메이션 효과
// -----------------------------------------------------------------------------

// DOMContentLoaded 혹은 window load 이후에 캔버스 코드를 실행하여 요소들이 로드된 후 작업하도록 함
window.addEventListener('load', () => {
    const canvas = document.getElementById('pensilCanvas');
    if (!canvas) return;
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
    const numPoints = 800;
    for (let i = 0; i < numPoints; i++) {
        const r = 2;
        const x = Math.random() * (width - r * 2) + r;
        const y = Math.random() * (height - r * 2) + r;
        const dx = (Math.random() - 0.5) * 1.5;
        const dy = (Math.random() - 0.5) * 1.5;
        points.push(new Point(x, y, dx, dy, r));
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

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);
        points.forEach(p => p.update());
        connectPoints();
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
});
