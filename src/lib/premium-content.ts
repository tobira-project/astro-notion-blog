import { Block } from './interfaces'

/**
 * ブロック配列からdividerの位置を検出し、無料部分と有料部分に分割する
 *
 * @param blocks - Notionブロックの配列
 * @returns { freeBlocks: Block[], premiumBlocks: Block[], hasPremiumContent: boolean }
 */
export function splitContentByDivider(blocks: Block[]): {
  freeBlocks: Block[]
  premiumBlocks: Block[]
  hasPremiumContent: boolean
} {
  const dividerIndex = blocks.findIndex(block => block.Type === 'divider')

  // dividerが見つからない場合は全て無料コンテンツ
  if (dividerIndex === -1) {
    return {
      freeBlocks: blocks,
      premiumBlocks: [],
      hasPremiumContent: false
    }
  }

  // divider以前を無料部分、divider以降（divider自体を除く）を有料部分とする
  return {
    freeBlocks: blocks.slice(0, dividerIndex),
    premiumBlocks: blocks.slice(dividerIndex + 1),
    hasPremiumContent: true
  }
}

/**
 * ユーザーのサブスクリプション状態を確認する
 *
 * @param firebaseUid - Firebase UID
 * @returns Promise<boolean> - 有料プランに加入しているかどうか
 */
export async function checkSubscriptionStatus(firebaseUid: string): Promise<boolean> {
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
