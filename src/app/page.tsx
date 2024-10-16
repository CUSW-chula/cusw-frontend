import { ButtonAddTags } from '@/components/elements/button-add-tag';
import CounterGrid from '@/components/examples/example';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <CounterGrid />
      <CounterGrid />
      <CounterGrid />
    </div>
  );
}
