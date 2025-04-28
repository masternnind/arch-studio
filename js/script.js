document.addEventListener('DOMContentLoaded', () => {
  /*──────────────────────────────────────────────
    SECTION 1: LocomotiveScroll + ScrollTrigger (Index/Contacts)
  ───────────────────────────────────────────────*/
  const scrollContainer = document.querySelector('#smooth-scroll');
  if (scrollContainer) {
    gsap.registerPlugin(ScrollTrigger);
  
    const locoScroll = new LocomotiveScroll({
      el: scrollContainer,
      smooth: true,
      inertia: 0.5,
    });
  
    // Update ScrollTrigger on each scroll event
    locoScroll.on('scroll', ScrollTrigger.update);
  
    // Scroller proxy for ScrollTrigger
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
          height: window.innerHeight
        };
      },
      pinType: scrollContainer.style.transform ? 'transform' : 'fixed',
    });
  
    ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
    ScrollTrigger.refresh();
  
    // Create ScrollTriggers for panels (pin all except the last)
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
  
    // 우측 네비게이션 (click) – 패널 인덱스에 따라 스크롤 이동
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const targetID = item.getAttribute('href');
        const panels = document.querySelectorAll('.panel');
        const panelIndex = [...panels].findIndex(panel => `#${panel.id}` === targetID);
        if (panelIndex !== -1) {
          locoScroll.scrollTo(panelIndex * window.innerHeight, { duration: 800 });
        }
      });
    });
  
    // 사이드 네비게이션 활성화: 스크롤 위치에 따라 active 클래스 토글
    function activateSideNav(activeIdx) {
      document.querySelectorAll('.side-nav .nav-item')
        .forEach((navItem, i) => navItem.classList.toggle('active', i === activeIdx));
    }
  
    document.querySelectorAll('section.panel').forEach((panel, idx) => {
      ScrollTrigger.create({
        trigger: panel,
        scroller: '#smooth-scroll',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => activateSideNav(idx),
        onEnterBack: () => activateSideNav(idx),
      });
    });
  }
  
  /*──────────────────────────────────────────────
    SECTION 2: Inspiration Page — 이미지 그리드 생성
  ───────────────────────────────────────────────*/
  const gridContainer = document.querySelector('.inspiration-grid');
  if (gridContainer) {
    const imgPath = '../assets/img/inspirations/';
    const jsonPath = `${imgPath}images.json`;

    // JSON 파일에서 이미지 파일 목록 가져오기
    fetch(jsonPath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load image list');
        }
        return response.json();
      })
      .then(imageFiles => {
        imageFiles.forEach(file => {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'image-container';

          // Lazy Loading을 위한 data-src 속성 추가
          const img = document.createElement('img');
          img.dataset.src = `${imgPath}${file}`;
          img.alt = 'Inspiration Image';
          img.className = 'lazy-image';

          const overlay = document.createElement('div');
          overlay.className = 'overlay';

          imgDiv.appendChild(img);
          imgDiv.appendChild(overlay);
          gridContainer.appendChild(imgDiv);
        });

        // Lazy Loading 활성화
        lazyLoadImages();
      })
      .catch(error => console.error('Error loading images:', error));
  }

  // Lazy Loading 함수
  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src'); // 실제 이미지 로드
          img.onload = () => img.classList.add('loaded'); // 로드 후 효과 추가
          obs.unobserve(img); // 관찰 중지
        }
      });
    }, { threshold: 0.1 });

    lazyImages.forEach(img => observer.observe(img));
  }
  
  /*──────────────────────────────────────────────
    SECTION 3: Timeline Page (FOOTPRINTS) — 줌 효과 및 하단 점 네비게이션
  ───────────────────────────────────────────────*/
  const timeline = document.querySelector('.timeline-horizontal');
  const timelinePanels = document.querySelectorAll('.timeline-container');
  let currentPanel = 10; // 초기 활성 인덱스
  const containers = document.querySelectorAll('.timeline-container');
  
  if (timeline && timelinePanels.length) {
    let throttleLock = false;
  
    function animateBranchesForActiveContainer() {
      const activeContainer = containers[currentPanel];
      if (!activeContainer) return;
      
      // 활성 컨테이너 내 모든 이벤트 요소 순회
      const eventNodes = activeContainer.querySelectorAll('.events .event');
      eventNodes.forEach(eventEl => {
        // 기존 가지 요소 제거 (이미 있다면)
        eventEl.querySelectorAll('.branch, .sub-branch').forEach(el => el.remove());
        
        // 1단계: 메인 가지 생성
        const mainBranch = document.createElement('div');
        mainBranch.className = 'branch';
        // 랜덤 오프셋 (예시: ±20~50px 범위 내)
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
        const offsetY = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
        mainBranch.style.setProperty('--branch-x', offsetX + 'px');
        mainBranch.style.setProperty('--branch-y', offsetY + 'px');
        
        // 메인 가지 말단에는 해당 이벤트의 월(label)을 표시
        const monthLabel = eventEl.querySelector('.month');
        if (monthLabel) {
          mainBranch.textContent = monthLabel.textContent;
        }
        eventEl.appendChild(mainBranch);
        
        // 2단계: 서브 가지 생성
        const subBranch = document.createElement('div');
        subBranch.className = 'sub-branch';
        // 랜덤 오프셋 (예시: ±10~30px 범위 내)
        const subOffsetX = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20);
        const subOffsetY = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20);
        subBranch.style.setProperty('--subbranch-x', subOffsetX + 'px');
        subBranch.style.setProperty('--subbranch-y', subOffsetY + 'px');
        
        // 키워드 목록에서 무작위로 선택 (중요 이벤트 키워드)
        const keywords = ["Innovation", "Design", "Creativity", "Tech", "Inspire"];
        subBranch.textContent = keywords[Math.floor(Math.random() * keywords.length)];
        
        eventEl.appendChild(subBranch);
      });
    }
  
    function updateTimeline() {
      timelinePanels.forEach((panel, i) => {
        if (i === currentPanel) {
          panel.style.transform = 'scale(1.4)';
          panel.style.opacity = '1';
        } else {
          panel.style.transform = 'scale(1)';
          panel.style.opacity = '0.5';
        }
      });
  
      // 중앙 정렬 스크롤 계산 (최대 스크롤 보정 포함)
      const targetPanel = timelinePanels[currentPanel];
      let targetScroll = targetPanel.offsetLeft - (timeline.offsetWidth / 2) + (targetPanel.offsetWidth / 2);
      const maxScroll = timeline.scrollWidth - timeline.clientWidth;
      if (targetScroll > maxScroll) targetScroll = maxScroll;
      timeline.scrollTo({ left: targetScroll, behavior: 'smooth' });
      updateBottomNavigation();
      animateBranchesForActiveContainer();
    }
  
    function updateBottomNavigation() {
      const navDots = document.querySelectorAll('.bottom-dots ul li a');
      navDots.forEach((dot, i) => {
        if (i === currentPanel) {
          const bgColor = timelinePanels[i].style.background;
          dot.classList.add('active');
          dot.style.background = bgColor || "#fff";
        } else {
          dot.classList.remove('active');
          dot.style.background = "#fff";
        }
      });
    }
  
    // Wheel 이벤트로 현재 패널 변경 (Throttle 적용)
    document.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      if (throttleLock) return;
      // 스크롤 위(δY < 0) → 오른쪽(다음 패널)
      if (evt.deltaY < 0 && currentPanel < timelinePanels.length - 1) {
        currentPanel++;
      // 스크롤 아래(δY > 0) → 왼쪽(이전 패널)
      } else if (evt.deltaY > 0 && currentPanel > 0) {
        currentPanel--;
      }
      updateTimeline();
      throttleLock = true;
      setTimeout(() => { throttleLock = false; }, 350);
    });
  
    updateTimeline();
  
    // 동적 하단 점 네비게이션 생성 및 기본/active 색상 설정
    const bottomNav = document.querySelector('.bottom-dots ul');
    if (bottomNav) {
      bottomNav.innerHTML = '';
      timelinePanels.forEach((panel, i) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#year${i + 1}`;
        a.textContent = "dot"; // 기본적으로 CSS로 텍스트 숨김 처리
        // active 초기 색상: 패널 인라인 background가 설정된 경우 적용
        if (i === currentPanel) {
          a.classList.add('active');
          a.style.background = panel.style.background || "#fff";
        } else {
          a.style.background = "#fff";
        }
        li.appendChild(a);
        bottomNav.appendChild(li);
      });
    }
  }
});

/*──────────────────────────────────────────────
  SECTION 4: Cover Page — Canvas 애니메이션
──────────────────────────────────────────────*/
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

    new IntersectionObserver(entries => {
      entries.forEach(entry => worker.postMessage({ pause: entry.intersectionRatio === 0 }));
    }, { threshold: 0 }).observe(coverSection);
  } else {
    // 폴리필: setupCanvasEffect 함수는 기존 코드 유지
    setupCanvasEffect(canvas, coverSection);
  }
});

document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.onload = () => img.classList.add('loaded');
                obs.unobserve(img);
            }
        });
    }, { threshold: 0.1 });

    lazyImages.forEach(img => {
        observer.observe(img);
    });
});

// Debounce 함수: 이벤트 빈도 줄여 성능 최적화
function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}
