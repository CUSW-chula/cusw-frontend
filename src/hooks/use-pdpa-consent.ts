'use client';

import { useState, useEffect } from 'react';

export interface PDPAConsentSettings {
  mindTest: boolean;
  mindAppointment: boolean;
  mindWorkshop: boolean;
  midJourney: boolean;
  termsAccepted: boolean;
}

export function usePDPAConsent() {
  const [hasPDPAConsent, setHasPDPAConsent] = useState<boolean | null>(null);
  const [pdpaSettings, setPdpaSettings] = useState<PDPAConsentSettings | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('pdpaConsent');
    const consentDate = localStorage.getItem('pdpaConsentDate');

    if (consent && consentDate) {
      const settings = JSON.parse(consent) as PDPAConsentSettings;
      setPdpaSettings(settings);
      // ตรวจสอบว่ายอมรับทุกข้อหรือไม่
      const allAccepted = Object.values(settings).every((value) => value === true);
      setHasPDPAConsent(allAccepted);
    } else {
      setHasPDPAConsent(false);
    }
  }, []);

  const savePDPAConsent = (settings: PDPAConsentSettings) => {
    localStorage.setItem('pdpaConsent', JSON.stringify(settings));
    localStorage.setItem('pdpaConsentDate', new Date().toISOString());
    setPdpaSettings(settings);

    const allAccepted = Object.values(settings).every((value) => value === true);
    setHasPDPAConsent(allAccepted);
  };

  const clearPDPAConsent = () => {
    localStorage.removeItem('pdpaConsent');
    localStorage.removeItem('pdpaConsentDate');
    setHasPDPAConsent(false);
    setPdpaSettings(null);
  };

  // Helper functions สำหรับตรวจสอบการยินยอมแต่ละข้อ
  const canUseMindTest = () => pdpaSettings?.mindTest || false;
  const canUseMindAppointment = () => pdpaSettings?.mindAppointment || false;
  const canUseMindWorkshop = () => pdpaSettings?.mindWorkshop || false;
  const canUseMidJourney = () => pdpaSettings?.midJourney || false;
  const hasAcceptedTerms = () => pdpaSettings?.termsAccepted || false;

  return {
    hasPDPAConsent,
    pdpaSettings,
    savePDPAConsent,
    clearPDPAConsent,
    canUseMindTest,
    canUseMindAppointment,
    canUseMindWorkshop,
    canUseMidJourney,
    hasAcceptedTerms,
  };
}
