// GSAP과 ScrollTrigger 등록
gsap.registerPlugin(ScrollTrigger);

// Locomotive Scroll 초기화
const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#smooth-scroll"),
    smooth: true,
    scrollbar: false, // 커스텀 스크롤바 비활성화
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
    pinType: document.querySelector("#smooth-scroll").style.transform ? "transform" : "fixed",
});
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
ScrollTrigger.refresh();

// Locomotive Scroll 업데이트
window.addEventListener("resize", () => locoScroll.update());

// 패널 고정 설정
document.querySelectorAll(".panel").forEach((panel, index, panels) => {
    ScrollTrigger.create({
        trigger: panel,
        scroller: "#smooth-scroll",
        start: "top top",
        pin: index !== panels.length - 1, // 마지막 패널은 고정하지 않음
        pinSpacing: false,
    });
});

// 네비게이션 업데이트
function updateNav(activePage) {
    document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.getAttribute("data-page") === activePage);
    });
}

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

// 네비게이션 클릭 시 스크롤 이동
document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        const targetID = item.getAttribute("href");
        locoScroll.scrollTo(targetID, { duration: 800 });
    });
});

// GSAP 애니메이션 (커버 페이지)
gsap.to(".cover .content", {
    scale: window.innerWidth < 768 ? 0.8 : 1, // 작은 화면에서는 축소
    duration: 1,
    ease: "power2.out",
});

// -----------------------------------------------------------------------------
// 캔버스 효과: 점 연결 애니메이션
// -----------------------------------------------------------------------------

function setupCanvasEffect(canvas, coverSection) {
    const ctx = canvas.getContext("2d");
    let width, height, paused = false;

    function resizeCanvas() {
        width = canvas.width = coverSection.offsetWidth;
        height = canvas.height = coverSection.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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

    const points = Array.from({ length: 800 }, () => {
        const r = 2;
        const x = Math.random() * (width - r * 2) + r;
        const y = Math.random() * (height - r * 2) + r;
        const dx = (Math.random() - 0.5) * 1.5;
        const dy = (Math.random() - 0.5) * 1.5;
        return new Point(x, y, dx, dy, r);
    });

    function connectPoints() {
        const maxDistance = 90;
        points.forEach((p1, a) => {
            points.slice(a + 1).forEach(p2 => {
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

// 캔버스 초기화
window.addEventListener("load", () => {
    const canvas = document.getElementById("pensilCanvas");
    const coverSection = document.querySelector(".cover");

    if (canvas && coverSection) {
        setupCanvasEffect(canvas, coverSection);
    }
});
