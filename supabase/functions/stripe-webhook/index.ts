// Supabase Edge Function: Handle Stripe Webhooks
// Deploy with: supabase functions deploy stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map Stripe price IDs to tier names
const PRICE_TO_TIER: Record<string, 'starter' | 'growth' | 'scale'> = {
  [Deno.env.get('STRIPE_PRICE_STARTER') || '']: 'starter',
  [Deno.env.get('STRIPE_PRICE_GROWTH') || '']: 'growth',
  [Deno.env.get('STRIPE_PRICE_SCALE') || '']: 'scale',
};

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.subscription
    ? (await stripe.subscriptions.retrieve(session.subscription as string)).metadata.supabase_user_id
    : session.metadata?.supabase_user_id;

  if (!userId) {
    console.error('No user ID found in checkout session');
    return;
  }

  // Get subscription details
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const priceId = subscription.items.data[0]?.price.id;
    const tier = PRICE_TO_TIER[priceId] || 'starter';

    await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
      })
      .eq('id', userId);

    console.log(`User ${userId} subscribed to ${tier}`);
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single();

    if (!profile) {
      console.error('No user found for subscription');
      return;
    }
  }

  const priceId = subscription.items.data[0]?.price.id;
  const tier = PRICE_TO_TIER[priceId] || 'starter';

  // Map Stripe status to our status
  let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active';
  if (subscription.status === 'canceled') status = 'canceled';
  else if (subscription.status === 'past_due') status = 'past_due';
  else if (subscription.status === 'trialing') status = 'trialing';

  const updateQuery = userId
    ? supabase.from('profiles').update({ subscription_tier: tier, subscription_status: status }).eq('id', userId)
    : supabase.from('profiles').update({ subscription_tier: tier, subscription_status: status }).eq('stripe_customer_id', subscription.customer as string);

  await updateQuery;

  console.log(`Subscription updated: tier=${tier}, status=${status}`);
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Downgrade to free tier
  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
    })
    .eq('stripe_customer_id', customerId);

  console.log(`Subscription canceled for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await supabase
    .from('profiles')
    .update({ subscription_status: 'past_due' })
    .eq('stripe_customer_id', customerId);

  console.log(`Payment failed for customer ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Ensure status is active after successful payment
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('stripe_customer_id', customerId)
    .single();

  if (profile?.subscription_status === 'past_due') {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('stripe_customer_id', customerId);

    console.log(`Payment succeeded, status restored for customer ${customerId}`);
  }
}
