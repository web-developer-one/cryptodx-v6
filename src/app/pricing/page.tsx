
'use client';

import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const tiers = [
  {
    name: 'Free',
    price: '0.00',
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
                        {/* Get Started Button Removed */}
                    </CardFooter>
                </Card>
            ))}
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
  );
}
