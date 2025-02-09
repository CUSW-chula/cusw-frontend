'use client';

import { usePathname } from 'next/navigation';
import { Profile2 } from './profile';

export default function NavBar() {
  const url = usePathname();

  return (
    <>
      {url !== '/' && (
        <div className="flex flex-row min-w-full h-[84px] justify-between items-center">
          <a href="/projects">
            <img src="/asset/logo/Logo_s2.svg" alt="CUSW" />
          </a>
          <div className="flex flex-row px-5">
            <Profile2 userId={''} userName={'Bunyawat Naunnak'} />
          </div>
        </div>
      )}
    </>
  );
}
