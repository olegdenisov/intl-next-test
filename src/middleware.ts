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
  const requestURL = new URL(request.url);

  const pathLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathLocale) {
    const isDefaultLocale = pathLocale === defaultLocale;
    const pathWithoutLocale = pathname.slice(`/${pathLocale}`.length) || '/';
    let path = isDefaultLocale ? pathWithoutLocale : pathname;
    const targetUrl = new URL(
      pathLocale === 'ru'
        ? `${request.nextUrl.protocol}//${process.env.RUSSIAN_URL}${request.nextUrl.pathname}` ||
          request.url
        : `${request.nextUrl.protocol}//${process.env.GLOBAL_URL}${request.nextUrl.pathname}` ||
          request.url
    );

    if (request.nextUrl.search) path += request.nextUrl.search;

    if (isDefaultLocale) {
      response = NextResponse.redirect(new URL(path, targetUrl));
    } else {
      response =
        requestURL.hostname === targetUrl.hostname
          ? NextResponse.rewrite(targetUrl)
          : NextResponse.redirect(targetUrl);
    }

    nextLocale = pathLocale;
  } else {
    const isFirstVisit = !request.cookies.has('NEXT_LOCALE');

    const locale = isFirstVisit ? getLocale(request, i18Config) : defaultLocale;
    const targetUrl =
      locale === 'ru'
        ? `${request.nextUrl.protocol}//${process.env.RUSSIAN_URL}${request.nextUrl.pathname}` ||
          request.url
        : `${request.nextUrl.protocol}://${process.env.GLOBAL_URL}/${request.nextUrl.pathname}` ||
          request.url;

    let newPath = `${locale}${pathname}`;
    if (request.nextUrl.search) newPath += request.nextUrl.search;

    response =
      locale === defaultLocale
        ? NextResponse.rewrite(new URL(newPath, targetUrl))
        : NextResponse.redirect(new URL(newPath, targetUrl));
    nextLocale = locale;
  }

  if (!response) {
    response = NextResponse.next();
  }

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

// const nextHostName = request.nextUrl.hostname;
// const local = request.nextUrl.locale;
// console.log('===============start=================');
// console.log({
//   pathname,
//   pathLocale,
//   isDefaultLocale: pathLocale === defaultLocale,
//   locale: local,
//   domainLocale: request.nextUrl.domainLocale,
//   nextHostName,
//   host: request.nextUrl.host,
//   requestUrl: request.url
// });

// console.log('==================0=================');
// console.log({
//   isDefaultLocale,
//   pathWithoutLocale,
//   path,
//   url: new URL(path, targetUrl),
//   ruUrl: `${request.nextUrl.protocol}//${process.env.RUSSIAN_URL}${request.nextUrl.pathname}`,
//   globalUrl: `${request.nextUrl.protocol}//${process.env.GLOBAL_URL}${request.nextUrl.pathname}`,
//   targetUrl
// });

// console.log('==================1.5=================');
// console.log({
//   cond: requestURL.hostname === nextHostName,
//   targetUrl,
//   requestURL,
//   nextHostName
// });

// console.log('==================1=================');
// console.log({
//   locale,
//   newPath,
//   nextUrlPathname: request.nextUrl.pathname,
//   ru: `${request.nextUrl.protocol}://${process.env.RUSSIAN_URL}${request.nextUrl.pathname}`,
//   // url: new URL(newPath, targetUrl),
//   targetUrl
// });
