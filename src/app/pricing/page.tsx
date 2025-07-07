
'use client';

import { Check, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { PayPalPurchaseButton } from '@/components/paypal-purchase-button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const tiers = [
  {
    name: 'Free',
    price: '0.00',
    sku: 'CRYP-FREE',
    description: 'Get started with our basic features.',
    features: [
      'Hide small balances',
      'Hide unknown tokens',
      'AI Chatbot',
    ],
    isMostPopular: false,
  },
  {
    name: 'Basic',
    price: '9.99',
    sku: 'CRYP-BASIC',
    description: 'Unlock more powerful AI tools.',
    features: [
      'Hide small balances',
      'Hide unknown tokens',
      'AI Chatbot basic',
      'Reputation alert basic',
    ],
    isMostPopular: true,
  },
  {
    name: 'Advanced',
    price: '19.99',
    sku: 'CRYP-ADV',
    description: 'For power users and professionals.',
    features: [
      'Hide small balances',
      'Hide unknown tokens',
      'AI Chatbot Advanced',
      'Reputation alert Advanced',
    ],
    isMostPopular: false,
  },
];

const planDetails = [
    {
        title: "Free",
        features: [
            '"Hide small balances" provides a simple toggle on/ off feature.',
            '"Hide unknown tokens" provides a simple toggle on/ off feature.',
            '"AI Chatbot basic" provides features such as chatbot prompts and replies.',
        ]
    },
    {
        title: "Basic",
        features: [
            '"Hide small balances" provides a simple toggle on/ off feature.',
            '"Hide unknown tokens" provides a simple toggle on/ off feature.',
            '"AI Chatbot basic" provides features such as chatbot prompts and replies.',
            '"Reputation alert basic" provides information on real world scams and scandals activities from reputable sources.',
        ]
    },
    {
        title: "Advanced",
        features: [
            '"Hide small balances" provides a simple toggle on/ off feature.',
            '"Hide unknown tokens" provides a simple toggle on/ off feature.',
            '"AI Chatbot advanced" provides features such as chatbot multilingual prompts and replies in text and speech.',
            '"Reputation alert advanced" provides information on real world scams and scandals activities from reputable sources in multilingual text and speech.',
        ]
    }
];

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';


export default function PricingPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    document.title = t('PageTitles.pricing');
  }, [t]);

   const getButtonState = (tierName: 'Free' | 'Basic' | 'Advanced') => {
    if (!isAuthenticated || !user) {
      if (tierName === 'Free') return { text: "Get Started", disabled: false, isCurrent: false, isLogin: true, action: 'register' };
      return { text: "Login to Upgrade", disabled: false, isCurrent: false, isLogin: true, action: 'login' };
    }
    if (user.pricePlan === 'Administrator') return { text: "Admin Access", disabled: true, isCurrent: true };
    if (user.pricePlan === tierName) return { text: "Current Plan", disabled: true, isCurrent: true };
    if (user.pricePlan === 'Advanced' && tierName === 'Basic') return { text: "Subscribed", disabled: true, isCurrent: false };
    if (user.pricePlan === 'Basic' && tierName === 'Free') return { text: "N/A", disabled: true, isCurrent: false };

    return { text: `Upgrade to ${tierName}`, disabled: false, isCurrent: false, isPurchase: true };
  }

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
      <div className="container flex-1 flex flex-col items-center py-12">
          <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
              <p className="mt-2 text-lg text-muted-foreground">
              Choose the plan that's right for you.
              </p>
          </div>
          {PAYPAL_CLIENT_ID === 'sb' && (
             <Alert variant="destructive" className="max-w-5xl mb-8 border-yellow-500/50 text-yellow-500 [&>svg]:text-yellow-500">
                <Info className="h-4 w-4" />
                <AlertTitle>Developer Notice: Sandbox Mode</AlertTitle>
                <AlertDescription>
                The PayPal client ID is not configured. The payment buttons are running in a sandbox test mode. To use your own PayPal sandbox, set the <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> environment variable.
                </AlertDescription>
            </Alert>
          )}
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
              {tiers.map((tier) => {
                  const buttonState = getButtonState(tier.name as any);
                  return (
                      <Card
                          key={tier.name}
                          className={cn(
                          'flex flex-col',
                          tier.isMostPopular ? 'border-primary ring-2 ring-primary shadow-lg' : ''
                          )}
                      >
                          <CardHeader className="relative text-center">
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
                          <CardContent className="flex-1 flex flex-col gap-6 items-center">
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
                          <CardFooter>
                              {buttonState.isCurrent || (buttonState.disabled && !buttonState.isLogin) ? (
                                  <Button disabled className="w-full">{buttonState.text}</Button>
                              ) : buttonState.isLogin ? (
                                  <Link href={buttonState.action === 'register' ? '/register' : '/login'} className="w-full">
                                      <Button className="w-full">{buttonState.text}</Button>
                                  </Link>
                              ) : buttonState.isPurchase ? (
                                  <PayPalPurchaseButton tier={tier} />
                              ) : (
                                  <Button className="w-full">{buttonState.text}</Button>
                              )}
                          </CardFooter>
                      </Card>
                  )
              })}
          </div>

          <div className="w-full max-w-5xl mt-16">
              <h2 className="text-3xl font-bold text-center mb-8">Plan Details</h2>
              <Accordion type="single" collapsible className="w-full">
                  {planDetails.map((plan) => (
                      <AccordionItem key={plan.title} value={plan.title}>
                          <AccordionTrigger className="text-xl">{plan.title} Plan Features</AccordionTrigger>
                          <AccordionContent>
                              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                                  {plan.features.map((feature, index) => (
                                      <li key={index}>{feature}</li>
                                  ))}
                              </ul>
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
          </div>
      </div>
    </PayPalScriptProvider>
  );
}
