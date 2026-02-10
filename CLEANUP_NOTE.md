# クリーンアップ時の問題メモ

## ⚠️ 依存関係エラー

**日付:** 2026-02-11  
**状況:** node_modules削除後の再インストールに失敗

## 🐛 エラー内容

### 問題のパッケージ

- `re2` パッケージのネイティブビルドエラー
- Node.js v24.4.1との互換性問題

### エラーメッセージ

```
npm error gyp ERR! build error
npm error gyp ERR! stack Error: `make` failed with exit code: 2
npm error gyp ERR! node -v v24.4.1
```

### 原因

- `re2`パッケージがNode.js v24の新しいV8 APIに対応していない
- C++のネイティブモジュールのコンパイルエラー

## 🔧 復旧方法

### オプション1: Node.jsのバージョンを下げる（推奨）

```bash
# nvmを使用している場合
nvm install 20
nvm use 20
cd /Users/ray/dev/astro-notion-blog
npm install
```

### オプション2: 強制インストール

```bash
cd /Users/ray/dev/astro-notion-blog
npm install --force
```

### オプション3: legacy-peer-depsを使用

```bash
cd /Users/ray/dev/astro-notion-blog
npm install --legacy-peer-deps
```

### オプション4: package.jsonを更新

`re2`パッケージを使用しているライブラリを更新または削除:

```bash
# 依存関係を確認
npm list re2

# 可能であれば、re2を使用していない代替パッケージに変更
```

## 📊 現在の状態

- `node_modules/` が削除されたまま
- `dist/` も削除済み
- `.astro/` も削除済み
- プロジェクトサイズ: 588MB → 11MB

## 🚀 開発再開時の手順

```bash
# 1. Node.jsバージョンを確認
node -v
# v24以上の場合はv20に変更を推奨

# 2. 依存関係をインストール
npm install

# 3. 開発サーバー起動
npm run dev
```

## 📝 今後の対策

### 予防策

1. **Node.jsバージョンを固定**
   - `.nvmrc` ファイルを作成して推奨バージョンを指定

   ```
   20.9.0
   ```

2. **定期的な依存関係の更新**

   ```bash
   npm outdated
   npm update
   ```

3. **パッケージの互換性確認**
   - Node.jsをアップグレードする前に主要パッケージの互換性を確認

## 🔗 参考リンク

- [re2 GitHub Issues](https://github.com/uhop/node-re2/issues)
- [Node.js Compatibility](https://nodejs.org/en/about/previous-releases)
- [nvm Usage](https://github.com/nvm-sh/nvm)

## 💡 補足

このエラーは軽量化作業中に発生しましたが、プロジェクト自体の問題ではありません。
Node.jsのバージョン管理とパッケージの互換性に注意することで解決できます。

---

**削除されたファイル:**

- `node_modules/` (575MB)
- `dist/` (3.8MB)
- `.astro/` (28KB)

**復旧優先度:** 低（必要な時に対処すればOK）
