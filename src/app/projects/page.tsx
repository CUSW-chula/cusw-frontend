'use client';

import { ProjectList } from '@/components/elements/projectList/project-list';
import BASE_URL, { BASE_SOCKET, BASE_YSWEET } from '@/lib/shared';
import React from 'react';

export default function ProjectLists() {
  // Log ฝั่ง client (จะเห็นใน Browser Console)
  console.log('🔍 [Projects Page - CLIENT] Environment Variables:', {
    NEXT_PUBLIC_IS_DEV: process.env.NEXT_PUBLIC_IS_DEV,
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL,
    BASE_SOCKET,
    BASE_YSWEET,
  });

  return (
    <div className="flex flex-col w-full gap-[16px] px-20">
      <ProjectList />
    </div>
  );
}
