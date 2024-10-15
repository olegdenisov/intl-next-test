import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';

export const i18Config = {
  locales: ['ru', 'en', 'de'],
  defaultLocale: 'ru'
};

export const routing = defineRouting({
  ...i18Config,
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
      domain: `${process.env.RUSSIAN_URL}`,
      defaultLocale: 'ru'
    },
    {
      domain: `${process.env.GLOBAL_URL}`,
      locales: ['en', 'de'],
      defaultLocale: 'en'
    }
  ]
});

export type I18nConfig = typeof i18Config;
export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];

export const {Link, getPathname, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation(routing);
