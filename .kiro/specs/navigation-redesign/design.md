# Design Document

## Overview

ホーム画面上部のナビゲーションボタンを、視認性とデザイン品質を向上させた洗練されたデザインに改善する。現在の半透明ボタンから、より明確で現代的なデザインアプローチに移行する。

## Architecture

### Current State Analysis
- 現在のボタン: 半透明背景 + 白いボーダー
- 問題点: 背景との境界が曖昧、テキストの可読性が低い
- 改善の必要性: より明確な視覚的階層とコントラストが必要

### Design Approach
- **Material Design 3.0**と**Glassmorphism**の要素を組み合わせ
- **高コントラスト**による視認性向上
- **マイクロインタラクション**による使いやすさ向上

## Components and Interfaces

### Navigation Button Component

#### Visual Design
```css
/* Base Button Style */
.nav-button {
  /* 背景: ソリッドカラー + 微細なグラデーション */
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  
  /* ボーダー: より明確な境界線 */
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  
  /* シャドウ: 立体感とフォーカス */
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  
  /* テキスト: 高コントラスト */
  color: #1a1a1a;
  font-weight: 600;
  
  /* 形状: より丸みを帯びた現代的なデザイン */
  border-radius: 12px;
  
  /* サイズ: より大きく、タップしやすく */
  padding: 12px 24px;
  min-width: 120px;
}
```

#### Hover States
```css
.nav-button:hover {
  /* 背景: より明るく、より不透明に */
  background: linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.95));
  
  /* シャドウ: より強調 */
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  
  /* 変形: 微細な拡大 */
  transform: translateY(-2px) scale(1.02);
  
  /* ボーダー: より明確に */
  border-color: rgba(255, 255, 255, 0.5);
}
```

#### Special Button (Login)
```css
.nav-button.login-btn {
  /* 背景: ブランドカラーのグラデーション */
  background: linear-gradient(145deg, var(--tobiracast-primary-orange), var(--tobiracast-dark-orange));
  
  /* テキスト: 白色で高コントラスト */
  color: white;
  
  /* ボーダー: オレンジ系 */
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  
  /* シャドウ: オレンジ系の影 */
  box-shadow: 
    0 4px 20px rgba(233, 104, 0, 0.3),
    0 1px 3px rgba(233, 104, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.nav-button.login-btn:hover {
  background: linear-gradient(145deg, var(--tobiracast-light-orange), var(--tobiracast-primary-orange));
  box-shadow: 
    0 8px 30px rgba(233, 104, 0, 0.4),
    0 2px 8px rgba(233, 104, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
```

### Layout Improvements

#### Desktop Layout
- ボタン間のスペーシング: `gap: 16px`
- 最大幅制限で中央揃え
- より大きなクリック領域

#### Mobile Layout
- 縦積みレイアウト
- フルワイズボタン（画面幅の80%）
- より大きなタップ領域（最小44px高さ）

## Data Models

### Button Configuration
```typescript
interface NavButton {
  label: string;
  href: string;
  variant: 'default' | 'primary';
  icon?: string;
  ariaLabel?: string;
}

const navigationButtons: NavButton[] = [
  { label: 'ホーム', href: '/', variant: 'default' },
  { label: '記事一覧', href: '/posts', variant: 'default' },
  { label: 'プラン加入', href: '/subscription', variant: 'default' },
  { label: 'ログイン', href: '/login', variant: 'primary' }
];
```

## Error Handling

### Accessibility Considerations
- **Focus States**: キーボードナビゲーション用の明確なフォーカスリング
- **ARIA Labels**: スクリーンリーダー対応
- **Color Contrast**: WCAG AA準拠（4.5:1以上）

### Responsive Breakpoints
- **Desktop**: > 768px - 水平レイアウト
- **Tablet**: 481px - 768px - 調整されたスペーシング
- **Mobile**: ≤ 480px - 縦積みレイアウト

## Testing Strategy

### Visual Testing
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Device Testing**: iPhone, Android, iPad, Desktop
- **Accessibility Testing**: スクリーンリーダー、キーボードナビゲーション

### Performance Testing
- **Animation Performance**: 60fps維持
- **Load Time**: CSSアニメーションの最適化
- **Touch Response**: モバイルでの応答性確保

### Design References
- **HIU**: プロフェッショナルなボタンデザイン
- **COTEN RADIO**: 洗練されたナビゲーション
- **Material Design 3.0**: モダンなインタラクション