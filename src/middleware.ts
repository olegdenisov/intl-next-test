import {match} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {NextRequest, NextResponse} from 'next/server';
// import createMiddleware from 'next-intl/middleware';
import {i18Config} from './i18n/routing';
// import {routing, i18Config} from './i18n/routing';
import type {I18nConfig} from './i18n/routing';

// export default createMiddleware(routing);

function getLocale(request: NextRequest, i18nConfig: I18nConfig): string {
  const {defaultLocale, locales} = i18nConfig;

  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({headers: negotiatorHeaders}).languages(
    locales
  );

  return match(languages, locales, defaultLocale);
}

export function middleware(request: NextRequest) {
  let response;
  let nextLocale;

  const {defaultLocale, locales} = i18Config;

  const pathname = request.nextUrl.pathname;

  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathLocale) {
    const isDefaultLocale = pathLocale === defaultLocale;
    if (isDefaultLocale) {
      let pathWithoutLocale = pathname.slice(`/${pathLocale}`.length) || '/';
      if (request.nextUrl.search) pathWithoutLocale += request.nextUrl.search;

      response = NextResponse.redirect(new URL(pathWithoutLocale, request.url));
    }

    nextLocale = pathLocale;
  } else {
    const isFirstVisit = !request.cookies.has('NEXT_LOCALE');

    const locale = isFirstVisit ? getLocale(request, i18Config) : defaultLocale;

    let newPath = `${locale}${pathname}`;
    if (request.nextUrl.search) newPath += request.nextUrl.search;

    response =
      locale === defaultLocale
        ? NextResponse.rewrite(new URL(newPath, request.url))
        : NextResponse.redirect(new URL(newPath, request.url));
    nextLocale = locale;
  }

  if (!response) response = NextResponse.next();

  if (nextLocale) response.cookies.set('NEXT_LOCALE', nextLocale);

  return response;
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    // '/(de|en|ru)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
