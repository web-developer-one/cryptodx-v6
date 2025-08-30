
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/use-language";


export function Faq() {
  const { t } = useLanguage();

  const faqs = [
    { question: t('Faq.q1'), answer: t('Faq.a1') },
    { question: t('Faq.q2'), answer: t('Faq.a2') },
    { question: t('Faq.q3'), answer: t('Faq.a3') },
    { question: t('Faq.q4'), answer: t('Faq.a4') },
    { question: t('Faq.q5'), answer: t('Faq.a5') },
  ];


  return (
    <section 
      className="w-full py-12 bg-white dark:bg-background flex justify-center border-t relative"
      style={{
        backgroundImage: `url('/mockup-featuring-two-iphones-x-floating-transparent.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="container max-w-5xl px-4 md:px-6 relative z-10">
        <h2 className="text-3xl font-bold text-center mb-8">
          {t('Faq.title')}
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
