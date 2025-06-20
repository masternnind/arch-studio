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