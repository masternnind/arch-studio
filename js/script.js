document.addEventListener('DOMContentLoaded', () => {
  /* SECTION 1: LocomotiveScroll + ScrollTrigger */
  const scrollContainer = document.querySelector('#smooth-scroll');
  if (scrollContainer) {
    gsap.registerPlugin(ScrollTrigger);
    const locoScroll = new LocomotiveScroll({
      el: scrollContainer,
      smooth: true,
      inertia: 0.5,
    });
    locoScroll.on('scroll', ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(scrollContainer, {
      scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: scrollContainer.style.transform ? 'transform' : 'fixed',
    });
    ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
    ScrollTrigger.refresh();
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
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const targetID = item.getAttribute('href');
        const panels = document.querySelectorAll('.panel');
        const panelIndex = [...panels].findIndex(panel => '#' + panel.id === targetID);
        if (panelIndex !== -1) {
          locoScroll.scrollTo(panelIndex * window.innerHeight, { duration: 800 });
        }
      });
    });
    const activateSideNav = activeIdx => {
      document.querySelectorAll('.side-nav .nav-item')
        .forEach((navItem, i) => navItem.classList.toggle('active', i === activeIdx));
    };
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

  /* SECTION 2: Inspiration Page — 이미지 그리드 & Lazy Loading */
  const gridContainer = document.querySelector('.inspiration-grid');
  if (gridContainer) {
    const imgPath = '../assets/img/inspirations/';
    const jsonPath = `${imgPath}images.json`;
    fetch(jsonPath)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load image list');
        return response.json();
      })
      .then(imageFiles => {
        imageFiles.forEach(file => {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'image-container';
          const img = document.createElement('img');
          const fullPath = `${imgPath}${file}`;
          // src와 data-src 모두 설정
          img.src = fullPath;
          img.dataset.src = fullPath;
          img.alt = 'Inspiration Image';
          img.className = 'lazy-image';
          const overlay = document.createElement('div');
          overlay.className = 'overlay';
          imgDiv.appendChild(img);
          imgDiv.appendChild(overlay);
          gridContainer.appendChild(imgDiv);
        });
        lazyLoadImages();
      })
      .catch(error => console.error('Error loading images:', error));
  }

  // 고해상도 이미지를 다운스케일하여 Blob URL로 반환하는 함수
  function downscaleImage(imgElement, maxWidth, maxHeight, quality, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let { naturalWidth: width, naturalHeight: height } = imgElement;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(imgElement, 0, 0, width, height);
    canvas.toBlob(blob => {
      callback(URL.createObjectURL(blob));
    }, 'image/jpeg', quality);
  }

  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const tempImg = new Image();
          // 필요시 CORS 설정 (서버 환경에 따라)
          tempImg.crossOrigin = "anonymous";
          tempImg.src = img.dataset.src;
          tempImg.onload = () => {
            // 다운스케일할 최대 크기와 품질을 지정 (예: 800×600, 품질 0.7)
            downscaleImage(tempImg, 800, 600, 0.7, downscaledUrl => {
              img.src = downscaledUrl;
              img.onload = () => img.classList.add('loaded');
            });
          };
          obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => observer.observe(img));
  }

  // 모달 기능 구현: DOMContentLoaded 내, lazy load 코드 이후에 추가
  const lazyImages = Array.from(document.querySelectorAll('.image-container img'));
  const imageUrls = lazyImages.map(img => img.dataset.src);
  let currentModalIndex = 0;
  
  // 모달 오버레이 생성
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'image-modal-overlay';
  modalOverlay.style.display = 'none';
  modalOverlay.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <img class="modal-image" src="" alt="Full Image">
      <div class="modal-arrow left-arrow">&#10094;</div>
      <div class="modal-arrow right-arrow">&#10095;</div>
    </div>
  `;
  document.body.appendChild(modalOverlay);
  
  // 모달 열기 함수
  function openModal(index) {
    currentModalIndex = index;
    // lazyImages 배열 대신, 현재 보여지는 이미지의 src를 직접 사용
    const currentImg = document.querySelectorAll('.image-container img')[index];
    const modalImg = document.querySelector('.modal-image');
    modalImg.src = currentImg.src;  
    modalOverlay.style.display = 'flex';
  }
  
  // 모달 닫기 함수
  function closeModal() {
    modalOverlay.style.display = 'none';
  }
  
  // 좌우 화살표를 통한 이미지 이동 함수
  function showPrevImage() {
    currentModalIndex = (currentModalIndex - 1 + imageUrls.length) % imageUrls.length;
    document.querySelector('.modal-image').src = imageUrls[currentModalIndex];
  }
  function showNextImage() {
    currentModalIndex = (currentModalIndex + 1) % imageUrls.length;
    document.querySelector('.modal-image').src = imageUrls[currentModalIndex];
  }
  
  // 이벤트 리스너 부착
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.querySelector('.left-arrow').addEventListener('click', showPrevImage);
  document.querySelector('.right-arrow').addEventListener('click', showNextImage);
  
  // lazyImages 각각에 클릭 이벤트 추가 (모달 열기)
  lazyImages.forEach((img, index) => {
    img.addEventListener('click', () => {
      openModal(index);
    });
  });

  // 이미지 그리드 클릭 이벤트 추가
  document.querySelector('.inspiration-grid').addEventListener('click', (event) => {
    // 클릭 대상이 이미지라면
    if (event.target && event.target.matches('img.lazy-image')) {
      // 이미지 인덱스 찾기
      const lazyImages = Array.from(document.querySelectorAll('.image-container img'));
      const index = lazyImages.indexOf(event.target);
      if (index >= 0) {
        openModal(index);
      }
    }
  });

  // ESC 키를 눌렀을 때 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  /* SECTION 3: Timeline Page (FOOTPRINTS) */
  const timeline = document.querySelector('.timeline-horizontal');
  const timelinePanels = document.querySelectorAll('.timeline-container');
  let currentPanel = 10; // 초기 활성 인덱스
  const containers = document.querySelectorAll('.timeline-container');
  if (timeline && timelinePanels.length) {
    let throttleLock = false;
    function animateBranchesForActiveContainer() {
      const activeContainer = containers[currentPanel];
      if (!activeContainer) return;
      
      // 각 이벤트 노드에 기존 branch 제거 후 새로 생성
      const eventNodes = activeContainer.querySelectorAll('.events .event');
      eventNodes.forEach(eventEl => {
        eventEl.querySelectorAll('.branch, .sub-branch').forEach(el => el.remove());
        const mainBranch = document.createElement('div');
        mainBranch.className = 'branch';
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
        const offsetY = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30);
        mainBranch.style.setProperty('--branch-x', offsetX + 'px');
        mainBranch.style.setProperty('--branch-y', offsetY + 'px');
        const monthLabel = eventEl.querySelector('.month');
        if (monthLabel) mainBranch.textContent = monthLabel.textContent;
        eventEl.appendChild(mainBranch);
        
        const subBranch = document.createElement('div');
        subBranch.className = 'sub-branch';
        const subOffsetX = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20);
        const subOffsetY = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20);
        subBranch.style.setProperty('--subbranch-x', subOffsetX + 'px');
        subBranch.style.setProperty('--subbranch-y', subOffsetY + 'px');
        const keywords = ["Innovation", "Design", "Creativity", "Tech", "Inspire"];
        subBranch.textContent = keywords[Math.floor(Math.random() * keywords.length)];
        eventEl.appendChild(subBranch);
      });
    }
  
    function updateTimeline() {
      timelinePanels.forEach((panel, i) => {
        panel.style.transform = i === currentPanel ? 'scale(1.4)' : 'scale(1)';
        panel.style.opacity = i === currentPanel ? '1' : '0.5';
      });
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
          dot.classList.add('active');
          dot.style.background = timelinePanels[i].style.background || "#fff";
        } else {
          dot.classList.remove('active');
          dot.style.background = "#fff";
        }
      });
    }
  
    document.addEventListener('wheel', (evt) => {
      evt.preventDefault();
      if (throttleLock) return;
      currentPanel = evt.deltaY < 0 && currentPanel < timelinePanels.length - 1 ? currentPanel + 1 :
                     evt.deltaY > 0 && currentPanel > 0 ? currentPanel - 1 : currentPanel;
      updateTimeline();
      throttleLock = true;
      setTimeout(() => { throttleLock = false; }, 350);
    });
  
    updateTimeline();
  
    const bottomNav = document.querySelector('.bottom-dots ul');
    if (bottomNav) {
      bottomNav.innerHTML = '';
      timelinePanels.forEach((panel, i) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#year${i + 1}`;
        a.textContent = "dot";
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

  /* SECTION 4: Cover Page — Canvas Animation */
  window.addEventListener('load', () => {
    const canvas = document.getElementById('pensilCanvas');
    const coverSection = document.querySelector('.cover');
    if (!canvas || !coverSection) return;
    
    if (canvas.transferControlToOffscreen) {
      const offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker('js/canvas-worker.js');
      worker.postMessage({ canvas: offscreen, width: canvas.clientWidth, height: canvas.clientHeight }, [offscreen]);
      new IntersectionObserver(entries => {
        entries.forEach(entry => worker.postMessage({ pause: entry.intersectionRatio === 0 }));
      }, { threshold: 0 }).observe(coverSection);
    } else {
      setupCanvasEffect(canvas, coverSection);
    }
  });
  
  // Lazy Load & Pop-In Animation Setup
  document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const loadLazyImage = img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.onload = () => img.classList.add('loaded');
      }
    };
    const lazyLoadHandler = () => {
      lazyImages.forEach(img => {
        if(img.getBoundingClientRect().top < window.innerHeight + 100) loadLazyImage(img);
      });
    };
    lazyLoadHandler();
    window.addEventListener('scroll', debounce(lazyLoadHandler, 200));
    
    const popInElements = document.querySelectorAll('.inspiration-page .content h1, .inspiration-page .content p');
    popInElements.forEach(el => {
      const observer = new IntersectionObserver((entries, obsInstance) => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            entry.target.style.animation = 'popIn 0.5s forwards';
            obsInstance.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      observer.observe(el);
    });
  });
});

// Debounce Utility
function debounce(func, wait) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), wait);
  };
}
