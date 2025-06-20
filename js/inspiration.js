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