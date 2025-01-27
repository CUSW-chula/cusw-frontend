'use client'; // Ensure this is a client component

import { CreateProject } from '@/components/elements/create-project';
import { useRouter } from 'next/navigation'; // Use next/navigation for client-side routing

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function Page({ params }: PageProps) {
  const { projectId } = params; // Extract projectId from the params

  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8">
      <CreateProject project_id={projectId} />
    </div>
  );
}
