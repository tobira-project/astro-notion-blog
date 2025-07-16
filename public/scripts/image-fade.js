// 画像読み込み時のフラッシュ効果を防ぐスクリプト
document.addEventListener('DOMContentLoaded', function () {
  const images = document.querySelectorAll('img[loading="lazy"]');

  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function () {
        // 少し遅延させて自然な読み込み感を演出
        setTimeout(() => {
          this.classList.add('loaded');
        }, 150);
      });

      // エラー時の処理
      img.addEventListener('error', function () {
        this.style.background = '#f8f9fa';
        this.style.opacity = '0.5';
      });
    }
  });

  // Intersection Observer でより自然な画像読み込み
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (!img.classList.contains('loaded')) {
          img.style.opacity = '0';
          setTimeout(() => {
            img.style.opacity = '1';
          }, 100);
        }
      }
    });
  });

  images.forEach((img) => {
    imageObserver.observe(img);
  });
});
