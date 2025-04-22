document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;
  
    // pages/ 하위면 ../components, 루트면 components
    const isInPages = window.location.pathname.includes('/pages/');
    const navbarPath = isInPages
      ? '../components/navbar.html'
      : 'components/navbar.html';
  
    fetch(navbarPath)
      .then(res => {
        if (!res.ok) throw new Error('Navbar load failed');
        return res.text();
      })
      .then(html => {
        placeholder.innerHTML = html;
      })
      .catch(console.error);
  });
  
