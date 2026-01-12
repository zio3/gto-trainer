import { useState, useEffect, useCallback } from 'react';
import ja from '@/locales/ja.json';
import en from '@/locales/en.json';

export type Locale = 'ja' | 'en';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = typeof ja;

const translations: Record<Locale, Translations> = { ja, en };

// ブラウザの言語設定から言語を判定（日本語以外は英語）
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';

  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';
  return browserLang.startsWith('ja') ? 'ja' : 'en';
}

// ネストされたキーから値を取得（例: "app.title"）
function getNestedValue(obj: TranslationValue, path: string): string | undefined {
  const keys = path.split('.');
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as { [key: string]: TranslationValue })[key];
  }

  return typeof current === 'string' ? current : undefined;
}

// 変数を置換（例: "{count}" -> "5"）
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;

  return text.replace(/\{(\w+)\}/g, (_, key) => {
    return vars[key]?.toString() ?? `{${key}}`;
  });
}

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('en');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setLocale(detectLocale());
    setIsHydrated(true);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[locale], key);
    if (!translation) {
      // フォールバック: 英語 → キーそのまま
      const fallback = getNestedValue(translations.en, key);
      return interpolate(fallback ?? key, vars);
    }
    return interpolate(translation, vars);
  }, [locale]);

  return { t, locale, isHydrated };
}

// 現在の言語を取得（コンポーネント外で使用）
export function getLocale(): Locale {
  return detectLocale();
}
