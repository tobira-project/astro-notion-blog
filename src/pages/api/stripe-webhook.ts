import type { APIRoute } from 'astro'
import Stripe from 'stripe'

/**
 * APIルート: Stripe Webhookイベントを受信
 *
 * Stripeからの支払い完了・サブスクリプション状態変更などのイベントを受信し、
 * データベースを更新します。
 *
 * 対応イベント:
 * - checkout.session.completed: 決済完了時
 * - customer.subscription.updated: サブスクリプション更新時
 * - customer.subscription.deleted: サブスクリプション削除時
 *
 * セキュリティ:
 * - Webhook署名検証により、Stripeからの正規リクエストのみ処理
 * - 署名検証に失敗した場合は400エラーを返却
 */
export const prerender = false

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

/**
 * Webhookイベントの型定義（主要フィールドのみ）
 */
interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: unknown
  }
}

/**
 * Checkout Sessionオブジェクトの型定義
 */
interface CheckoutSession {
  id: string
  customer: string | null
  subscription: string | null
  metadata: {
    firebaseUid?: string
  }
  mode: string
  payment_status: string
}

/**
 * Subscriptionオブジェクトの型定義
 */
interface SubscriptionObject {
  id: string
  customer: string
  status: string
  metadata: {
    firebaseUid?: string
  }
  items: {
    data: Array<{
      price: {
        id: string
      }
    }>
  }
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
}

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET

  if (!sig) {
    return new Response(
      JSON.stringify({ error: 'Missing stripe-signature header' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured')
    return new Response(
      JSON.stringify({ error: 'Webhook secret not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let event: StripeWebhookEvent

  try {
    // リクエストボディを取得（raw bodyとして）
    const arrayBuffer = await request.arrayBuffer()
    const body = Buffer.from(arrayBuffer).toString('utf8')

    // Webhook署名を検証してイベントを構築
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    ) as StripeWebhookEvent

    console.log(`[Webhook] Received event: ${event.type} (${event.id})`)
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return new Response(
      JSON.stringify({
        error: `Webhook signature verification failed: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // イベントタイプごとに処理
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as CheckoutSession
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as SubscriptionObject
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as SubscriptionObject
        await handleSubscriptionDeleted(subscription)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    // Stripeには必ず200を返す（処理が成功したことを示す）
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[Webhook] Event processing error:', err)
    // エラーが発生してもStripeには200を返す（重複送信を防ぐため）
    // エラーログは記録しておき、後で手動対応
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

/**
 * checkout.session.completedイベントを処理
 *
 * 決済完了時に呼ばれます。Firebase UIDとStripe Customer IDを紐付け、
 * サブスクリプション情報をデータベースに保存します。
 */
async function handleCheckoutSessionCompleted(
  session: CheckoutSession
): Promise<void> {
  console.log('[Webhook] Processing checkout.session.completed:', session.id)

  const firebaseUid = session.metadata.firebaseUid
  const customerId = session.customer
  const subscriptionId = session.subscription

  if (!firebaseUid) {
    console.error('[Webhook] Missing firebaseUid in session metadata')
    return
  }

  if (!customerId) {
    console.error('[Webhook] Missing customer ID in session')
    return
  }

  if (!subscriptionId) {
    console.error('[Webhook] Missing subscription ID in session')
    return
  }

  // サブスクリプション情報を取得
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionId as string
  )

  // プランを判定（価格IDから）
  const priceId = subscription.items.data[0]?.price.id
  let tier = 'unknown'
  if (priceId === import.meta.env.PUBLIC_STRIPE_PRICE_ID_BASIC) {
    tier = 'basic'
  } else if (priceId === import.meta.env.PUBLIC_STRIPE_PRICE_ID_STANDARD) {
    tier = 'standard'
  } else if (priceId === import.meta.env.PUBLIC_STRIPE_PRICE_ID_PREMIUM) {
    tier = 'premium'
  }

  console.log(
    `[Webhook] Subscription created: firebaseUid=${firebaseUid}, customerId=${customerId}, tier=${tier}`
  )

  // TODO: DB実装後に有効化
  // データベースにサブスクリプション情報を保存
  // await prisma.blog_accounts.upsert({
  //   where: { firebase_uid: firebaseUid },
  //   create: {
  //     firebase_uid: firebaseUid,
  //     stripe_customer_id: customerId,
  //     stripe_subscription_id: subscriptionId,
  //     subscription_status: subscription.status,
  //     subscription_tier: tier,
  //     current_period_start: new Date(subscription.current_period_start * 1000),
  //     current_period_end: new Date(subscription.current_period_end * 1000),
  //     cancel_at_period_end: subscription.cancel_at_period_end,
  //   },
  //   update: {
  //     stripe_customer_id: customerId,
  //     stripe_subscription_id: subscriptionId,
  //     subscription_status: subscription.status,
  //     subscription_tier: tier,
  //     current_period_start: new Date(subscription.current_period_start * 1000),
  //     current_period_end: new Date(subscription.current_period_end * 1000),
  //     cancel_at_period_end: subscription.cancel_at_period_end,
  //   },
  // })

  console.log('[Webhook] Successfully processed checkout.session.completed')
}

/**
 * customer.subscription.updatedイベントを処理
 *
 * サブスクリプション状態が変更された時に呼ばれます。
 * プラン変更、ステータス変更（active, past_due, canceledなど）を反映します。
 */
async function handleSubscriptionUpdated(
  subscription: SubscriptionObject
): Promise<void> {
  console.log(
    '[Webhook] Processing customer.subscription.updated:',
    subscription.id
  )

  const firebaseUid = subscription.metadata.firebaseUid

  if (!firebaseUid) {
    console.error('[Webhook] Missing firebaseUid in subscription metadata')
    return
  }

  // プランを判定
  const priceId = subscription.items.data[0]?.price.id
  let tier = 'unknown'
  if (priceId === import.meta.env.PUBLIC_STRIPE_PRICE_ID_BASIC) {
    tier = 'basic'
  } else if (priceId === import.meta.env.PUBLIC_STRIPE_PRICE_ID_STANDARD) {
    tier = 'standard'
  } else if (priceId === import.meta.env.PUBLIC_STRIPE_PRICE_ID_PREMIUM) {
    tier = 'premium'
  }

  console.log(
    `[Webhook] Subscription updated: firebaseUid=${firebaseUid}, status=${subscription.status}, tier=${tier}`
  )

  // TODO: DB実装後に有効化
  // データベースを更新
  // await prisma.blog_accounts.update({
  //   where: { firebase_uid: firebaseUid },
  //   data: {
  //     subscription_status: subscription.status,
  //     subscription_tier: tier,
  //     current_period_start: new Date(subscription.current_period_start * 1000),
  //     current_period_end: new Date(subscription.current_period_end * 1000),
  //     cancel_at_period_end: subscription.cancel_at_period_end,
  //   },
  // })

  console.log('[Webhook] Successfully processed customer.subscription.updated')
}

/**
 * customer.subscription.deletedイベントを処理
 *
 * サブスクリプションが削除（キャンセル）された時に呼ばれます。
 */
async function handleSubscriptionDeleted(
  subscription: SubscriptionObject
): Promise<void> {
  console.log(
    '[Webhook] Processing customer.subscription.deleted:',
    subscription.id
  )

  const firebaseUid = subscription.metadata.firebaseUid

  if (!firebaseUid) {
    console.error('[Webhook] Missing firebaseUid in subscription metadata')
    return
  }

  console.log(`[Webhook] Subscription deleted: firebaseUid=${firebaseUid}`)

  // TODO: DB実装後に有効化
  // データベースを更新（ステータスをcanceledに）
  // await prisma.blog_accounts.update({
  //   where: { firebase_uid: firebaseUid },
  //   data: {
  //     subscription_status: 'canceled',
  //     stripe_subscription_id: null,
  //     cancel_at_period_end: false,
  //   },
  // })

  console.log('[Webhook] Successfully processed customer.subscription.deleted')
}
