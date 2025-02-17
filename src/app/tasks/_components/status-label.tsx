import type { Status } from '@/lib/shared';
import { useAtom } from 'jotai';

function StatusLabel() {
  return (
    <div className="flex item-center gap-[8px]">
      <img src={'/asset/icon/unassigned.svg'} className="h-6 w-6 shrink-0" alt={'Unassigned'} />
      <p className="text-[12px] h-[24px] text-muted-foreground">Status :</p>
    </div>
  );
}

export default StatusLabel;
