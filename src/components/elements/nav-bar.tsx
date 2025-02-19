'use client';

import { usePathname } from 'next/navigation';
import { Profile2 } from './profile';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import BASE_URL from '@/lib/shared';
import { jwtDecode } from 'jwt-decode';

export default function NavBar() {
  const url = usePathname();
  const cookie = getCookie('auth');
  const [name, setName] = useState('');
  const [userid, setUserid] = useState('');

  const auth = cookie?.toString() ?? '';

  useEffect(() => {
    if (!auth) return; // Don't proceed if there's no auth token

    try {
      const decoded = jwtDecode<{ id: string }>(auth);
      setUserid(decoded.id);
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }, [auth]);

  useEffect(() => {
    if (!auth || !userid || url === '/') return;

    const fetchOwner = async () => {
      try {
        const response = await fetch(`${BASE_URL}/v2/users/${userid}`, {
          headers: {
            Authorization: auth,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setName(data.name);
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };

    fetchOwner();
  }, [auth, userid, url]);

  return (
    <>
      {url !== '/' && auth && (
        <div className="flex flex-row min-w-full h-[84px] justify-between items-center">
          <a href="/projects">
            <img src="/asset/logo/Logo_s2.svg" alt="CUSW" />
          </a>
          <div className="flex flex-row px-5">
            <Profile2 userId={userid} userName={name} />
          </div>
        </div>
      )}
    </>
  );
}
