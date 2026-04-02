import { getBlogFunctionUrl } from './functions-url'

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean
  subscription_status: string | null
  subscription_tier: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

const ACCESSIBLE_SUBSCRIPTION_STATUSES = new Set(['ACTIVE', 'TRIALING'])

export async function fetchSubscriptionStatus(
  idToken: string
): Promise<SubscriptionStatusResponse> {
  const response = await fetch(
    getBlogFunctionUrl(
      import.meta.env.PUBLIC_FIREBASE_FUNCTIONS_URL,
      'blog-subscriptionStatus'
    ),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('サブスクリプション状態の取得に失敗しました')
  }

  return response.json()
}

export function hasPremiumAccess(subscription: SubscriptionStatusResponse) {
  return (
    subscription.hasActiveSubscription ||
    ACCESSIBLE_SUBSCRIPTION_STATUSES.has(subscription.subscription_status || '')
  )
}

export function formatSubscriptionTier(tier: string | null) {
  switch (tier) {
    case 'BASIC':
      return 'ベーシック'
    case 'STANDARD':
      return 'スタンダード'
    case 'PREMIUM':
      return 'プレミアム'
    default:
      return '未加入'
  }
}

export function formatSubscriptionStatus(status: string | null) {
  switch (status) {
    case 'ACTIVE':
      return '有効'
    case 'TRIALING':
      return 'トライアル中'
    case 'PAST_DUE':
      return '支払い遅延'
    case 'CANCELED':
      return 'キャンセル済み'
    case 'INCOMPLETE':
      return '処理中'
    case 'INCOMPLETE_EXPIRED':
      return '期限切れ'
    case 'UNPAID':
      return '未払い'
    default:
      return '未加入'
  }
}
