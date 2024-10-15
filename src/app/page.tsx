import CounterGrid from '@/components/examples/example';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <div>deploy succces</div>
      <CounterGrid />
      <CounterGrid />
      <CounterGrid />
    </div>
  );
}
