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

<<<<<<< HEAD
  // 패널 슬라이드 애니메이션 (스크롤 시 위로 슬라이드)
  const panels = document.querySelectorAll('.panel');
  panels.forEach((panel) => {
    gsap.fromTo(panel,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        scrollTrigger: {
          trigger: panel,
          scroller: '#smooth-scroll',
          start: 'top 90%',
          end: 'top 40%',
          scrub: true,
        }
      }
    );
  });

  // 네비게이션 클릭 시 해당 패널로 스크롤 이동
  document.querySelectorAll('.side-nav .nav-item').forEach((item, idx) => {
=======
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
>>>>>>> 177c312ae184ac8d78cb931f7960220252b671da
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = panels[idx];
      if (target) {
        locoScroll.scrollTo(target, {
<<<<<<< HEAD
=======
          offset: NAV_OFFSET,
>>>>>>> 177c312ae184ac8d78cb931f7960220252b671da
          duration: 800,
          disableLerp: true,
        });
      }
    });
  });

<<<<<<< HEAD
  // 활성화 표시 함수
  function activateSideNav(activeIdx) {
    document.querySelectorAll('.side-nav .nav-item')
      .forEach((nav, i) => nav.classList.toggle('active', i === activeIdx));
  }

  // 스크롤 트리거로 활성화 동기화
=======
  function activateSideNav(activeIdx) {
    navItems.forEach((nav, i) => nav.classList.toggle('active', i === activeIdx));
  }

>>>>>>> 177c312ae184ac8d78cb931f7960220252b671da
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