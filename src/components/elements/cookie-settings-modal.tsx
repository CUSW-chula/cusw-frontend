'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: CookieSettings) => void;
}

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

export default function CookieSettingsModal({ isOpen, onClose, onSave }: CookieSettingsModalProps) {
  const [settings, setSettings] = useState<CookieSettings>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    preferences: false,
  });

  const handleToggle = (key: keyof CookieSettings) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      preferences: true,
    };
    setSettings(allAccepted);
    onSave(allAccepted);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-black font-Anuphan">การตั้งค่าคุกกี้</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-cream rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-brown font-BaiJamjuree">
            เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณในเว็บไซต์ของเรา คุณสามารถเลือกประเภทของคุกกี้ที่ต้องการอนุญาตได้
          </p>

          {/* Cookie Categories */}
          <div className="space-y-4">
            {/* Necessary Cookies */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-black font-Anuphan">คุกกี้ที่จำเป็น</h3>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue transition-colors opacity-50 cursor-not-allowed">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform translate-x-6" />
                </div>
              </div>
              <p className="text-sm text-brown font-BaiJamjuree">
                คุกกี้เหล่านี้จำเป็นสำหรับการทำงานของเว็บไซต์และไม่สามารถปิดได้
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-black font-Anuphan">คุกกี้สำหรับการวิเคราะห์</h3>
                <button
                  type="button"
                  onClick={() => handleToggle('analytics')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: settings.analytics ? '#489CFF' : '#6B5C56' }}>
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform"
                    style={{
                      transform: settings.analytics ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                    }}
                  />
                </button>
              </div>
              <p className="text-sm text-brown font-BaiJamjuree">
                ช่วยให้เราเข้าใจการใช้งานเว็บไซต์และปรับปรุงประสิทธิภาพ
              </p>
            </div>

            {/* Preferences Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-black font-Anuphan">คุกกี้สำหรับการตั้งค่า</h3>
                <button
                  type="button"
                  onClick={() => handleToggle('preferences')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  style={{ backgroundColor: settings.preferences ? '#489CFF' : '#6B5C56' }}>
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform"
                    style={{
                      transform: settings.preferences
                        ? 'translateX(1.5rem)'
                        : 'translateX(0.25rem)',
                    }}
                  />
                </button>
              </div>
              <p className="text-sm text-brown font-BaiJamjuree">
                จดจำการตั้งค่าของคุณเพื่อประสบการณ์ที่ดีขึ้น
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-cream">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-white border border-brown text-black rounded-md hover:bg-cream transition-colors font-BaiJamjuree">
            บันทึกการตั้งค่า
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 px-4 py-2 bg-blue text-white rounded-md hover:bg-purple transition-colors font-BaiJamjuree">
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
