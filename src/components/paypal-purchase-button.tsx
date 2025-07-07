
'use client';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/toast";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface PayPalPurchaseButtonProps {
    tier: {
        name: string;
        price: string;
        sku: string;
    };
}

export function PayPalPurchaseButton({ tier }: PayPalPurchaseButtonProps) {
    const [{ isPending }] = usePayPalScriptReducer();
    const { updateProfile } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const createOrder = async () => {
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });
            const order = await response.json();
            if (order.id) {
                return order.id;
            } else {
                toast({ variant: 'destructive', title: 'Error', description: order.error || 'Could not create PayPal order.' });
                return Promise.reject(new Error(order.error || 'Could not create PayPal order.'));
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to create order.' });
            return Promise.reject(error);
        }
    };

    const onApprove = async (data: any) => {
        setIsProcessing(true);
        try {
            const response = await fetch(`/api/orders/${data.orderID}/capture`, {
                method: 'POST',
            });
            const orderDetails = await response.json();
            
            if (response.ok && orderDetails.status === 'COMPLETED') {
                const success = await updateProfile({ pricePlan: tier.name as any });
                if (success) {
                    toast({
                        title: 'Purchase Successful!',
                        description: `You have successfully upgraded to the ${tier.name} plan.`,
                    });
                    router.push('/profile');
                } else {
                     throw new Error('Failed to update user profile after purchase.');
                }
            } else {
                throw new Error(orderDetails.error || 'Payment was not completed successfully.');
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Purchase Failed',
                description: error.message || 'An error occurred during payment processing.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (isPending || isProcessing) {
        return <Button disabled className="w-full h-12"><Loader2 className="h-6 w-6 animate-spin" /></Button>;
    }

    return (
        <PayPalButtons
            className="w-full"
            style={{ layout: "vertical", label: "pay" }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
                 toast({ variant: 'destructive', title: 'PayPal Error', description: 'An error occurred with the PayPal transaction.' });
                 console.error("PayPal Error:", err);
            }}
        />
    );
}
