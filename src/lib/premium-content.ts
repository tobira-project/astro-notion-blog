import { Block } from './interfaces'

/**
 * ブロック配列からdividerの位置を検出し、無料部分と有料部分に分割する
 *
 * このフ ァンクションはNotionの記事コンテンツを有料/無料に分割します。
 * 最初のdividerブロックを区切り点として、それより前を無料コンテンツ、
 * それ以降を有料コンテンツとして扱います。
 *
 * @param blocks - Notionブロックの配列
 * @returns { freeBlocks: Block[], premiumBlocks: Block[], hasPremiumContent: boolean }
 * @throws {TypeError} blocks が配列でない場合
 *
 * @example
 * const { freeBlocks, premiumBlocks, hasPremiumContent } = splitContentByDivider(blocks)
 * if (hasPremiumContent) {
 *   // 有料コンテンツが存在する場合の処理
 * }
 */
export function splitContentByDivider(blocks: Block[]): {
  freeBlocks: Block[]
  premiumBlocks: Block[]
  hasPremiumContent: boolean
} {
  // 入力バリデーション
  if (!Array.isArray(blocks)) {
    throw new TypeError('blocks must be an array')
  }

  const dividerIndex = blocks.findIndex((block) => block.Type === 'divider')

  // dividerが見つからない場合は全て無料コンテンツ
  if (dividerIndex === -1) {
    return {
      freeBlocks: blocks,
      premiumBlocks: [],
      hasPremiumContent: false,
    }
  }

  // divider以前を無料部分、divider以降（divider自体を除く）を有料部分とする
  return {
    freeBlocks: blocks.slice(0, dividerIndex),
    premiumBlocks: blocks.slice(dividerIndex + 1),
    hasPremiumContent: true,
  }
}

/**
 * ユーザーのサブスクリプション状態を確認する
 *
 * tobiratory-webのAPIエンドポイントに問い合わせて、
 * ユーザーが有効なサブスクリプションを持っているかを確認します。
 *
 * @param firebaseUid - Firebase UID
 * @returns Promise<boolean> - 有料プランに加入している場合true、それ以外false
 * @throws {TypeError} firebaseUid が文字列でない、または空文字列の場合
 *
 * @example
 * const isSubscribed = await checkSubscriptionStatus(user.uid)
 * if (isSubscribed) {
 *   // プレミアムコンテンツを表示
 * }
 */
export async function checkSubscriptionStatus(
  firebaseUid: string
): Promise<boolean> {
  // 入力バリデーション
  if (typeof firebaseUid !== 'string' || firebaseUid.trim() === '') {
    throw new TypeError('firebaseUid must be a non-empty string')
  }

  // TODO: DB実装後に有効化
  // const API_URL = import.meta.env.PUBLIC_API_URL || 'https://asia-northeast1-tobiratory-f6ae1.cloudfunctions.net'

  // try {
  //   const response = await fetch(`${API_URL}/blog/subscription-status`, {
  //     headers: {
  //       'Authorization': firebaseUid
  //     }
  //   })
  //
  //   if (!response.ok) {
  //     return false
  //   }
  //
  //   const data = await response.json()
  //   return data.status === 'active'
  // } catch (error) {
  //   console.error('Failed to check subscription status:', error)
  //   return false
  // }

  // DB実装前の一時的な処理：常にfalse（無料ユーザー扱い）
  return false
}
