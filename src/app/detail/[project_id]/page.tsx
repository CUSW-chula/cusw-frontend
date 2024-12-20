import React from 'react';
import { ProjectDetail } from '@/components/elements/projectdetail';

interface ProjectProp {
  params: {
    project_id: string;
  };
}

export default async function Page({ params }: ProjectProp) {
  const { project_id } = await params;
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <ProjectDetail project_id={project_id} />
    </div>
  );
}