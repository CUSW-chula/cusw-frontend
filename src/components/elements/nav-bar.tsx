'use client';

import { Profile } from './profile';
import { useEffect, useState } from 'react';

export default function NavBar() {
  const [isHidden, setIsHidden] = useState('');

  useEffect(() => {
    const url = window.location.pathname;
    if (url === '/') {
      setIsHidden('hidden');
    }
  }, []);

  return (
    <div className={`flex flex-row min-w-full h-[84px] justify-between items-center ${isHidden}`}>
      <a href="/projects/cm24w5yu000008tlglutu5czu">
        <img src="/asset/logo/Logo_s2.svg" alt="CUSW" />
      </a>
      <div className="flex flex-row px-5">
        <Profile userId={''} userName={'Bunyawat Naunnak'} />
      </div>
    </div>
  );
}
