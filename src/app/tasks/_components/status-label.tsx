import { selectedStatusAtom } from '@/atom';
import type { Status } from '@/lib/shared';
import { useAtom } from 'jotai';

function StatusLabel() {
  const [status] = useAtom<Status>(selectedStatusAtom);
  return (
    <div className="flex items-center gap-[8px]">
      <img src={status?.icon} className="h-6 w-6 shrink-0" alt={status?.displayName} />
      <p className="text-brown text-xs font-medium font-BaiJamjuree leading-tight">Status :</p>
    </div>
  );
}

export default StatusLabel;
