import type { APIRoute } from 'astro'
import Stripe from 'stripe'

export const prerender = false

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

export const POST: APIRoute = async ({ request }) => {
  try {
    const { priceId, userEmail, firebaseUid } = await request.json()

    // バリデーション
    if (!priceId || !userEmail || !firebaseUid) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400 }
      )
    }

    // Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${new URL(request.url).origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${new URL(request.url).origin}/cancel`,
      customer_email: userEmail,
      metadata: {
        firebaseUid: firebaseUid,
      },
      // サブスクリプション作成時のメタデータ
      subscription_data: {
        metadata: {
          firebaseUid: firebaseUid,
        },
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      status: 200,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}
