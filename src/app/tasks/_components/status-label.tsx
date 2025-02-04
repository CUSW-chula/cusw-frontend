import { selectedStatusAtom } from '@/atom';
import type { Status } from '@/lib/shared';
import { useAtom } from 'jotai';

function StatusLabel() {
  const [status] = useAtom<Status>(selectedStatusAtom);
  return (
    <div className="flex item-center gap-[8px]">
      <img src={status?.icon} className="h-6 w-6 shrink-0" alt={status?.label} />
      <p className="text-[12px] h-[24px] text-muted-foreground">Status :</p>
    </div>
  );
}

export default StatusLabel;
