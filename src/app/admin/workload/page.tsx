import { FilterByDateRange, FilterByTags } from '@/components/elements/control-bar';
import WorkloadUser from '@/components/elements/workload/AllUsers/workload-user';
import { AdminBackButton } from '@/components/elements/backButton';
import React from 'react';
const page = () => {
  return (
    <div className="min-w-full flex-col items-start justify-center  px-20 pb-20">
      <WorkloadUser />
    </div>
  );
};

export default page;
