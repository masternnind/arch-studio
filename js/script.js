/*─────────────────────────────
    SECTION 4: Cover Page – Canvas Animation
  ─────────────────────────────*/
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('pensilCanvas');
    if (canvas && window.OffscreenCanvas) {
      // 캔버스 크기 설정 (스크롤바 없는 뷰포트 기준)
      function resizeCanvas() {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        // 아래 코드도 워커에 전달
        if (canvas.worker) {
          canvas.worker.postMessage({
            width: canvas.width,
            height: canvas.height
          });
        }
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // 워커 생성 및 오프스크린 캔버스 전달
      const offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker('js/canvas-worker.js');
      canvas.worker = worker; // resize에서 접근 가능하도록 저장
      worker.postMessage({
        canvas: offscreen,
        width: canvas.width,
        height: canvas.height
      }, [offscreen]);

      // 리사이즈 시 워커에도 크기 전달 (위에서 이미 처리)
      // 워커에서 오는 메시지(디버깅용) 콘솔에 출력
      worker.onmessage = (e) => {
        console.log('worker message:', e.data);
      };
    } else {
      console.warn('OffscreenCanvas를 지원하지 않는 브라우저입니다.');
    }
  });

  // 인덱스 로딩 퍼센트 효과
  window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loading-overlay');
    const text = document.getElementById('loading-text');
    if (!overlay || !text) return;
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 4) + 1; // 1~4%씩 랜덤 증가
      if (percent > 100) percent = 100;
      text.textContent = percent + '%';
      if (percent === 100) {
        clearInterval(interval);
        setTimeout(() => {
          // 자연스러운 쉐이드아웃 효과 추가
          overlay.style.transition = 'opacity 1.2s cubic-bezier(0.4,0,0.2,1)';
          overlay.style.opacity = '0';
          setTimeout(() => overlay.style.display = 'none', 800);
        }, 400);
      }
    }, 30);
  });