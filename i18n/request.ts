import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'de', 'es', 'it'];

// next-intl v4: the config module moved to `i18n/request.ts` and the locale is
// read from the `requestLocale` promise (the old top-level `locale` param was
// removed). The resolved locale must now also be returned in the config object.
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;

  // Preserve the original behaviour: reject an unknown locale rather than
  // silently coercing it. `next-intl` only calls this with a locale matched by
  // the middleware matcher, so a missing value means we are outside the
  // `[locale]` segment and there is nothing to render.
  if (!requested || !locales.includes(requested as any)) notFound();

  const locale = requested as string;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
