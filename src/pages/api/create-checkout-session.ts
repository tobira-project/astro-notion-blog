import type { APIRoute } from 'astro'
import Stripe from 'stripe'

/**
 * APIルート: Stripe Checkout Sessionを作成
 *
 * このエンドポイントはサブスクリプションの決済フローを開始するために使用されます。
 * Stripeの決済ページURLを返却し、フロントエンドはそのURLにリダイレクトします。
 */
export const prerender = false

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

/**
 * リクエストボディの型定義
 */
interface CheckoutSessionRequest {
  priceId: string // Stripeの価格ID (例: price_xxx)
  userEmail: string // ユーザーのメールアドレス
  firebaseUid: string // Firebase UID (Webhook処理で使用)
}

/**
 * レスポンスボディの型定義
 */
interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

interface ErrorResponse {
  error: string
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as CheckoutSessionRequest
    const { priceId, userEmail, firebaseUid } = body

    // リクエストパラメータのバリデーション
    if (!priceId || !userEmail || !firebaseUid) {
      const errorResponse: ErrorResponse = {
        error:
          '必須パラメータが不足しています。priceId, userEmail, firebaseUidが必要です。',
      }
      return new Response(JSON.stringify(errorResponse), { status: 400 })
    }

    // Stripe Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // 決済成功時のリダイレクト先
      success_url: `${new URL(request.url).origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      // 決済キャンセル時のリダイレクト先
      cancel_url: `${new URL(request.url).origin}/cancel`,
      // 顧客のメールアドレス（Stripe上で顧客情報として使用）
      customer_email: userEmail,
      // Checkout Sessionのメタデータ（Webhook処理で使用）
      metadata: {
        firebaseUid: firebaseUid,
      },
      // サブスクリプションのメタデータ（Webhook処理でサブスク情報と紐付け）
      subscription_data: {
        metadata: {
          firebaseUid: firebaseUid,
        },
      },
    })

    const successResponse: CheckoutSessionResponse = {
      sessionId: session.id,
      url: session.url || '',
    }
    return new Response(JSON.stringify(successResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Stripe Checkout Session作成エラー:', error)

    const errorResponse: ErrorResponse = {
      error:
        error instanceof Error
          ? error.message
          : '予期しないエラーが発生しました',
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
