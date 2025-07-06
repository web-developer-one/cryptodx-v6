
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
  // This page is not rendered. It immediately redirects to the homepage.
  // The language preference is handled by a client-side context and localStorage,
  // not by the URL path. This route exists to prevent 404s on paths like /es or /fr.
  redirect('/');
}
