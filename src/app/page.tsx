'use client';

import ActivityLogs from '@/components/elements/activity-logs';
import { Money } from '@/components/elements/money';
import Workspace from '@/components/elements/workspace';
import Comment from '@/components/elements/comment';
export default function Home() {
  return (
    <div className="min-w-full min-h-full flex flex-row items-start justify-center mt-10 gap-8">
      <div className="w-[60%] rounded-[6px] p-5 border-brown border-[1px]">
        <Workspace />
        <div className="flex-row">
          <ActivityLogs />
          <Comment />
        </div>
      </div>
      <div className="w-[25%] rounded-[6px] p-5 border-brown border-[1px]">
        <Money />
      </div>
    </div>
  );
}
