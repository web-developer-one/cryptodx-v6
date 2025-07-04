
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, CheckCircle, Wallet } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function HowToExchange() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      step: "Step 1",
      title: t('HowToExchange.step1Title'),
      description: t('HowToExchange.step1Desc'),
    },
    {
      icon: <ArrowRightLeft className="h-10 w-10 text-primary" />,
      step: "Step 2",
      title: t('HowToExchange.step2Title'),
      description: t('HowToExchange.step2Desc'),
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
      step: "Step 3",
      title: t('HowToExchange.step3Title'),
      description: t('HowToExchange.step3Desc'),
    },
  ];

  return (
    <section className="w-full py-12 bg-background flex justify-center">
      <div className="container max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t('HowToExchange.title')}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="border border-primary/20 shadow-lg">
              <CardHeader className="items-center text-center">
                <div className="flex items-center gap-3">
                    {step.icon}
                    <p className="text-2xl font-bold text-primary">{step.step}</p>
                </div>
                <CardTitle className="mt-4">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
