
'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { PayPalScriptProvider, PayPalButtons, ReactPayPalScriptOptions } from "@paypal/react-paypal-js";
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { PricingPlan } from '@/lib/types';
import { useRouter } from 'next/navigation';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AfJ7bhG_VDx0Z2o_EtExWS_Ps2eUiZKS0lABsQCbQC02V-c_Z59cOw8xq3yNqO763BAKwSRAf8n7fob8";

const paypalOptions: ReactPayPalScriptOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
};

const tiers: { name: PricingPlan, price: string, sku: string, description: string, features: string[], isMostPopular: boolean }[] = [
  {
    name: 'Free',
    price: '0.00',
    sku: 'crypto-swap-free',
    description: 'Get started with our basic features.',
    features: [
      'AI Chatbot',
      'Hide small balances',
      'Hide unknown tokens',
    ],
    isMostPopular: false,
  },
  {
    name: 'Basic',
    price: '9.99',
    sku: 'crypto-swap-basic',
    description: 'Unlock more powerful AI tools.',
    features: [
      'AI Chatbot basic',
      'Reputation alert basic',
      'Hide small balances',
      'Hide unknown tokens',
    ],
    isMostPopular: true,
  },
  {
    name: 'Advanced',
    price: '19.99',
    sku: 'crypto-swap-advanced',
    description: 'For power users and professionals.',
    features: [
      'AI Chatbot advanced',
      'Reputation alert advance',
      'Hide small balances',
      'Hide unknown tokens',
    ],
    isMostPopular: false,
  },
];

export default function PricingPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const router = useRouter();


  useEffect(() => {
    document.title = t('PageTitles.pricing');
  }, [t]);

  if (!PAYPAL_CLIENT_ID) {
    return (
        <div className="container flex-1 flex flex-col items-center py-12">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
             </div>
             <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>PayPal Not Configured</AlertTitle>
                <AlertDescription>
                    The PayPal Client ID is missing. Please add NEXT_PUBLIC_PAYPAL_CLIENT_ID to your environment variables.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <PayPalScriptProvider options={paypalOptions}>
        <div className="container flex-1 flex flex-col items-center py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                Choose the plan that's right for you.
                </p>
            </div>
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.filter(tier => tier.name !== 'Administrator').map((tier) => {
                    const isCurrentPlan = user?.pricingPlan === tier.name || (!user && tier.name === 'Free');

                    return (
                        <Card
                            key={tier.name}
                            className={cn(
                            'flex flex-col',
                            tier.isMostPopular ? 'border-primary ring-2 ring-primary shadow-lg' : ''
                            )}
                        >
                            <CardHeader className="relative">
                            {tier.isMostPopular && (
                                <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                                    <div className="bg-primary text-primary-foreground px-3 py-1 text-sm font-semibold rounded-full">
                                        Most Popular
                                    </div>
                                </div>
                            )}
                            <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-6">
                                <div className="text-4xl font-bold">
                                    ${tier.price}
                                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                                </div>
                            <ul className="space-y-3">
                                {tier.features.map((feature) => (
                                <li key={feature} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                                ))}
                            </ul>
                            </CardContent>
                            <CardFooter className={cn(
                                "flex flex-col min-h-[68px]",
                                !isCurrentPlan && tier.name !== 'Free' && user && "px-0"
                            )}>
                                { isCurrentPlan ? (
                                    <Button 
                                        className="w-full" 
                                        variant={tier.isMostPopular ? 'default' : 'secondary'}
                                        disabled
                                    >
                                        Current Plan
                                    </Button>
                                ) : tier.name === 'Free' ? (
                                    <Button className="w-full" disabled>
                                        Default Plan
                                    </Button>
                                ) : !user ? (
                                    <Button className="w-full" onClick={() => router.push('/login')}>
                                        Login to Purchase
                                    </Button>
                                ) : (
                                     <PayPalButtons
                                        style={{ layout: "vertical", label: "buynow", height: 44, color: 'gold' }}
                                        createOrder={async () => {
                                            try {
                                                const response = await fetch("/api/orders", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ tier }),
                                                });
                                    
                                                const orderData = await response.json();
                                    
                                                if (!response.ok) {
                                                    throw new Error(orderData.error || `Server responded with ${response.status}`);
                                                }

                                                if (orderData.id) {
                                                    return orderData.id;
                                                } else {
                                                    throw new Error("Could not create order.");
                                                }
                                            } catch (error: any) {
                                                console.error(error);
                                                toast({ variant: "destructive", title: "Error", description: `Could not initiate PayPal Checkout: ${error.message}` });
                                                return "";
                                            }
                                        }}
                                        onApprove={async (data) => {
                                           try {
                                                const response = await fetch(`/api/orders/${data.orderID}/capture`, { method: "POST" });
                                                const orderData = await response.json();
                                                
                                                if (!response.ok) {
                                                    throw new Error(orderData.error || `Server responded with ${response.status}`);
                                                }

                                                const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0];
                                                toast({ title: "Payment Successful!", description: `Transaction ${transaction.status}: ${transaction.id}` });
                                                
                                                if (tier.name === 'Basic' || tier.name === 'Advanced') {
                                                    await updateProfile({ pricingPlan: tier.name });
                                                    toast({ title: "Plan Updated!", description: `You are now on the ${tier.name} plan.` });
                                                }
                                                
                                                console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                                                return;
                                            } catch (error: any) {
                                                console.error(error);
                                                toast({ variant: "destructive", title: "Error", description: `Your transaction could not be processed: ${error.message}` });
                                            }
                                        }}
                                        onError={(err) => {
                                             console.error("PayPal Checkout onError", err);
                                             toast({ variant: "destructive", title: "Error", description: "An error occurred during the transaction. Please try again." });
                                        }}
                                    />
                                )}
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    </PayPalScriptProvider>
  );
}
