import { NextResponse } from 'next/server';
import { captureOrder } from '@/lib/paypal';

export async function POST(
    request: Request,
    { params }: { params: { orderID: string } }
) {
    try {
        const { orderID } = params;
        if (!orderID) {
             return NextResponse.json({ error: "No order ID provided." }, { status: 400 });
        }
        const capturedOrder = await captureOrder(orderID);
        return NextResponse.json(capturedOrder);
    } catch (error: any) {
        console.error("Failed to capture order:", error.message || error);
        return NextResponse.json({ error: error.message || "Failed to capture order." }, { status: 500 });
    }
}
