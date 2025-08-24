# Sanity + Netlify 통합 팩 (arch-studio 전용)

이 압축을 저장소 루트에 풀고, 필요한 파일을 병합하면 바로 사용 가능합니다.

## 포함 파일
- `sanity/` : Sanity Studio 스키마 및 설정
- `scripts/fetch-content.js` : Netlify 빌드 전에 Sanity에서 데이터를 JSON으로 가져와 `/public/data/`에 저장
- `js/sanity-data.js` : 정적 사이트에서 `/public/data/*.json`을 읽어 화면에 바인딩하는 헬퍼

---
## 1) Sanity 프로젝트 생성
1. https://www.sanity.io/manage 에서 새 프로젝트 생성
2. **Project ID**와 **Dataset(예: production)** 확인

### 환경변수 (Netlify → Site settings → Build & deploy → Environment)
- `SANITY_PROJECT_ID` = (위에서 확인한 projectId)
- `SANITY_DATASET` = `production` (또는 생성한 이름)

---
## 2) 저장소에 파일 배치
저장소 루트에 아래 구조가 되도록 추가합니다.

```
/ (repo root)
  /assets
  /components
  /js
    sanity-data.js   ← 추가
  /pages
  /public
    /data            ← 빌드 시 자동 생성
  /sanity            ← 추가
    sanity.config.ts
    /schemas
      index.ts
      post.ts
      project.ts
      tag.ts
      siteSettings.ts
  /scripts
    fetch-content.js ← 추가
  index.html
  generate-image-json.js (이미 존재한다면 유지)
```

> **참고**: TypeScript를 쓰지 않는다면 `sanity.config.ts`는 그대로 두고, Sanity CLI/Studio는 별도에서 사용해도 됩니다.

---
## 3) 패키지 설치 및 빌드 스크립트
이 저장소가 순수 정적 사이트라면 Node 스크립트를 실행하기 위해 `package.json`을 추가/수정합니다.

**package.json 예시 (필요시 병합)**:
```json
{
  "private": true,
  "scripts": {
    "prebuild": "node scripts/fetch-content.js",
    "build": "echo 'Run your static build command here (or leave empty if not needed)'"
  },
  "dependencies": {
    "@sanity/client": "^6.18.2"
  }
}
```

- 로컬 테스트:
  ```bash
  npm i
  SANITY_PROJECT_ID=xxxx SANITY_DATASET=production npm run prebuild
  # 실행 후 /public/data/posts.json 등 생성 확인
  ```

- Netlify 빌드 설정:
  - **Build command**: `npm run prebuild && (your-build-command-or-echo)`
  - **Publish directory**: 현재 사이트가 사용하는 디렉토리(기본은 루트 또는 /dist 등)

---
## 4) HTML에서 데이터 사용
`js/sanity-data.js` 는 `/public/data/*.json`을 fetch합니다.
예)
```html
<section id="latest-posts"></section>
<script src="/js/sanity-data.js"></script>
<script>
  window.renderPosts("#latest-posts");
</script>
```

프로젝트 목록:
```html
<section id="projects"></section>
<script>
  window.renderProjects("#projects");
</script>
```

사이트 설정(타이틀/설명/로고 등)은 `window.loadSettings()`로 불러올 수 있습니다.

---
## 5) Sanity Studio (선택)
- 로컬에서 Studio를 띄우려면 별도 폴더에서 Sanity CLI를 사용하거나, 이 repo의 `/sanity` 폴더를 독립 프로젝트로 사용하세요.
- Sanity CLI:
  ```bash
  npm create sanity@latest
  # 생성된 sanity 프로젝트의 /schemas 폴더를 이 팩의 schemas로 교체하면 동일 스키마 적용
  ```

---
## 6) 스키마 개요
- `post` : 블로그 글
- `project` : 포트폴리오 프로젝트
- `tag` : 태그
- `siteSettings` : 사이트 타이틀/설명/로고/소셜 링크

필요에 따라 필드를 추가/수정하세요.
