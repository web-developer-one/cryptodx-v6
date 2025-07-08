'use client';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import type { OnApproveData, CreateOrderActions, OnApproveActions } from "@paypal/paypal-js";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface PayPalPurchaseButtonProps {
    tier: {
        name: string;
        price: string;
        sku: string;
    };
}

// Check if we are in sandbox mode. This is true if the public key is missing or is the default 'sb'.
const IS_SANDBOX = !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === 'sb';


export function PayPalPurchaseButton({ tier }: PayPalPurchaseButtonProps) {
    const [{ isPending }] = usePayPalScriptReducer();
    const { updateProfile } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    // --- PRODUCTION FLOW (Server-Side) ---
    const createOrderServer = async (): Promise<string> => {
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
                toast({ variant: 'destructive', title: 'Error Creating Order', description: order.error || 'Could not create PayPal order.' });
                return Promise.reject(new Error(order.error || 'Could not create PayPal order.'));
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not connect to the server to create an order.' });
            return Promise.reject(error);
        }
    };

    const onApproveServer = async (data: OnApproveData): Promise<void> => {
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
    
    // --- SANDBOX FLOW (Client-Side Only) ---
    const createOrderClient = (data: Record<string, unknown>, actions: CreateOrderActions) => {
        console.log("Creating order on client-side (sandbox mode).");
        return actions.order.create({
            purchase_units: [{
                description: `CryptoDx ${tier.name} Plan (Sandbox Test)`,
                amount: {
                    currency_code: 'USD',
                    value: tier.price
                }
            }]
        });
    };

    const onApproveClient = (data: OnApproveData, actions: OnApproveActions) => {
        console.log("Approving order on client-side (sandbox mode).", data);
        if (!actions.order) {
            return Promise.reject(new Error("Order actions not available in onApproveClient"));
        }
        return actions.order.capture().then((details) => {
            console.log("Sandbox transaction details:", details);
             toast({
                title: 'Sandbox Purchase Complete!',
                description: `Test transaction for the ${tier.name} plan was successful. This does not update your profile.`,
            });
        });
    };

    // Render a loading state while the PayPal script or our processing is running.
    if (isPending || isProcessing) {
        return <Button disabled className="w-full h-12"><Loader2 className="h-6 w-6 animate-spin" /></Button>;
    }

    return (
        <PayPalButtons
            key={IS_SANDBOX ? 'sandbox' : 'production'} // Force re-render if the mode changes
            className="w-full"
            style={{ layout: "vertical", label: "pay" }}
            createOrder={IS_SANDBOX ? createOrderClient : createOrderServer}
            onApprove={IS_SANDBOX ? onApproveClient : onApproveServer}
            onError={(err) => {
                 toast({ variant: 'destructive', title: 'PayPal Error', description: 'An error occurred with the PayPal transaction.' });
                 console.error("PayPal Error:", err);
            }}
        />
    );
}
