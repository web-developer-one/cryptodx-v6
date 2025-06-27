import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, CheckCircle, Wallet } from "lucide-react";

const steps = [
  {
    icon: <Wallet className="h-10 w-10 text-primary" />,
    title: "Step 1: Connect Your Wallet",
    description: "Securely connect your decentralised wallet to our platform. We support a wide variety of wallets for your convenience.",
  },
  {
    icon: <ArrowRightLeft className="h-10 w-10 text-primary" />,
    title: "Step 2: Select Tokens & Amount",
    description: "Choose the cryptocurrency you want to trade and the one you wish to receive. Enter the amount for the exchange.",
  },
  {
    icon: <CheckCircle className="h-10 w-10 text-primary" />,
    title: "Step 3: Confirm & Swap",
    description: "Review the transaction details, including rates and fees. Confirm the swap and watch the new tokens appear in your wallet.",
  },
];

export function HowToExchange() {
  return (
    <section className="w-full py-12 bg-secondary/50 flex justify-center">
      <div className="container max-w-7xl px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          How to Exchange Cryptocurrency
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col items-center text-center">
              <CardHeader className="items-center">
                {step.icon}
                <CardTitle className="mt-4">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
