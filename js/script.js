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

// Panel pinning
document.querySelectorAll('.panel').forEach((panel, index, panels) => {
    ScrollTrigger.create({
        trigger: panel,
        scroller: "#smooth-scroll",
        start: "top top",
        pin: index !== panels.length - 1,
        pinSpacing: false,
        anticipatePin: 1
    });
});

// Navigation click scroll
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        const targetID = item.getAttribute('href');
        const panels = document.querySelectorAll('.panel');
        const panelIndex = [...panels].findIndex(panel => `#${panel.id}` === targetID);
        locoScroll.scrollTo(panelIndex * window.innerHeight, { duration: 800 });
    });
});

// 페이지 위치에 따라 네비게이션 업데이트
document.querySelectorAll(".panel").forEach((panel) => {
    ScrollTrigger.create({
        trigger: panel,
        scroller: "#smooth-scroll",
        start: "top center",
        end: "bottom center",
        onEnter: () => updateNav(panel.id),
        onEnterBack: () => updateNav(panel.id),
    });
});


// -----------------------------------------------------------------------------
// 캔버스 효과: cover page(pensilCanvas)에서 점들을 연결하는 애니메이션 효과
// -----------------------------------------------------------------------------

function setupCanvasEffect(canvas, coverSection) {
    const ctx = canvas.getContext('2d');
    let width, height, paused = false;
    
    function resizeCanvas() {
        width = canvas.width = coverSection.offsetWidth;
        height = canvas.height = coverSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => (paused = entry.intersectionRatio === 0));
    }, { threshold: 0 });
    observer.observe(coverSection);

    class Point {
        constructor(x, y, dx, dy, r) {
            this.x = x; this.y = y;
            this.dx = dx; this.dy = dy;
            this.r = r;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
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
    for (let i = 0; i < 800; i++) {
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
        if (!paused) {
            points.forEach(p => p.update());
            connectPoints();
        }
        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('pensilCanvas');
    const coverSection = document.querySelector('.cover');

    if (canvas && coverSection) {
        if (canvas.transferControlToOffscreen) {
            const offscreen = canvas.transferControlToOffscreen();
            const worker = new Worker('js/canvas-worker.js');
            worker.postMessage({ canvas: offscreen, width: canvas.clientWidth, height: canvas.clientHeight }, [offscreen]);
            
            new IntersectionObserver(entries => {
                entries.forEach(entry =>
                    worker.postMessage({ pause: entry.intersectionRatio === 0 })
                );
            }, { threshold: 0 }).observe(coverSection);
        } else {
            setupCanvasEffect(canvas, coverSection);
        }
    }
});
