import React from 'react';
import { CreateProject } from '@/components/elements/create-project';

interface createProp {
    params: {
      project_id: string;
    };
  }

export default async function Page() {
    return (
      <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
        <CreateProject/>
      </div>
    );
  }