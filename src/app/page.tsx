import ActivityLogs from '@/components/features/activity-logs';

export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-col items-center justify-center mt-10 gap-10">
      <ActivityLogs />
    </div>
  );
}
