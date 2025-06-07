const fs = require('fs');
const path = require('path');

// 이미지 폴더 경로
const imagesDir = path.join(__dirname, 'assets/img/inspirations');
// JSON 파일 경로
const outputJson = path.join(imagesDir, 'images.json');

// 이미지 파일 목록 생성
fs.readdir(imagesDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // 이미지 파일만 필터링 (jpg, jpeg, png, gif)
  const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

  // JSON 파일 생성
  fs.writeFile(outputJson, JSON.stringify(imageFiles, null, 2), 'utf8', err => {
    if (err) {
      console.error('Error writing JSON file:', err);
      return;
    }
    console.log(`JSON file created successfully: ${outputJson}`);
  });
});