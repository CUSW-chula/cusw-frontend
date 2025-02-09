'use client';

import { Money } from '@/components/elements/money';
import { CrownIcon, Users, Tag, Calendar, Trash2, DollarSign, Weight } from 'lucide-react';
import StatusButton from '@/components/elements/status-botton';
import StatusLabel from './status-label';
import { ProjectOwner } from '@/components/elements/project-owner';
import { AssignedTaskToMember } from '@/components/elements/assigned-task';
import { ButtonAddTags } from '@/components/elements/button-add-tag';
import type { TaskManageMentProp } from '@/lib/shared';
import { DatePickerWithRange } from '@/components/elements/date-feature';
import type { TaskProps } from '@/app/types/types';

const MenuBar = ({ task }: { task: TaskProps }) => {
  return (
    <div className="min-h-[400px] w-[360px] p-[20px] bg-white rounded-md border border-[#6b5c56] flex-col justify-center items-start gap-4 inline-flex">
      <div aria-label="status" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
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
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Owner :{' '}
          </div>
        </div>
        {/* <ProjectOwner task={task} /> */}
      </div>

      <div aria-label="member" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Users className="w-6 h-6 relative text-brown" />
          {/* Describtion */}
          <div className="text-brown text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Member :{' '}
          </div>
        </div>
        <AssignedTaskToMember task={task} />
      </div>

      <div aria-label="tag" className="inline-flex justify-start items-start w-full">
        {/* Label Zone */}
        <div>
          <div className="flex w-24 h-10 items-center gap-2">
            {/* Icon & text */}
            <Tag className="w-6 h-6 relative text-brown" />
            <p className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
              Tag :
            </p>
          </div>
        </div>
        {/* Description */}
        <div className="flex flex-wrap w-full">
          {' '}
          <ButtonAddTags task={task} />
        </div>
      </div>

      <div aria-label="money" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <div className="w-6 text-center text-black text-[30px] font-medium font-BaiJamjuree">
            <img src="/asset/icon/budget.svg" alt="Budget Icon " className=" text-brown  " />
          </div>
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Money :{' '}
          </div>
        </div>
        {/* <Money task={task} /> */} {/* TODO: waiting for WAI PR  */}
      </div>

      <div aria-label="date" className="h-10 justify-start items-center inline-flex">
        {/* Label Zone */}
        <div className="w-24 justify-start items-center gap-2 flex">
          {/* Icon */}
          <Calendar className="w-6 h-6 relative text-brown" />
          {/* Describtion */}
          <div className="text-[#6b5c56] text-xs font-medium font-['Bai Jamjuree'] leading-tight">
            Date :{' '}
          </div>
        </div>
        <DatePickerWithRange task={task} />
      </div>
    </div>
  );
};

export { MenuBar };
