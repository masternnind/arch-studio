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
const panels = gsap.utils.toArray('.panel');

panels.forEach((panel) => {
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
    gsap.fromTo(
      image,
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
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const targetID = this.getAttribute('href');
    if (targetID === "#page1") {
      locoScroll.scrollTo(0, { duration: 800 });
    } else {
      const targetEl = document.querySelector(targetID);
      if (targetEl) {
        locoScroll.scrollTo(targetEl, { duration: 800 });
      }
    }
  });
});

// -----------------------------------------------------------------------------
// 캔버스 효과: cover page(pensilCanvas)에서 점들을 연결하는 애니메이션 효과
// -----------------------------------------------------------------------------

// DOMContentLoaded 혹은 window load 이후에 캔버스 코드를 실행하여 요소들이 로드된 후 작업하도록 함
window.addEventListener('load', () => {
  const canvas = document.getElementById('pensilCanvas');
  if (!canvas) return; // 캔버스 요소가 없으면 중단
  const ctx = canvas.getContext('2d');

  // cover 섹션 요소를 부모로 선택 (캔버스가 채워질 영역)
  const coverSection = document.querySelector('.cover');
  let width, height;
  
  // 캔버스 리사이즈 함수: cover 섹션의 크기에 맞게 캔버스 크기를 지정
  function resizeCanvas() {
    width = canvas.width = coverSection.offsetWidth;
    height = canvas.height = coverSection.offsetHeight;
  }
  // 초기화 및 창 크기 조정 시 재설정
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // 점 객체 정의
  class Point {
    constructor(x, y, dx, dy, radius) {
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.radius = radius;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fillStyle = '#black'; // 점 색상
      ctx.fill();
    }

    update() {
      // 경계에 부딪힐 경우 방향 전환
      if (this.x + this.radius > width || this.x - this.radius < 0) {
        this.dx = -this.dx;
      }
      if (this.y + this.radius > height || this.y - this.radius < 0) {
        this.dy = -this.dy;
      }
      this.x += this.dx;
      this.y += this.dy;
      this.draw();
    }
  }

  // 점 배열 생성 및 초기화
  const points = [];
  const numPoints = 100;  // 원하는 점 개수로 조정 가능

  for (let i = 0; i < numPoints; i++) {
    const radius = 2;
    const x = Math.random() * (width - radius * 2) + radius;
    const y = Math.random() * (height - radius * 2) + radius;
    const dx = (Math.random() - 0.5) * 1.5;
    const dy = (Math.random() - 0.5) * 1.5;
    points.push(new Point(x, y, dx, dy, radius));
  }

  // 인접한 점들을 선으로 연결하는 함수
  function connectPoints() {
    const maxDistance = 100; // 점들을 연결할 최대 거리
    for (let a = 0; a < points.length; a++) {
      for (let b = a + 1; b < points.length; b++) {
        const dx = points[a].x - points[b].x;
        const dy = points[a].y - points[b].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < maxDistance) {
          ctx.beginPath();
          ctx.strokeStyle = `black, ${1 - distance / maxDistance})`;
          ctx.lineWidth = 1;
          ctx.moveTo(points[a].x, points[a].y);
          ctx.lineTo(points[b].x, points[b].y);
          ctx.stroke();
        }
      }
    }
  }

  // 캔버스 애니메이션 루프
  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);  // 캔버스 초기화
    points.forEach(point => point.update());  // 각 점 업데이트 및 그리기
    connectPoints();  // 인접 점들 연결
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();
});
