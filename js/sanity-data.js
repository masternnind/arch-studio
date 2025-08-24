// 정적 사이트에서 /public/data/*.json을 불러와 섹션에 렌더링
// 사용 예:
//   window.renderPosts('#latest-posts')
//   window.renderProjects('#projects')
//   window.loadSettings().then(s => { document.title = s.siteTitle || document.title; })

async function fetchJSON(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch ' + url);
  return res.json();
}

function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const c of children) {
    if (typeof c === 'string') el.appendChild(document.createTextNode(c));
    else if (c) el.appendChild(c);
  }
  return el;
}

function imageUrlFromAssetRef(ref, width = 1200, height = 630) {
  // 간단한 CDN URL 생성 (고급 최적화는 sanity/image-url 패키지 사용 권장)
  // ref 예시: "image-<hash>-1200x800-jpg"
  if (!ref || typeof ref !== 'string' || !ref.startsWith('image-')) return null;
  const [, id, dims, format] = ref.split('-');
  const projectId = window.SANITY_PROJECT_ID || ''; // 필요시 설정
  const dataset = window.SANITY_DATASET || 'production';
  // Sanity CDN 기본 형태: https://cdn.sanity.io/images/{projectId}/{dataset}/{id}-{dims}.{format}
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${format}`;
}

window.loadSettings = async function() {
  try {
    const s = await fetchJSON('/data/settings.json');
    return s || {};
  } catch (_) {
    return {};
  }
}

window.renderPosts = async function(selector) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  let posts = [];
  try {
    posts = await fetchJSON('/data/posts.json');
  } catch (e) {
    mount.textContent = 'No posts yet.';
    return;
  }

  const list = createEl('div', { class: 'posts-grid' });
  posts.forEach(p => {
    const imgSrc = (p.coverImage && p.coverImage.asset && p.coverImage.asset._ref)
      ? imageUrlFromAssetRef(p.coverImage.asset._ref, 600, 360)
      : null;
    const card = createEl('article', { class: 'post-card' }, [
      imgSrc ? createEl('img', { src: imgSrc, alt: (p.coverImage && p.coverImage.alt) || p.title }) : null,
      createEl('h3', {}, [p.title || 'Untitled']),
      createEl('p', {}, [p.excerpt || '']),
      createEl('a', { href: `/pages/post-${p.slug || p._id}.html` }, ['Read more']),
    ]);
    list.appendChild(card);
  });
  mount.innerHTML = '';
  mount.appendChild(list);
}

window.renderProjects = async function(selector) {
  const mount = document.querySelector(selector);
  if (!mount) return;
  let items = [];
  try {
    items = await fetchJSON('/data/projects.json');
  } catch (e) {
    mount.textContent = 'No projects yet.';
    return;
  }
  const list = createEl('div', { class: 'projects-grid' });
  items.forEach(p => {
    const thumb = (p.thumbnail && p.thumbnail.asset && p.thumbnail.asset._ref)
      ? imageUrlFromAssetRef(p.thumbnail.asset._ref, 600, 360)
      : null;
    const card = createEl('article', { class: 'project-card' }, [
      thumb ? createEl('img', { src: thumb, alt: (p.thumbnail && p.thumbnail.alt) || p.title }) : null,
      createEl('h3', {}, [p.title || 'Untitled']),
      createEl('p', {}, [p.summary || '']),
      p.url ? createEl('a', { href: p.url, target: '_blank', rel: 'noopener' }, ['Visit']) : null,
    ]);
    list.appendChild(card);
  });
  mount.innerHTML = '';
  mount.appendChild(list);
}
