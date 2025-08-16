'use client';

import { useState, useEffect } from 'react';

export interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    const settings = localStorage.getItem('cookieSettings');

    setHasConsent(!!consent);
    if (settings) {
      setCookieSettings(JSON.parse(settings));
    }
  }, []);

  const updateCookieSettings = (settings: CookieSettings) => {
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    setCookieSettings(settings);
  };

  const clearCookieConsent = () => {
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieSettings');
    setHasConsent(false);
    setCookieSettings(null);
  };

  // Helper functions to check specific cookie types
  const canUseAnalytics = () => cookieSettings?.analytics || false;
  const canUsePreferences = () => cookieSettings?.preferences || false;

  return {
    hasConsent,
    cookieSettings,
    updateCookieSettings,
    clearCookieConsent,
    canUseAnalytics,
    canUsePreferences,
  };
}
