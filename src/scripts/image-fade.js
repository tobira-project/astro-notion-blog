// 画像読み込み時のフラッシュ効果を防ぐスクリプト
document.addEventListener('DOMContentLoaded', function() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  images.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
    }
  });
});