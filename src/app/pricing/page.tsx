
'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with our basic features.',
    features: [
      'AI Chatbot',
      'Hide small balances',
      'Hide unknown tokens',
    ],
    buttonText: 'Current Plan',
    isMostPopular: false,
    isCurrent: true,
  },
  {
    name: 'Basic',
    price: '$9.99',
    description: 'Unlock more powerful AI tools.',
    features: [
      'AI Chatbot basic',
      'Reputation alert basic',
      'Hide small balances',
      'Hide unknown tokens',
    ],
    buttonText: 'Buy Now',
    isMostPopular: true,
  },
  {
    name: 'Advanced',
    price: '$19.99',
    description: 'For power users and professionals.',
    features: [
      'AI Chatbot advanced',
      'Reputation alert advance',
      'Hide small balances',
      'Hide unknown tokens',
    ],
    buttonText: 'Buy Now',
    isMostPopular: false,
  },
];

export default function PricingPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('PageTitles.pricing');
  }, [t]);

  return (
    <div className="container flex-1 flex flex-col items-center py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Choose the plan that's right for you.
        </p>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier) => (
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
                    {tier.price}
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
              <Button 
                className="w-full" 
                variant={tier.isMostPopular ? 'default' : 'secondary'}
                disabled={tier.isCurrent}
              >
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
