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
// SECTION 2: Inspiration Page 전용 — 4×10 이미지 그리드 생성
//                                                          
// DOMContentLoaded 이벤트 시 .inspiration-grid 존재 확인 후 실행
// ────────────────────────────────────────────────────────────
// Navbar 동적 로드
window.addEventListener('DOMContentLoaded', () => {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    fetch('./components/navbar.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Navbar 로드 실패');
        }
        return response.text();
      })
      .then(data => {
        navbarPlaceholder.innerHTML = data;

        // 메뉴 클릭 시 스크롤 이동 (내부 링크 처리)
        document.querySelectorAll('.top-menu a').forEach(menuItem => {
          menuItem.addEventListener('click', e => {
            const targetID = menuItem.getAttribute('href');
            if (targetID.startsWith('#') && targetID !== "#about") {
              // 오버레이가 아닌 내부 링크는 부드러운 스크롤 실행
              e.preventDefault();
              const targetElement = document.querySelector(targetID);
              if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
              }
            }
          });
        });

        // About 클릭 이벤트 추가 (모든 페이지에서 About 오버레이 활성화)
        const aboutLink = document.querySelector('.top-menu a[href="#about"]');
        const aboutOverlay = document.getElementById('about-overlay');
        const closeAboutButton = document.getElementById('close-about');

        if (aboutLink && aboutOverlay && closeAboutButton) {
          aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutOverlay.classList.add('visible');
          });
          closeAboutButton.addEventListener('click', () => {
            aboutOverlay.classList.remove('visible');
          });
        }
      })
      .catch(err => console.error('Navbar 로드 실패:', err));
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.inspiration-grid');
  if (!grid) return;

  const total     = 4 * 10;                         // 40개
  const imgFolder = '../assets/img/inspirations/';  // 경로 확인

  for (let i = 1; i <= total; i++) {
    const src  = `${imgFolder}img${i}.jpg`;
    const cube = document.createElement('div');
    cube.className = 'cube';

    // 각 면에 동일한 이미지 설정
    ['front', 'top', 'right'].forEach(faceName => {
      const face = document.createElement('div');
      face.className = `face ${faceName}`;
      face.style.backgroundImage = `url(${src})`;
      cube.appendChild(face);
    });

    grid.appendChild(cube);

    // 클릭하면 show-right 클래스 추가 (토글 아님)
    cube.addEventListener('click', () => {
      cube.classList.add('show-right');
    });
    // 커서가 영역에서 벗어나면 앞면으로 복귀
    cube.addEventListener('mouseleave', () => {
      cube.classList.remove('show-right');
    });
  }
});

// About Overlay 동작
document.addEventListener('DOMContentLoaded', () => {
  const aboutLink = document.querySelector('.top-menu a[href="/pages/about.html"]');
  const aboutOverlay = document.getElementById('about-overlay');
  const closeAboutButton = document.getElementById('close-about');

  if (aboutLink && aboutOverlay && closeAboutButton) {
    // About 클릭 시 오버레이 표시
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      aboutOverlay.classList.add('visible');
    });

    // Close 버튼 클릭 시 오버레이 숨기기
    closeAboutButton.addEventListener('click', () => {
      aboutOverlay.classList.remove('visible');
    });
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
