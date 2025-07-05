
import { languages } from '@/lib/i18n';
import { redirect } from 'next/navigation';

// This function tells Next.js what the valid `locale` params are.
// By defining these, we prevent the [locale] route from capturing other
// top-level routes like `/buy`, `/tokens`, etc.
export async function generateStaticParams() {
  return languages.map((lang) => ({
    locale: lang.code,
  }));
}

export default function LocalePage() {
  // The i18n logic is handled by a client-side context provider, not by URL path.
  // If a user navigates to a path like `/es`, we redirect them to the homepage,
  // where the language provider will handle setting the correct language.
  redirect('/');
}
