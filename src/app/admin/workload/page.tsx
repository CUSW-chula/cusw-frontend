import { FilterByDateRange, FilterByTags } from '@/components/elements/control-bar';
import WorkloadUser from '@/components/elements/workload/workload-user';
import React from 'react';
const page = () => {
  return (
    <div className="min-w-full flex-col items-start justify-center gap-8 px-20 ">
      <WorkloadUser />
    </div>
  );
};

export default page;
