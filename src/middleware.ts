import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh-CN', 'ko', 'ar', 'hi', 'bn', 'id', 'nl', 'tr', 'pl', 'sv', 'vi', 'th', 'el', 'he', 'cs', 'ro', 'uk'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|es|fr|it|pt|ru|ja|zh-CN|ko|ar|hi|bn|id|nl|tr|pl|sv|vi|th|el|he|cs|ro|uk)/:path*']
};
