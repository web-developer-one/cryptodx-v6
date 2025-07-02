import React from 'react';

// This layout is simplified to just pass children through.
// The root layout at src/app/layout.tsx now handles the full page structure.
export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
