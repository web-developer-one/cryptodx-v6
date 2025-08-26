
import React from 'react';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    // The language is now passed via params and handled by the providers
    // No need to render anything special here.
    <>{children}</>
  );
}
