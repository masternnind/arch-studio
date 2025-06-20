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
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = panels[idx];
      if (target) {
        locoScroll.scrollTo(target, {
          duration: 800,
          disableLerp: true,
        });
      }
    });
  });

  // 활성화 표시 함수
  function activateSideNav(activeIdx) {
    document.querySelectorAll('.side-nav .nav-item')
      .forEach((nav, i) => nav.classList.toggle('active', i === activeIdx));
  }

  // 스크롤 트리거로 활성화 동기화
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