'use client';
import type { UserWorkload } from '@/lib/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/tableCustom';
import { statusSectionsWorkload } from '@/lib/taskUtils';
import React from 'react';
interface EachUserWorkloadProps {
  eachUserWorkload: UserWorkload[];
  setEachUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
}

const InrecheckIcon = () => (
  <img src="/asset/icon/inrecheck.svg" alt="In Recheck Icon" className="w-4 h-4" />
);

const getStatusIcon = (status: string) => {
  const section = statusSectionsWorkload.find((section) => section.status === status);
  return section ? section.icon : '/asset/icon/unassigned.svg';
};

const getAcceptanceStatusColor = (status: string) => {
  switch (status) {
    case 'Overdue':
      return 'font-BaiJamjuree text-sm font-bold  text-[#EF4444]';
    case 'In time':
      return 'font-BaiJamjuree text-sm  font-bold text-[#22C55E]';
    default:
      return 'font-BaiJamjuree text-sm font-bold  text-black';
  }
};

export function WorkloadEachUserTable({
  eachUserWorkload,
  setEachUserWorkload,
}: EachUserWorkloadProps) {
  return (
    <div className="p-[30px] bg-white rounded-md   outline outline-1 outline-stone-600 ">
      <Table className="w-full bg-white  rounded-md border-0 border-b-0">
        <TableHeader>
          <TableRow className="flex w-full items-center border-0 !border-b-0 rounded-sm  hover:bg-transparent cursor-default  p-0 ">
            <TableHead className="w-[960px] ">
              {/* <div className="font-BaiJamjuree text-sm text-black font-bold ">Project/Task</div> */}
            </TableHead>

            <TableHead className="w-[170px] ml-5 text-center ">
              <div className="font-BaiJamjuree text-sm text-black font-bold ">
                Acceptance Status
              </div>
            </TableHead>
            <TableHead className="w-[150px] ml-5 text-center ">
              <div className="font-BaiJamjuree text-sm text-black font-bold">Task Status</div>
            </TableHead>
            <TableHead className="w-[130px] ml-5 text-center ">
              <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree  text-black font-bold">
                <InrecheckIcon /> Rechecked
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {eachUserWorkload.map((user) =>
            user.projects.map((project) => (
              <React.Fragment key={`project-group-${project.id}`}>
                <TableRow className="hover:bg-transparent cursor-default">
                  <TableCell
                    colSpan={4}
                    className="flex flex-row font-BaiJamjuree font-bold py-[6px] px-0">
                    Project title:
                    <div className="ml-1 font-medium">{project.title} </div>
                  </TableCell>
                </TableRow>

                {project.tasks.map((task) => (
                  <TableRow key={`task-${task.taskId}`} className="flex w-full border-0   ">
                    <TableCell className="font-BaiJamjuree w-[960px] ml-0 pt-1 pb-1">
                      {task.name}
                    </TableCell>
                    <TableCell className="font-BaiJamjuree w-[170px] text-center ml-5 pt-1 pb-1">
                      <span className={getAcceptanceStatusColor(task.acceptanceStatus)}>
                        {task.acceptanceStatus}
                      </span>
                    </TableCell>
                    <TableCell className="font-BaiJamjuree w-[150px] text-center ml-5 pt-1 pb-1">
                      <div className="flex flex-row items-center justify-center">
                        <img
                          src={getStatusIcon(task.taskStatus)}
                          alt={`${task.taskStatus} Icon`}
                          className="w-4 h-4 mr-2"
                        />
                        {task.taskStatus}
                      </div>
                    </TableCell>
                    <TableCell className="font-BaiJamjuree w-[130px] text-center ml-5 font-bold pt-1 pb-1">
                      {task.rechecked}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="border-0 hover:bg-transparent">
                  {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                  <TableCell colSpan={4} className="py-3"></TableCell>
                </TableRow>
              </React.Fragment>
            )),
          )}
        </TableBody>
      </Table>
    </div>
  );
}
