import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'en', 'de'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
    '/pathnames': {
      en: '/pathnames',
      ru: '/pathnames',
      de: '/pfadnamen'
    }
  },
  domains: [
    {
      domain: 'intl-next-test.vercel.app',
      defaultLocale: 'ru'
    },
    {
      domain: 'intl-next-test-global.vercel.app',
      locales: ['en', 'de'],
      defaultLocale: 'en'
    }
  ]
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const {Link, getPathname, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation(routing);
