import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/paypal';

export async function POST(request: Request) {
    try {
        const { tier } = await request.json();
        if (!tier || !tier.price || !tier.name || !tier.sku) {
            return NextResponse.json({ error: "Invalid tier information provided." }, { status: 400 });
        }
        const order = await createOrder(tier);
        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Failed to create order:", error);
        return NextResponse.json({ error: error.message || "Failed to create order." }, { status: 500 });
    }
}
