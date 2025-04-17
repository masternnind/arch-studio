// ------------------------------------------------------------
// 1) index.html 에서만 실행할 Locomotive Scroll + ScrollTrigger
// ------------------------------------------------------------
const scrollContainer = document.querySelector('#smooth-scroll');

if (scrollContainer) {
  // GSAP과 ScrollTrigger 등록
  gsap.registerPlugin(ScrollTrigger);

  // Locomotive Scroll 초기화 (inertia: 0.5)
  const locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    inertia: 0.5,
  });
  locoScroll.on('scroll', ScrollTrigger.update);

  // ScrollTrigger 와 연동
  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: scrollContainer.style.transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.refresh();

  // Panel pinning
  document.querySelectorAll('.panel').forEach((panel, index, panels) => {
    ScrollTrigger.create({
      trigger: panel,
      scroller: '#smooth-scroll',
      start: 'top top',
      pin: index !== panels.length - 1,
      pinSpacing: false,
      anticipatePin: 1,
    });
  });

  // Navigation click scroll
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetID = item.getAttribute('href');
      const panels = document.querySelectorAll('.panel');
      const panelIndex = [...panels].findIndex(
        (panel) => `#${panel.id}` === targetID
      );
      locoScroll.scrollTo(panelIndex * window.innerHeight, {
        duration: 800,
      });
    });
  });

  // Function to activate the corresponding nav-item
  function activateNav(idx) {
    document.querySelectorAll('.side-nav .nav-item').forEach((navItem, i) => {
      navItem.classList.toggle('active', i === idx);
    });
  }

  // Highlight on scroll
  document.querySelectorAll('section.panel').forEach((panel, idx) => {
    ScrollTrigger.create({
      trigger: panel,
      scroller: '#smooth-scroll',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activateNav(idx),
      onEnterBack: () => activateNav(idx),
    });
  });
}

// ------------------------------------------------------------
// 2) inspiration.html 에서만 실행할 4×10 이미지 그리드 생성
// ------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.inspiration-grid');
  if (!grid) return; // 그리드 컨테이너가 없으면 종료

  const total = 4 * 10; // 40개
  const imgFolder = '../assets/img/inspiration/'; // 이미지 폴더 경로

  for (let i = 0; i < total; i++) {
    const img = document.createElement('img');
    img.src = `${imgFolder}img${i + 1}.jpg`;
    img.alt = `Inspiration ${i + 1}`;
    grid.appendChild(img);
  }
});

// ------------------------------------------------------------
// 3) cover 페이지용 Canvas 애니메이션 (index.html 전용)
// ------------------------------------------------------------
window.addEventListener('load', () => {
  const canvas = document.getElementById('pensilCanvas');
  const coverSection = document.querySelector('.cover');
  if (!canvas || !coverSection) return;

  if (canvas.transferControlToOffscreen) {
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('js/canvas-worker.js');
    worker.postMessage(
      { canvas: offscreen, width: canvas.clientWidth, height: canvas.clientHeight },
      [offscreen]
    );
    new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) =>
          worker.postMessage({ pause: entry.intersectionRatio === 0 })
        ),
      { threshold: 0 }
    ).observe(coverSection);
  } else {
    setupCanvasEffect(canvas, coverSection);
  }
});

// setupCanvasEffect 함수 정의는 기존과 동일하게 유지하세요.
