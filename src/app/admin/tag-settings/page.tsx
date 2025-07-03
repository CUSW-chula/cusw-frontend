'use client';
import React from 'react';
import Table from '@/components/elements/tagManagement/table';
import { AdminBackButton } from '@/components/elements/backButton';
const page = () => {
  return (
    <div className="w-full px-20">
      <div className="flex w-full items-center justify-end mb-4">
        <AdminBackButton />
      </div>
      <Table />
    </div>
  );
};

export default page;
