'use client';

import { Money } from '@/components/elements/money';
import { CrownIcon, Users, Tag, Calendar, Trash2, DollarSign, Weight } from 'lucide-react';
import StatusButton from '@/components/elements/status-button';
import StatusLabel from './status-label';
import { ProjectOwner } from '@/components/elements/project-owner';
import { AssignedTaskToMember } from '@/components/elements/assigned-task';
import { ButtonAddTags } from '@/components/elements/button-add-tag';
import type { TaskManageMentProp } from '@/lib/shared';
import { DatePickerWithRange } from '@/components/elements/date-feature';
import type { TaskProps } from '@/app/types/types';

const MenuBar = ({
  task,
  canManageTags,
  canManageMoney,
  canManageDate,
  canAssignTasks,
}: {
  task: TaskProps;
  canManageTags: boolean;
  canManageMoney: boolean;
  canManageDate: boolean;
  canAssignTasks: boolean;
}) => {
  return (
    <div className="w-[360px] p-[20px] bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-2 inline-flex">
      <div aria-label="status" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Describtion */}
          <div>
            <StatusLabel />
          </div>
        </div>
        {/* Content */}
        <StatusButton task={task} />
      </div>

      <div aria-label="owner" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <CrownIcon className="w-6 h-6 relative text-brown" />
          {/* Describtion */}
          <div className="text-brown text-xs font-medium font-BaiJamjuree leading-tight">
            Owner :{' '}
          </div>
        </div>
        <ProjectOwner task={task} />
      </div>

      <div aria-label="member" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Users className="w-6 h-6 relative text-brown" />
          {/* Describtion */}
          <div className="text-brown text-xs font-medium font-BaiJamjuree leading-tight">
            Member :{' '}
          </div>
        </div>
        <AssignedTaskToMember task={task} canAssignTask={canAssignTasks} />
      </div>

      <div aria-label="tag" className="h-fit justify-start items-start inline-flex">
        {/* Label Zone */}
        <div className="flex w-24 h-[32px] items-center gap-2">
          {/* Icon & text */}
          <Tag className="w-6 h-6 relative text-brown" />
          <p className="text-brown text-xs font-medium font-BaiJamjuree">Tag :</p>
        </div>
        {/* Description */}
        <ButtonAddTags task={task} canManageTags={canManageTags} />
      </div>

      <div aria-label="money" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 text-center text-black text-[30px] font-medium">
            <img src="/asset/icon/budget.svg" alt="Budget Icon " className="text-brown" />
          </div>
          {/* Describtion */}
          <div className="text-brown text-xs font-medium font-BaiJamjuree leading-tight">
            Money :{' '}
          </div>
        </div>
        <Money task={task} canManageMoney={canManageMoney} />
      </div>

      <div aria-label="date" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Calendar className="w-6 h-6 relative text-brown" />
          {/* Describtion */}
          <div className="text-brown text-xs font-medium font-BaiJamjuree leading-tight">
            Date :{' '}
          </div>
        </div>

        {canManageDate ? (
          // ✅ Owner/Manager: ใช้ DatePicker ได้
          <DatePickerWithRange task={task} />
        ) : (
          // 👀 Member: เห็นวันอย่างเดียว กดไม่ได้
          <div className="h-8 px-2 text-sm bg-white rounded-md border justify-center items-center flex font-medium font-BaiJamjuree hover:cursor-pointer border-brown text-brown">
            {task.startDate && task.endDate
              ? `${new Date(task.startDate).toLocaleDateString()} - ${new Date(
                  task.endDate,
                ).toLocaleDateString()}`
              : 'No date set'}
          </div>
        )}
      </div>
    </div>
  );
};

export { MenuBar };
