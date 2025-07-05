'use client';

import { usePathname } from 'next/navigation';
import { Profile2 } from './profile';
import { getCookie } from 'cookies-next';
import { useEffect, useState } from 'react';
import BASE_URL from '@/lib/shared';
import { jwtDecode } from 'jwt-decode';
import { toast } from '@/hooks/use-toast';
import { TableOfContents } from 'lucide-react';

export default function NavBar() {
  const url = usePathname();
  const cookie = getCookie('auth');
  const [name, setName] = useState('');
  const [userid, setUserid] = useState('');
  const [isAdmin, setIsAdmin] = useState<boolean>();
  const [isHead, setIsHead] = useState<boolean>();
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
          const errorMessage = await response.text();
        }

        const data = await response.json();
        setName(data.name);
        setIsHead(data.head);
        setIsAdmin(data.admin);
      } catch (error) {
        console.error('Error fetching Owner:', error);
      }
    };

    fetchOwner();
  }, [auth, userid, url]);

  return (
    <>
      <div className="flex flex-row min-w-full h-[84px] px-4 justify-between items-center font-BaiJamjuree">
        <a href="/projects">
          <img src="/asset/logo/s2.svg" alt="CUSW" width={240} />
        </a>
        <div className="flex flex-row gap-4">
          {(isAdmin || isHead) && (
            <button
              type="button"
              className="flex justify-center items-center gap-1 h-[40px] bg-white border border-brown rounded-[6px] px-2"
              onClick={() => window.location.assign('/admin')}>
              <TableOfContents />
              {isAdmin ? 'Admin' : 'Dashboard'}
            </button>
          )}

          <button
            type="button"
            className="flex justify-center items-center gap-1 h-[40px] bg-brown text-white rounded-[6px] px-3"
            onClick={() => window.location.assign('/my-tasks')}>
            My task
          </button>

          <Profile2 userId={userid} userName={name} />
        </div>
      </div>
    </>
  );
}
