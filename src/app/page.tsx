'use client';

import { Button } from '@/components/ui/button';
import { Money } from '@/components/elements/money';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <Button>Click me</Button>
      <Money />
    </div>
  );
}
