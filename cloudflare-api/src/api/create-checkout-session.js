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

export async function handleCreateCheckoutSession(context) {
  try {
    const { STRIPE_SECRET_KEY, DOMAIN } = context.env;
    const body = await context.request.json();

    console.log('Processing checkout request:', body);

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Extract numeric price from string like "From $35" or "Long – $45"
    const priceMatch = body.price.match(/\$(\d+)/);
    const basePrice = priceMatch ? Number(priceMatch[1]) : 50;
    
    // Calculate deposit based on the new brackets
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

    console.log('Stripe response:', session);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (err) {
    console.error('Checkout session error:', err);
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