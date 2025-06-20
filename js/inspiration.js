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
}