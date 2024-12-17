'use client';
import { CommandGroup, CommandItem } from 'cmdk';
import { CrownIcon, Users } from 'lucide-react';
import * as React from 'react';
  
type ImageProps = {
    src: string; // URL ของรูปภาพ
    alt: string; // คำอธิบายภาพ
    width?: number | string; // ความกว้าง (ไม่บังคับ)
    height?: number | string; // ความสูง (ไม่บังคับ)
    className?: string; // คลาส CSS (ไม่บังคับ)
  };

  export const ProjectList = () => {
    return (
    <>
      <div>
       
          <div className="flex flex-start w-[408px] h-[260px] p-[18px] gap-[10px]  bg-white border-[1px] border-brown rounded-[6px]">
            <div className="flex flex-start gap-[10px] rounded-[6px] self-stretch">
                <img
                width={158}
                height={224}
                alt='img'
                src="/asset/Options.svg"
                />
            </div>
           
            <div className='flex flex-col gap-y-2 '>
              <div className="h-[56px] w-[204px] self-stretch">
                <div className="font-BaiJamjuree  text-base font-medium leading-[1.75] ">
                  จ้างบุลคล Hotline
                </div>
              </div>

              <div className="w-[24px] h-[24px] flex flex-row  ">
                <img
                  src="/asset/icon/budget-black.svg"
                  alt="Budget Icon "
                  className=" text-black  "
                  
                />
                <div className='font-BaiJamjuree text-[14px] font-medium flex text-center'>
                    1,000,000
                </div>
              </div>

              <div className="w-[24px] h-[24px] flex flex-row  ">
                <img
                  src="/asset/icon/budget-red.svg"
                  alt="Budget Icon "
                  
                />
                <div className='font-BaiJamjuree text-[14px] font-medium flex text-center'>
                    1,000,000
                </div>
              </div>
              
              <div className='flex-row flex'>
                <CrownIcon className="w-[24px] h-[24px] relative text-black" />
                <div  className="flex items-center space-x-2"> 
                    {/* Display default users as circles with initials */}
                    <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                        <span className="text-brown text-sm font-BaiJamjuree">
                        {/* {getInitials(user.userName)} */}
                        </span>
                    </div>
                    <span className="text-[16px] font-BaiJamjuree ml-[4px] ">
                        {/* {getFirstName(user.userName)} */}
                    </span>
                </div>
              </div>

              <div className='flex flex-row '>
                <Users className="w-6 h-6 relative text-black" />
                <div  className="flex items-center space-x-2"> 
                    {/* Display default users as circles with initials */}
                    <div className="w-[24px] h-[24px] bg-gray-100 rounded-full flex items-center justify-center border-[1px] border-brown">
                        <span className="text-brown text-sm font-BaiJamjuree">
                        {/* {getInitials(user.userName)} */}
                        </span>
                    </div>
                    <span className="text-[16px] font-BaiJamjuree ml-[4px] ">
                        {/* {getFirstName(user.userName)} */}
                    </span>
                </div>
              </div>

            </div>
          </div>
      </div>
      </>
    );
  };
  

