// Sanity에서 콘텐츠를 가져와 /public/data/*.json으로 저장
const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || 'production';

if (!projectId) {
  console.error('[fetch-content] Missing SANITY_PROJECT_ID');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-08-01',
  useCdn: true,
});

// GROQ 쿼리
const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc){
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage{..., "alt": coalesce(alt, title)},
  "tags": tags[]->{_id, title, "slug": slug.current}
}`;

const PROJECTS_QUERY = `*[_type == "project"] | order(date desc){
  _id,
  title,
  "slug": slug.current,
  summary,
  date,
  url,
  thumbnail{..., "alt": coalesce(alt, title)},
  heroImages[]{..., "alt": coalesce(alt, "")},
  "tags": tags[]->{_id, title, "slug": slug.current}
}`;

const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  siteTitle,
  siteDescription,
  logo{..., "alt": coalesce(alt, "Site Logo")},
  socialLinks
}`;

async function run() {
  const [posts, projects, settings] = await Promise.all([
    client.fetch(POSTS_QUERY),
    client.fetch(PROJECTS_QUERY),
    client.fetch(SETTINGS_QUERY),
  ]);

  const outDir = path.resolve(process.cwd(), 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'posts.json'), JSON.stringify(posts, null, 2));
  fs.writeFileSync(path.join(outDir, 'projects.json'), JSON.stringify(projects, null, 2));
  fs.writeFileSync(path.join(outDir, 'settings.json'), JSON.stringify(settings, null, 2));

  console.log('[fetch-content] Exported: posts.json, projects.json, settings.json');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
