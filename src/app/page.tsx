'use client';

import StatusButton from '@/components/elements/status-botton';
import StatusLabel from '@/components/elements/status-label';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <div className="flex items-center gap-[17px]">
        <StatusLabel />
        <StatusButton />
      </div>
    </div>
  );
}
