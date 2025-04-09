gsap.registerPlugin(ScrollTrigger);
document.addEventListener("keydown", function(e) {
  const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (arrowKeys.includes(e.key)) {
    e.preventDefault();
    // e.stopPropagation();       // 제거
    // e.stopImmediatePropagation(); // 제거
  }
}, { capture: true, passive: false });

// Locomotive Scroll 초기화 (inertia: 0.6)
const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#smooth-scroll"),
  smooth: true,
  inertia: 0.6,
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
    // 홈 버튼인 경우 (첫 번째 섹션) 스크롤을 0으로 지정
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

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("pacmanCanvas");
  const ctx = canvas.getContext("2d");
  
  // 캔버스를 고해상도로 설정하는 함수
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
  }
  
  // 최초 로드 시 캔버스 크기 설정
  resizeCanvas();
  
  // 브라우저 창 크기가 변경될 때마다 캔버스 크기 업데이트
  window.addEventListener("resize", resizeCanvas);
  const pacman = {
    x: 500,
    y: 500,
    size: 15,
    speed: 3,
    angle: 0.2,
    direction: "random",
  };

  // Pac-Man의 초기 위치를 저장 (ESC를 누를 때 이 위치로 돌아감)
  const pacmanInitial = { x: pacman.x, y: pacman.y, direction: pacman.direction };

 // 랜덤 닷 생성 함수 (개수와 위치 랜덤)
function createRandomDots(count) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    });
  }
  return dots;
}

// 최초 실행 시 랜덤으로 닷 생성 (예시: 50개 생성)
let dots = createRandomDots(50);

  function drawPacman() {
    ctx.beginPath();
    const startAngle = pacman.direction === "right" ? pacman.angle : Math.PI + pacman.angle;
    const endAngle = pacman.direction === "right" ? 2 * Math.PI - pacman.angle : Math.PI - pacman.angle;
    ctx.arc(pacman.x, pacman.y, pacman.size, startAngle, endAngle);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
  }

  function drawDots() {
    dots.forEach(dot => {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.closePath();
    });
  }

  function movePacman() {
    if (pacman.direction === "right") pacman.x += pacman.speed;
    if (pacman.direction === "left") pacman.x -= pacman.speed;
    if (pacman.direction === "up") pacman.y -= pacman.speed;
    if (pacman.direction === "down") pacman.y += pacman.speed;

    // Wrap around the canvas
    if (pacman.x > canvas.width) pacman.x = 0;
    if (pacman.x < 0) pacman.x = canvas.width;
    if (pacman.y > canvas.height) pacman.y = 0;
    if (pacman.y < 0) pacman.y = canvas.height;
  }

  function checkCollision() {
    for (let i = dots.length - 1; i >= 0; i--) {
      const dot = dots[i];
      const dist = Math.hypot(pacman.x - dot.x, pacman.y - dot.y);
      if (dist < pacman.size) {
        dots.splice(i, 1); // Remove the dot
      }
    }
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    drawPacman();
    movePacman();
    checkCollision();
    requestAnimationFrame(update);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "d") pacman.direction = "right";
    if (e.key === "a") pacman.direction = "left";
    if (e.key === "w") pacman.direction = "up";
    if (e.key === "s") pacman.direction = "down";

    // ESC 키를 누르면 Pac-Man 초기 위치로 복귀
    if (e.key === "Escape") {
      pacman.x = pacmanInitial.x;
      pacman.y = pacmanInitial.y;
      pacman.direction = pacmanInitial.direction;

      // 랜덤 닷 다시 생성 (예시: 50개)
      dots = createRandomDots(50);
    }
  });
  
  update();
});
