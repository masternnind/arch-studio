// ────────────────────────────────────────────────────────────
// SECTION 1: Index Page 전용 — LocomotiveScroll + ScrollTrigger
//                                                          
// #smooth-scroll 요소가 있을 때만 동작
// ────────────────────────────────────────────────────────────
const scrollContainer = document.querySelector('#smooth-scroll');

if (scrollContainer) {
  // 1. GSAP 및 ScrollTrigger 플러그인 등록
  gsap.registerPlugin(ScrollTrigger);

  // 2. Locomotive Scroll 초기화
  const locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    inertia: 0.5,
  });
  locoScroll.on('scroll', ScrollTrigger.update);

  // 3. ScrollTrigger-scrollerProxy 설정
  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0, left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    },
    pinType: scrollContainer.style.transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.refresh();

  // 4. 각 .panel 을 화면에 핀(pinning) 처리
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

  // 5. 우측 네비(nav-item) 클릭 시 스크롤 이동
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const targetID = item.getAttribute('href');
      const panels = document.querySelectorAll('.panel');
      const panelIndex = [...panels].findIndex(
        panel => `#${panel.id}` === targetID
      );
      locoScroll.scrollTo(panelIndex * window.innerHeight, {
        duration: 800,
      });
    });
  });

  // 6. 사이드 네비 활성화 상태 토글 함수
  function activateNav(idx) {
    document.querySelectorAll('.side-nav .nav-item')
      .forEach((navItem, i) => {
        navItem.classList.toggle('active', i === idx);
      });
  }

  // 7. 스크롤 진입 시 해당 nav-item 하이라이트
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


// ────────────────────────────────────────────────────────────
// SECTION 2: Inspiration Page 전용 — Plain 이미지 그리드 생성
document.addEventListener('DOMContentLoaded', () => {
  const imageFiles = [
    'img1.jpg',
    'img2.jpg',
    'img3.jpg',
    'img4.jpg',
    'img5.jpg',
    'img6.jpg'
    // 추가 이미지 파일(있다면)
  ];
  const total = imageFiles.length; // T
  const imgFolder = '../assets/img/inspirations/';
  const grid = document.querySelector('.inspiration-grid');

  for (let i = 1; i <= total; i++) {
    const src = `${imgFolder}${imageFiles[i - 1]}`;
    const container = document.createElement('div');
    container.className = 'image-container';
    container.style.backgroundImage = `url(${src})`;

    // 오버레이 생성: overlayText_i = "<h2>Image i</h2><p>Image i description</p>"
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `<h1>Image ${i} </h2><p>This is a description for image ${i}.</p>`;
    container.appendChild(overlay);

    grid.appendChild(container);
  }
});

// ────────────────────────────────────────────────────────────
// SECTION 3: Cover Page 전용 — Canvas 애니메이션
//                                                          
// load 이벤트 시 pensilCanvas & .cover 요소 확인 후 실행
// ────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const canvas = document.getElementById('pensilCanvas');
  const coverSection = document.querySelector('.cover');
  if (!canvas || !coverSection) return;

  if (canvas.transferControlToOffscreen) {
    // OffscreenCanvas + Worker 방식
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('js/canvas-worker.js');
    worker.postMessage(
      {
        canvas: offscreen,
        width: canvas.clientWidth,
        height: canvas.clientHeight
      },
      [offscreen]
    );

    // IntersectionObserver 로 pause/resume 제어
    new IntersectionObserver(entries => {
      entries.forEach(entry =>
        worker.postMessage({ pause: entry.intersectionRatio === 0 })
      );
    }, { threshold: 0 }).observe(coverSection);

  } else {
    // 폴리필: setupCanvasEffect 함수 호출
    setupCanvasEffect(canvas, coverSection);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const coverAboutLink = document.querySelector('.cover .about-link');
  const aboutOverlay = document.getElementById('about-overlay');
  const closeAbout = document.getElementById('close-about');
  
  if (coverAboutLink && aboutOverlay && closeAbout) {
    coverAboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      aboutOverlay.classList.add('visible');
    });
    closeAbout.addEventListener('click', (e) => {
      e.preventDefault();
      aboutOverlay.classList.remove('visible');
    });
  } else {
    console.error('About 요소 중 일부를 찾지 못했습니다.');
  }
});

// ※ setupCanvasEffect 함수 정의는 기존 파일 그대로 유지 바랍니다.
