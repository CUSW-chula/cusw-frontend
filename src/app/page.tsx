'use client';

import { ComboboxPopover } from '@/components/elements/status';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <ComboboxPopover />
    </div>
  );
}
