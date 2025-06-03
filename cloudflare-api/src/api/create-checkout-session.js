import Stripe from 'stripe';

function calculateDepositPercentage(basePrice) {
  if (basePrice <= 10) return 100;
  if (basePrice <= 49) return 50;
  if (basePrice <= 99) return 45;
  if (basePrice <= 149) return 40;
  if (basePrice <= 199) return 35;
  if (basePrice <= 249) return 30;
  return 30; // Default to 30% for any higher amount
}

export async function createCheckoutSession(request, env) {
  console.log("✅ Running latest create-checkout-session");

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { STRIPE_SECRET_KEY, DOMAIN } = env;
    const body = await request.json();

    console.log('📦 Received booking data:', body);

    if (!body.price || !body.service) {
      return new Response(JSON.stringify({ error: 'Missing required fields: price or service' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Safe match
    const priceMatch = (body.price || '').match(/\$(\d+)/);
    if (!priceMatch) {
      return new Response(JSON.stringify({ error: 'Invalid price format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const basePrice = Number(priceMatch[1]);

    // Calculate deposit based on brackets
    const depositPercentage = calculateDepositPercentage(basePrice);
    const depositAmount = Math.floor(basePrice * (depositPercentage / 100) * 100); // Convert to cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `${body.service} – ${body.option || 'Standard'} (${depositPercentage}% deposit)`,
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/canceled`,
      metadata: {
        ...body,
        depositPercentage,
        fullPrice: basePrice,
      },
    });

    console.log('✅ Stripe session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );

  } catch (err) {
    console.error('❌ Checkout session error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}
