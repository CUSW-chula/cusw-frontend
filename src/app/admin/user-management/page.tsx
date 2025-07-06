import React from 'react';
import Table from '@/components/elements/userManagement/user-table';
import { AdminBackButton } from '@/components/elements/backButton';
const page = () => {
  return (
    <div className="min-w-full flex-col items-start justify-center gap-8 px-20">
      <div className="flex w-full items-center justify-end mb-4">
        <AdminBackButton />
      </div>
      <Table />
    </div>
  );
};

export default page;
