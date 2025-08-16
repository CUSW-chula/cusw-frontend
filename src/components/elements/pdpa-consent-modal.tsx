'use client';

import { useState } from 'react';
import { usePDPAConsent } from '@/hooks/use-pdpa-consent';

interface PDPAConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

interface ConsentSettings {
  mindTest: boolean;
  mindAppointment: boolean;
  mindWorkshop: boolean;
  midJourney: boolean;
  termsAccepted: boolean;
}

export default function PDPAConsentModal({ isOpen, onAccept }: PDPAConsentModalProps) {
  const { savePDPAConsent } = usePDPAConsent();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [consents, setConsents] = useState<ConsentSettings>({
    mindTest: false,
    mindAppointment: false,
    mindWorkshop: false,
    midJourney: false,
    termsAccepted: false,
  });

  const handleConsentToggle = (key: keyof ConsentSettings) => {
    setConsents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProceed = () => {
    // ตรวจสอบว่ายอมรับทุกข้อหรือไม่
    const allConsentsAccepted = Object.values(consents).every((consent) => consent === true);

    if (allConsentsAccepted) {
      // ใช้ hook function แทนการบันทึกโดยตรง
      savePDPAConsent(consents);
      // ปิด modal ทันที
      setIsModalOpen(false);
      onAccept();
    }
  };

  const allConsentsAccepted = Object.values(consents).every((consent) => consent === true);

  // ใช้ isModalOpen เป็นตัวควบคุมหลัก และ isOpen เป็นตัวควบคุมจาก parent
  if (!isOpen || !isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-[520px] bg-white rounded-md flex flex-col justify-start items-start gap-6 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="self-stretch px-6 pt-4 pb-4 border-b border-black/20 flex justify-start items-center gap-2.5">
          <div className="text-black text-base font-medium font-BaiJamjuree leading-normal">
            เอกสารขอความยินยอมสําหรับการใช้บริการ
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="self-stretch mx-6 w-auto h-[300px] pl-2.5 pr-1 py-2.5 bg-neutral-100 rounded-md outline outline-1 outline-offset-[-1px] outline-black/20 flex justify-start items-start gap-2.5">
          <div className="flex-1 flex flex-col justify-start items-start gap-4 overflow-y-auto pr-2 h-full">
            {/* Introduction */}
            <div className="self-stretch text-black text-sm font-normal font-BaiJamjuree leading-normal">
              จุฬาลงกรณ์มหาวิทยาลัยให้ความสําคัญต่อความปลอดภัยของข้อมูลส่วนบุคคลของท่าน ดังนั้น เราจะดูแล
              ข้อมูลส่วนบุคคลของท่านอย่างเหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของท่านให้ปลอดภัยตามมาตรฐานสูงสุด
              สอดคล้องกับพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ทางฝ่ายส่งเสริมสุขภาวะนิสิต
              ขอความยินยอมจากท่านเพื่อการประมวลผลข้อมูลส่วนบุคคลเพื่อ วัตถุประสงค์ดังที่ระบุไว้ กรุณากด
              "ยินยอม"หากท่านตกลงให้เราประมวลผลข้อมูลส่วนบุคคลของท่านตาม วัตถุประสงค์ดังต่อไปนี้
            </div>

            {/* Mind Test */}
            <div className="self-stretch">
              <div className="mb-2">
                <span className="text-black text-sm font-bold font-BaiJamjuree leading-normal">
                  1. การทำแบบทดสอบทางจิตวิทยา (Mind Test)
                </span>
                <br />
                <span className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                  ท่านยินยอมให้ทางฝ่ายฯ ประมวลผลข้อมูล ข้อมูลสุขภาพจิต
                  ข้อมูลการประเมินผลแบบวัดทางจิตวิทยาเพื่อวัตถุประสงค์ในการช่วยเหลือและการรักษาทางด้านสุขภาพจิต เช่น
                  การนำข้อมูลไปจัดเก็บเข้าระบบเพื่อวางแผนในกระบวนการการปรึกษาเชิงจิตวิทยา
                  การประชุมเพื่อพัฒนาคุณภาพของการให้บริการ
                </span>
              </div>
              <div className="px-2 flex justify-start items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleConsentToggle('mindTest')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {consents.mindTest && <div className="w-2 h-2 bg-green rounded-full" />}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ยินยอม
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleConsentToggle('mindTest')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {!consents.mindTest && <div className="w-2 h-2 bg-greenLight rounded-full" />}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ไม่ยินยอม
                  </div>
                </button>
              </div>
            </div>

            {/* Mind Appointment */}
            <div className="self-stretch">
              <div className="mb-2">
                <span className="text-black text-sm font-bold font-BaiJamjuree leading-normal">
                  2. การนัดหมายบริการปรึกษาเชิงจิตวิทยาโดยนักจิตวิทยา (Mind Appointment)
                </span>
                <br />
                <span className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                  ท่านยินยอมให้ทางฝ่ายฯ ประมวลผลข้อมูล ข้อมูลสุขภาพจิต
                  เพื่อวัตถุประสงค์ในการช่วยเหลือและการรักษาทางด้านสุขภาพจิต เช่น
                  การนำข้อมูลไปจัดเก็บเข้าระบบเพื่อติดต่อช่วยเหลือทางสุขภาพจิตฉุกเฉินและทำการช่วยเหลือ
                  หรือติดต่อหน่วยงานฉุกเฉินในกรณีที่เกิดเหตุการณ์ทางสุขภาพจิตขึ้น
                </span>
              </div>
              <div className="px-2 flex justify-start items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleConsentToggle('mindAppointment')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {consents.mindAppointment && <div className="w-2 h-2 bg-green rounded-full" />}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ยินยอม
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleConsentToggle('mindAppointment')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {!consents.mindAppointment && (
                      <div className="w-2 h-2 bg-greenLight rounded-full" />
                    )}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ไม่ยินยอม
                  </div>
                </button>
              </div>
            </div>

            {/* Mind Workshop */}
            <div className="self-stretch">
              <div className="mb-2">
                <span className="text-black text-sm font-bold font-BaiJamjuree leading-normal">
                  3. การสมัครเข้าร่วมกิจกรรม (Mind Workshop)
                </span>
                <br />
                <span className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                  ท่านยินยอมให้ทางฝ่ายฯ ประมวลผลข้อมูล
                  เพื่อวัตถุประสงค์ในการให้บริการทางด้านสุขภาพจิตและเพื่อวัตถุประสงค์ในการพิจารณาแนวทางการดูแลนิสิต เช่น
                  นิสิตที่มีปัญหาด้านการเรียน
                </span>
              </div>
              <div className="px-2 flex justify-start items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleConsentToggle('mindWorkshop')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {consents.mindWorkshop && <div className="w-2 h-2 bg-green rounded-full" />}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ยินยอม
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleConsentToggle('mindWorkshop')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {!consents.mindWorkshop && (
                      <div className="w-2 h-2 bg-greenLight rounded-full" />
                    )}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ไม่ยินยอม
                  </div>
                </button>
              </div>
            </div>

            {/* Mid Journey */}
            <div className="self-stretch">
              <div className="mb-2">
                <span className="text-black text-sm font-bold font-BaiJamjuree leading-normal">
                  4. การวิเคราะห์การใช้งานเพื่อการพัฒนาจิตใจ (Mid Journey)
                </span>
                <br />
                <span className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                  ท่านยินยอมให้ทางฝ่ายฯ ประมวลผลข้อมูล เพื่อวัตถุประสงค์ในการช่วยเหลือ รักษาทางด้านสุขภาพจิต เช่น
                  การนำข้อมูลไปจัดเก็บเข้าระบบเพื่อวางแผนในกระบวนการการปรึกษาเชิงจิตวิทยา
                  และเพื่อวัตถุประสงค์ในการพิจารณาแนวทางการดูแลนิสิต เช่น นิสิตที่มีปัญหาด้านการเรียน
                </span>
              </div>
              <div className="px-2 flex justify-start items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleConsentToggle('midJourney')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {consents.midJourney && <div className="w-2 h-2 bg-green rounded-full" />}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ยินยอม
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleConsentToggle('midJourney')}
                  className="flex justify-center items-center gap-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full border border-slate-200 flex items-center justify-center">
                    {!consents.midJourney && <div className="w-2 h-2 bg-greenLight rounded-full" />}
                  </div>
                  <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
                    ไม่ยินยอม
                  </div>
                </button>
              </div>
            </div>

            {/* Additional Information */}
            <div className="self-stretch text-black text-sm font-normal font-BaiJamjuree leading-normal">
              ความยินยอมนี้ เราจะดูแลข้อมูลส่วนบุคคลของท่านตามมาตรฐานสูงสุด
              โดยเราจะจัดเก็บข้อมูลส่วนบุคคลตลอดระยะเวลาที่จำเป็นในการดำเนินการตามวัตถุประสงค์
              และจะลบข้อมูลหลังจากหมดความจำเป็นนั้น ทั้งนี้
              ท่านสามารถดูรายละเอียดของนโยบายคุ้มครองข้อมูลส่วนบุคคลสำหรับการใช้บริการของฝ่ายส่งเสริมสุขภาวะนิสิต
              ดูรายละเอียดได้ที่ [
              <a
                href="https://doem.org.br/ba/modelo/arquivos/pdfviewer/0b517cdc5f9850e3782051c82e7f3234?name=lorem-ipsum.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-greenLight hover:text-green transition-colors duration-200 underline">
                นโยบายคุ้มครองข้อมูลส่วนบุคคล (ไฟล์)
              </a>
              ]
              <br />
              เรายินดีที่จะแจ้งให้ท่านทราบว่า ท่านสามารถเพิกถอนความยินยอมนี้ได้ทุกเมื่อ
              เว้นแต่จะมีฐานการประมวลผลตามกฎหมายอื่น นอกจากนี้ ในกรณีที่มีการเปลี่ยนแปลงหรือเพิ่มเติมวัตถุประสงค์ใด ๆ
              เราจะแจ้งให้ท่านทราบล่วงหน้าตามช่องทางที่เหมาะสมต่อไป หากจำเป็นต้องได้รับความยินยอม
              เราจะขอความยินยอมจากท่านก่อนเสมอ
            </div>
          </div>
        </div>

        {/* Terms Acceptance */}
        <div className="px-6 flex flex-col justify-start items-start gap-3">
          <div className="text-greenLight text-sm font-normal font-BaiJamjuree leading-normal">
            กรุณาอ่านและยอมรับเงื่อนไขการบริการ
          </div>
          <button
            type="button"
            onClick={() => handleConsentToggle('termsAccepted')}
            className="flex justify-center items-center gap-2 cursor-pointer">
            <div className="flex flex-col justify-center items-center">
              <div className="rounded-[100px] flex justify-center items-center">
                <div
                  className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${
                    consents.termsAccepted ? 'border-green bg-green' : 'border-brown'
                  }`}>
                  {consents.termsAccepted && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true">
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <div className="text-black text-sm font-normal font-BaiJamjuree leading-normal">
              ฉันได้อ่าน ทำความเข้าใจ และ ยอมรับเงื่อนไขข้อตกลงในการใช้งาน
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="self-stretch h-0 mx-6 outline outline-1 outline-offset-[-0.50px] outline-black/20" />

        {/* Footer */}
        <div className="self-stretch px-6 pb-6 flex flex-col justify-center items-end">
          <button
            type="button"
            onClick={handleProceed}
            disabled={!allConsentsAccepted}
            className={`h-10 px-5 rounded-md outline outline-1 outline-offset-[-1px] flex flex-col justify-center items-center gap-2.5 transition-colors ${
              allConsentsAccepted
                ? 'bg-blue text-white outline-blue hover:bg-purple'
                : 'bg-white text-brown outline-brown cursor-not-allowed opacity-50'
            }`}>
            <div className="text-sm font-normal font-BaiJamjuree leading-normal">ดำเนินการต่อ</div>
          </button>
        </div>
      </div>
    </div>
  );
}
