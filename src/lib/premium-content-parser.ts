/**
 * 有料コンテンツパーサー
 * Notion区切り線（<hr class="divider">）を境界として
 * 無料コンテンツと有料コンテンツを分離する
 */

export interface ParsedContent {
  freeContent: string
  premiumContent: string
  hasPremium: boolean
}

/**
 * HTML文字列から有料コンテンツを分離
 * @param htmlContent - 記事のHTML文字列
 * @returns 無料部分と有料部分に分離されたコンテンツ
 */
export function parsePremiumContent(htmlContent: string): ParsedContent {
  // 区切り線のパターン
  const dividerPattern = /<hr\s+class="divider"[^>]*>/i
  
  // 区切り線で分割
  const parts = htmlContent.split(dividerPattern)
  
  if (parts.length === 1) {
    // 区切り線がない場合は全て無料コンテンツ
    return {
      freeContent: htmlContent,
      premiumContent: '',
      hasPremium: false
    }
  }
  
  // 最初の部分が無料、それ以降が有料
  // 複数の区切り線がある場合は、最初の区切り線のみを境界とする
  return {
    freeContent: parts[0],
    premiumContent: parts.slice(1).join('<hr class="divider">'), // 2つ目以降の区切り線は有料部分に含める
    hasPremium: true
  }
}

/**
 * DOM要素から有料コンテンツを分離（クライアントサイド用）
 * @param container - 記事コンテナのDOM要素
 * @returns 無料部分と有料部分のDOM要素
 */
export function parsePremiumContentDOM(container: HTMLElement): {
  freeElements: Element[]
  premiumElements: Element[]
  hasPremium: boolean
} {
  const children = Array.from(container.children)
  const dividerIndex = children.findIndex(
    el => el.tagName === 'HR' && el.classList.contains('divider')
  )
  
  if (dividerIndex === -1) {
    // 区切り線がない場合
    return {
      freeElements: children,
      premiumElements: [],
      hasPremium: false
    }
  }
  
  return {
    freeElements: children.slice(0, dividerIndex),
    premiumElements: children.slice(dividerIndex + 1),
    hasPremium: true
  }
}

/**
 * Notionブロックレベルでの有料コンテンツ判定
 * （Notion APIから直接取得したブロックデータ用）
 */
export function parseNotionBlocks(blocks: any[]): {
  freeBlocks: any[]
  premiumBlocks: any[]
  hasPremium: boolean
} {
  const dividerIndex = blocks.findIndex(
    block => block.type === 'divider'
  )
  
  if (dividerIndex === -1) {
    return {
      freeBlocks: blocks,
      premiumBlocks: [],
      hasPremium: false
    }
  }
  
  return {
    freeBlocks: blocks.slice(0, dividerIndex),
    premiumBlocks: blocks.slice(dividerIndex + 1),
    hasPremium: true
  }
}

/**
 * プレビュー用のテキスト抽出
 * @param htmlContent - HTML文字列
 * @param maxLength - 最大文字数
 * @returns プレーンテキストのプレビュー
 */
export function extractPreviewText(htmlContent: string, maxLength: number = 200): string {
  // HTMLタグを除去
  const text = htmlContent.replace(/<[^>]*>/g, '')
  
  // 改行と余分な空白を正規化
  const normalized = text.replace(/\s+/g, ' ').trim()
  
  if (normalized.length <= maxLength) {
    return normalized
  }
  
  // 単語の途中で切らないように調整
  const truncated = normalized.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}