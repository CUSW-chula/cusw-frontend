'use client';
import { CreateProject } from '@/app/projects/create/_components/createProject';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="min-w-full min-h-screen flex flex-col lg:flex-row items-start justify-center mt-10 gap-8 px-20">
      <CreateProject />
    </div>
  );
}
