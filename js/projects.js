document.addEventListener('DOMContentLoaded', () => {
  const scrollContainer = document.querySelector('#smooth-scroll');
  if (!scrollContainer) return;

  gsap.registerPlugin(ScrollTrigger);

  const locoScroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    inertia: 0.5,
  });

  locoScroll.on('scroll', ScrollTrigger.update);

  ScrollTrigger.scrollerProxy(scrollContainer, {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: scrollContainer.style.transform ? 'transform' : 'fixed',
  });

  ScrollTrigger.addEventListener('refresh', () => locoScroll.update());
  ScrollTrigger.refresh();

  // 패널 고정(겹치지 않고 한 패널씩 스크롤)
  const panels = document.querySelectorAll('.panel');
  panels.forEach((panel, i, arr) => {
    ScrollTrigger.create({
      trigger: panel,
      scroller: '#smooth-scroll',
      start: 'top top',
      pin: i !== arr.length - 1,
      pinSpacing: false,
      anticipatePin: 1,
    });
  });

  // 우측 네비게이션
  const NAV_OFFSET = -120;
  const navItems = document.querySelectorAll('.side-nav .nav-item');

  navItems.forEach((item, idx) => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = panels[idx];
      if (target) {
        locoScroll.scrollTo(target, {
          offset: NAV_OFFSET,
          duration: 800,
          disableLerp: true,
        });
      }
    });
  });

  function activateSideNav(activeIdx) {
    navItems.forEach((nav, i) => nav.classList.toggle('active', i === activeIdx));
  }

  panels.forEach((panel, idx) => {
    ScrollTrigger.create({
      trigger: panel,
      scroller: '#smooth-scroll',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activateSideNav(idx),
      onEnterBack: () => activateSideNav(idx),
    });
  });
});