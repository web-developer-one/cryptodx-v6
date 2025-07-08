
'use server';

import paypal from '@paypal/checkout-server-sdk';

export async function createOrder(tier: { name: string, price: string, sku: string }) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret || clientId === 'sb') {
        const errorMessage = 'PayPal client ID or secret is not configured for server-side operations. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your environment.';
        console.error(errorMessage);
        return { error: errorMessage };
    }
    
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);

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
                name: `${tier.name} Plan - CryptoDx`,
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
        return { id: order.result.id };
    } catch (err: any) {
        let errorMessage = "Failed to create PayPal order.";
        if (err.statusCode && err.message) {
             try {
                const errorDetails = JSON.parse(err.message);
                if (errorDetails.details && errorDetails.details.length > 0) {
                    errorMessage = `${errorDetails.details[0].issue}: ${errorDetails.details[0].description}`;
                } else if (errorDetails.message) {
                    errorMessage = errorDetails.message;
                }
             } catch (e) {
                 errorMessage = err.message;
             }
        }
        console.error("Error creating PayPal order:", errorMessage);
        return { error: errorMessage };
    }
}

export async function captureOrder(orderId: string) {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

     if (!clientId || !clientSecret || clientId === 'sb') {
        const errorMessage = 'PayPal client ID or secret is not configured for server-side operations.';
        console.error(errorMessage);
        return { error: errorMessage };
    }
    
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        return capture.result;
    } catch (err: any) {
        let errorMessage = "Failed to capture PayPal order.";
         if (err.statusCode && err.message) {
             try {
                const errorDetails = JSON.parse(err.message);
                if (errorDetails.details && errorDetails.details.length > 0) {
                    errorMessage = `${errorDetails.details[0].issue}: ${errorDetails.details[0].description}`;
                } else if (errorDetails.message) {
                    errorMessage = errorDetails.message;
                }
             } catch (e) {
                 errorMessage = err.message;
             }
        }
        console.error("Error capturing PayPal order:", errorMessage);
        return { error: errorMessage };
    }
}
