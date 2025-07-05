'use server';

import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error('PayPal client ID or secret is not configured in .env.local');
}

// This is a weird workaround for a Next.js issue with the PayPal SDK.
// It ensures that we don't try to use a non-existent `performance` object in the server environment.
const environment = process.env.NODE_ENV === 'production' 
    ? new paypal.core.LiveEnvironment(clientId!, clientSecret!) 
    : new paypal.core.SandboxEnvironment(clientId!, clientSecret!);

const client = new paypal.core.PayPalHttpClient(environment);

export async function createOrder(tier: { name: string, price: string, sku: string }) {
    if (!clientId || !clientSecret) {
        throw new Error('PayPal environment variables not set.');
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: tier.price,
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: tier.price
                    }
                }
            },
            items: [{
                name: `${tier.name} Plan - Crypto Swap`,
                unit_amount: {
                    currency_code: 'USD',
                    value: tier.price
                },
                quantity: '1',
                sku: tier.sku,
                description: `Subscription to the ${tier.name} plan.`
            }]
        }]
    });

    try {
        const order = await client.execute(request);
        return {
            id: order.result.id,
        };
    } catch (err) {
        console.error("Error creating PayPal order:", err);
        throw new Error("Failed to create PayPal order.");
    }
}

export async function captureOrder(orderId: string) {
     if (!clientId || !clientSecret) {
        throw new Error('PayPal environment variables not set.');
    }
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        return capture.result;
    } catch (err) {
        console.error("Error capturing PayPal order:", err);
        throw new Error("Failed to capture PayPal order.");
    }
}
