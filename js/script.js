gsap.registerPlugin(ScrollTrigger);

// Locomotive Scroll 초기화 (inertia: 0.6)
const locoScroll = new LocomotiveScroll({
  el: document.querySelector("#smooth-scroll"),
  smooth: true,
  inertia: 0.6,
});

locoScroll.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy("#smooth-scroll", {
  scrollTop(value) {
    return arguments.length 
      ? locoScroll.scrollTo(value, 0, 0)
      : locoScroll.scroll.instance.scroll.y;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: document.querySelector("#smooth-scroll").style.transform ? "transform" : "fixed"
});

ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
ScrollTrigger.refresh();

// 기존 패널 애니메이션 (패널 고정 및 이미지 줌)
const panels = gsap.utils.toArray('.panel');

panels.forEach((panel) => {
  ScrollTrigger.create({
    trigger: panel,
    scroller: "#smooth-scroll",
    start: "top top",
    pin: true,
    pinSpacing: false,
    anticipatePin: 1
  });

  const image = panel.querySelector('img');
  if (image) {
    gsap.fromTo(
      image,
      { scale: 1 },
      {
        scale: 1.3,
        ease: "none",
        scrollTrigger: {
          trigger: panel,
          scroller: "#smooth-scroll",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      }
    );
  }
});

// 네비게이션 막대 클릭 시 해당 섹션으로 이동
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const targetID = this.getAttribute('href');
    // 홈 버튼인 경우 (첫 번째 섹션) 스크롤을 0으로 지정
    if (targetID === "#page1") {
      locoScroll.scrollTo(0, { duration: 800 });
    } else {
      const targetEl = document.querySelector(targetID);
      if (targetEl) {
        locoScroll.scrollTo(targetEl, { duration: 800 });
      }
    }
  });
});
