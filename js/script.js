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
          img.dataset.src = `${imgPath}${file}`;
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

  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll('.lazy-image');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => img.classList.add('loaded');
          obs.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => observer.observe(img));
  }

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
