'use client';

import { useState, useEffect } from 'react';
import CookieSettingsModal from './cookie-settings-modal';

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem('cookieConsent');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      preferences: true,
    };
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieSettings', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const handleManage = () => {
    setShowModal(true);
  };

  const handleSaveSettings = (settings: CookieSettings) => {
    localStorage.setItem('cookieConsent', 'managed');
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)] p-6 flex flex-col justify-between gap-4 overflow-hidden rounded-lg w-full max-w-6xl mx-4 min-h-[110px]">
        {/* Content */}
        <div className="flex-1 flex items-start">
          <p className="text-black text-sm font-normal font-BaiJamjuree leading-relaxed">
            เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้เว็บไซต์
            คุณสามารถเลือกตั้งค่าความยินยอมการใช้คุกกี้ได้โดยคลิก "การตั้งค่าคุกกี้" หรือศึกษา{' '}
            <a
              href="https://doem.org.br/ba/modelo/arquivos/pdfviewer/0b517cdc5f9850e3782051c82e7f3234?name=lorem-ipsum.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-greenLight hover:text-green transition-colors duration-200 underline cursor-pointer">
              นโยบายคุ้มครองข้อมูลส่วนบุคคล (ไฟล์)
            </a>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={handleManage}
            className="text-black text-sm font-normal font-BaiJamjuree underline leading-normal hover:text-brown transition-colors duration-200 whitespace-nowrap">
            การตั้งค่าคุกกี้
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="h-10 px-6 bg-white rounded-md outline outline-1 outline-offset-[-1px] outline-brown flex items-center justify-center hover:bg-cream transition-colors duration-200 whitespace-nowrap">
            <span className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
              ยอมรับ
            </span>
          </button>
        </div>
      </div>

      <CookieSettingsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSettings}
      />
    </>
  );
}
