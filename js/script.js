document.addEventListener('DOMContentLoaded', () => {
  /*─────────────────────────────
    SECTION 1: LocomotiveScroll & ScrollTrigger
  ─────────────────────────────*/
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

    document.querySelectorAll('.panel').forEach((panel, i, panels) => {
      ScrollTrigger.create({
        trigger: panel,
        scroller: '#smooth-scroll',
        start: 'top top',
        pin: i !== panels.length - 1,
        pinSpacing: false,
        anticipatePin: 1,
      });
    });

    // 네비게이션 클릭 시 스크롤 이동
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const targetID = item.getAttribute('href');
        const panels = [...document.querySelectorAll('.panel')];
        const index = panels.findIndex(panel => `#${panel.id}` === targetID);
        if (index >= 0) locoScroll.scrollTo(index * window.innerHeight, { duration: 800 });
      });
    });

    function activateSideNav(activeIdx) {
      document.querySelectorAll('.side-nav .nav-item')
        .forEach((nav, i) => nav.classList.toggle('active', i === activeIdx));
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

  /*─────────────────────────────
    SECTION 2: Inspiration Page – 이미지 그리드 및 모달
  ─────────────────────────────*/
  const gridContainer = document.querySelector('.inspiration-grid');
  if (gridContainer) {
    const imgPath = '../assets/img/inspirations/';
    fetch(`${imgPath}images.json`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load image list');
        return response.json();
      })
      .then(files => {
        files.forEach(file => {
          const img = document.createElement('img');
          img.src = `${imgPath}${file}`;
          img.alt = 'Inspiration Image';
          img.className = 'inspiration-image';
          const wrapper = document.createElement('div');
          wrapper.className = 'image-container';
          wrapper.appendChild(img);
          gridContainer.appendChild(wrapper);
        });
      })
      .catch(err => console.error('Error loading images:', err));

    // 모달 세팅
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'image-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <img class="modal-image" src="" alt="Full Image">
        <div class="modal-arrow left-arrow">&#10094;</div>
        <div class="modal-arrow right-arrow">&#10095;</div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
    let currentModalIndex = 0;

    function openModal(index) {
      currentModalIndex = index;
      const images = document.querySelectorAll('.inspiration-image');
      if (images[index]) {
        document.querySelector('.modal-image').src = images[index].src;
        modalOverlay.style.display = 'flex';
      }
    }
    function closeModal() {
      modalOverlay.style.display = 'none';
    }
    function showPrevImage() {
      const images = document.querySelectorAll('.inspiration-image');
      currentModalIndex = (currentModalIndex - 1 + images.length) % images.length;
      document.querySelector('.modal-image').src = images[currentModalIndex].src;
    }
    function showNextImage() {
      const images = document.querySelectorAll('.inspiration-image');
      currentModalIndex = (currentModalIndex + 1) % images.length;
      document.querySelector('.modal-image').src = images[currentModalIndex].src;
    }
    gridContainer.addEventListener('click', e => {
      if (e.target.matches('img.inspiration-image')) {
        const images = Array.from(document.querySelectorAll('.inspiration-image'));
        openModal(images.indexOf(e.target));
      }
    });
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    document.querySelector('.left-arrow').addEventListener('click', showPrevImage);
    document.querySelector('.right-arrow').addEventListener('click', showNextImage);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /*─────────────────────────────
    SECTION 3: Timeline Page
  ─────────────────────────────*/
  const timeline = document.querySelector('.timeline-horizontal');
  const panels = document.querySelectorAll('.timeline-container');
  let currentPanel = 10;
  if (timeline && panels.length) {
    let throttleLock = false;
    function animateBranches() {
      const activeContainer = panels[currentPanel];
      if (!activeContainer) return;
      activeContainer.querySelectorAll('.events .event').forEach(ev => {
        ev.querySelectorAll('.branch, .sub-branch').forEach(el => el.remove());
        const branch = document.createElement('div');
        branch.className = 'branch';
        branch.style.setProperty('--branch-x', ((Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30)) + 'px');
        branch.style.setProperty('--branch-y', ((Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 30)) + 'px');
        const month = ev.querySelector('.month');
        if (month) branch.textContent = month.textContent;
        ev.appendChild(branch);

        const subBranch = document.createElement('div');
        subBranch.className = 'sub-branch';
        subBranch.style.setProperty('--subbranch-x', ((Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20)) + 'px');
        subBranch.style.setProperty('--subbranch-y', ((Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20)) + 'px');
        const keywords = ["Innovation", "Design", "Creativity", "Tech", "Inspire"];
        subBranch.textContent = keywords[Math.floor(Math.random() * keywords.length)];
        ev.appendChild(subBranch);
      });
    }
    function updateTimeline() {
      panels.forEach((panel, i) => {
        panel.style.transform = i === currentPanel ? 'scale(1.4)' : 'scale(1)';
        panel.style.opacity = i === currentPanel ? '1' : '0.5';
      });
      const target = panels[currentPanel];
      let targetScroll = target.offsetLeft - (timeline.offsetWidth / 2) + (target.offsetWidth / 2);
      timeline.scrollTo({ left: Math.min(targetScroll, timeline.scrollWidth - timeline.clientWidth), behavior: 'smooth' });
      updateBottomNav();
      animateBranches();
    }
    function updateBottomNav() {
      document.querySelectorAll('.bottom-dots ul li a').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentPanel);
        dot.style.background = i === currentPanel ? (panels[i].style.background || "#fff") : "#fff";
      });
    }
    document.addEventListener('wheel', evt => {
      evt.preventDefault();
      if (throttleLock) return;
      if (evt.deltaY < 0 && currentPanel < panels.length - 1) currentPanel++;
      else if (evt.deltaY > 0 && currentPanel > 0) currentPanel--;
      updateTimeline();
      throttleLock = true;
      setTimeout(() => throttleLock = false, 350);
    });
    updateTimeline();
    const bottomNav = document.querySelector('.bottom-dots ul');
    if (bottomNav) {
      bottomNav.innerHTML = '';
      panels.forEach((panel, i) => {
        const a = document.createElement('a');
        a.href = `#year${i+1}`;
        a.textContent = 'dot';
        if (i === currentPanel) {
          a.classList.add('active');
          a.style.background = panel.style.background || "#fff";
        }
        const li = document.createElement('li');
        li.appendChild(a);
        bottomNav.appendChild(li);
      });
    }
  }

  /*─────────────────────────────
    SECTION 4: Cover Page – Canvas Animation
  ─────────────────────────────*/
  window.addEventListener('load', () => {
    const canvas = document.getElementById('pensilCanvas');
    const cover = document.querySelector('.cover');
    if (!canvas || !cover) return;
    if (canvas.transferControlToOffscreen) {
      const offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker('js/canvas-worker.js');
      worker.postMessage({ canvas: offscreen, width: canvas.clientWidth, height: canvas.clientHeight }, [offscreen]);
      new IntersectionObserver(entries => {
        entries.forEach(entry => worker.postMessage({ pause: entry.intersectionRatio === 0 }));
      }, { threshold: 0 }).observe(cover);
    } else {
      setupCanvasEffect(canvas, cover);
    }
  });
});
