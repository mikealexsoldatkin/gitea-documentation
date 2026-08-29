import {
  defaultLocale,
  getProduct,
  locales,
  products,
  routePrefix,
  type LocaleId,
  type ProductDef,
  type VersionDef,
} from '@gitea-docs/content-loader';
import type { GiteaMeta } from '../schema';
import { t } from '../config/strings';

export interface PickerItem {
  id: string;
  label: string;
  href: string;
  current: boolean;
}

/** Url of the root of a (product, version, language). */
export function versionHref(product: ProductDef, version: VersionDef, locale: LocaleId): string {
  if (product.externalBaseUrl) return product.externalBaseUrl;
  const prefix = routePrefix(product, version, locale);
  return prefix ? `/${prefix}/` : '/';
}

/**
 * Version picker of the current page. A version is entered at the page with the
 * same route when it exists, at the root of the version otherwise; the check is
 * done client side because the target may live in another build chunk.
 */
export function versionPicker(meta: GiteaMeta): PickerItem[] {
  const product = getProduct(meta.product);
  return product.versions.map((version) => ({
    id: version.id,
    label: version.label,
    href: versionHref(product, version, meta.locale as LocaleId),
    current: version.id === meta.version,
  }));
}

/** Languages the product of the page is published in. */
export function languagePicker(meta: GiteaMeta): PickerItem[] {
  const product = getProduct(meta.product);
  const version = product.versions.find((candidate) => candidate.id === meta.version);
  if (!version) return [];
  return product.locales.map((locale) => ({
    id: locale,
    label: locales[locale].label,
    href: versionHref(product, version, locale),
    current: locale === meta.locale,
  }));
}

/** Top level navigation, one entry per product. */
export function productNav(meta: GiteaMeta | undefined): PickerItem[] {
  return products.map((product) => {
    const locale = (meta?.locale as LocaleId | undefined) ?? defaultLocale;
    const supported = product.locales.includes(locale) ? locale : defaultLocale;
    const version =
      product.versions.find((candidate) => candidate.latest) ?? product.versions[0];
    return {
      id: product.id,
      label: product.label,
      href: version ? versionHref(product, version, supported) : product.externalBaseUrl ?? '/',
      current: product.id === meta?.product,
    };
  });
}

/** Banner shown on every page of a development or an outdated version. */
export function versionBanner(meta: GiteaMeta): string | undefined {
  const product = getProduct(meta.product);
  const version = product.versions.find((candidate) => candidate.id === meta.version);
  if (!version) return undefined;
  const latest = product.versions.find((candidate) => candidate.latest);
  const strings = t(meta.locale);
  const latestHref = latest ? versionHref(product, latest, meta.locale as LocaleId) : '/';
  if (version.banner === 'unreleased') return strings.unreleased(latestHref);
  if (latest && !version.latest && version.id !== 'develop') {
    return strings.outdated(version.label, latestHref);
  }
  return undefined;
}
