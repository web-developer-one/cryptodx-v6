import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is CryptoDx?",
    answer: "CryptoDx is a decentralized exchange (DEX) platform that allows users to trade cryptocurrencies directly from their wallets without the need for a central intermediary. It provides a secure and transparent way to swap tokens.",
  },
  {
    question: "Which wallets are supported?",
    answer: "We support a variety of popular Web3 wallets, including MetaMask, Coinbase Wallet, and any wallet that supports the WalletConnect protocol. This ensures you can use your preferred wallet to interact with our platform.",
  },
  {
    question: "Are my funds safe?",
    answer: "Yes, your funds are secure. As a decentralized platform, you are always in control of your private keys and your assets. We never take custody of your funds. All transactions are executed via smart contracts on the blockchain.",
  },
  {
    question: "How are the exchange rates determined?",
    answer: "Exchange rates are determined by automated market makers (AMMs) based on the liquidity pools for the token pair you are swapping. Prices can fluctuate based on supply and demand dynamics within the pools.",
  },
  {
    question: "Are there any fees?",
    answer: "There are two types of fees: a small platform fee for each swap, and a network fee (gas fee) required by the blockchain to process the transaction. All fees are clearly displayed before you confirm a transaction.",
  },
];

export function Faq() {
  return (
    <section className="w-full py-12 bg-white dark:bg-background flex justify-center border-t">
      <div className="container max-w-5xl px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
