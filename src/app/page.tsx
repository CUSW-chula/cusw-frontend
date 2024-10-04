import CounterGrid from '@/components/examples/example';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <Button>Click me</Button>
      <CounterGrid />
      <CounterGrid />
      <CounterGrid />
    </div>
  );
}
