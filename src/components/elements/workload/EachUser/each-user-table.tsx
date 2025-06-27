'use client';
import type { UserWorkload } from '@/lib/shared';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <div className="p-7 bg-white rounded-md">
      <Table className="w-full bg-white  rounded-md border-0 border-b-0">
        <TableHeader>
          <TableRow className="flex w-full items-center border-0 !border-b-0 rounded-sm  hover:bg-transparent cursor-default  ">
            <TableHead className="w-[830px] py-3">
              <div className="font-BaiJamjuree text-sm text-black font-bold ">Project/Task</div>
            </TableHead>

            <TableHead className="w-[170px] ml-5 text-center py-3">
              <div className="font-BaiJamjuree text-sm text-black font-bold ">
                Acceptance Status
              </div>
            </TableHead>
            <TableHead className="w-[150px] ml-5 text-center py-3">
              <div className="font-BaiJamjuree text-sm text-black font-bold">Task Status</div>
            </TableHead>
            <TableHead className="w-[130px] ml-5 text-center py-3">
              <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree  text-black font-bold">
                <InrecheckIcon /> In recheck
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {eachUserWorkload.map((user) =>
            user.projects.map((project) => (
              <React.Fragment key={`project-group-${project.id}`}>
                <TableRow className="hover:bg-transparent cursor-default">
                  <TableCell colSpan={4} className="font-BaiJamjuree font-bold py-2">
                    Project Title: {project.title}
                  </TableCell>
                </TableRow>

                {project.tasks.map((task) => (
                  <TableRow key={`task-${task.taskId}`} className="flex w-full border-0">
                    <TableCell className="font-BaiJamjuree w-[830px] ml-0">{task.name}</TableCell>
                    <TableCell className="font-BaiJamjuree w-[170px] text-center ml-5">
                      <span className={getAcceptanceStatusColor(task.acceptanceStatus)}>
                        {task.acceptanceStatus}
                      </span>
                    </TableCell>
                    <TableCell className="font-BaiJamjuree w-[150px] text-center ml-5">
                      <div className="flex flex-row items-center justify-center">
                        <img
                          src={getStatusIcon(task.taskStatus)}
                          alt={`${task.taskStatus} Icon`}
                          className="w-4 h-4 mr-2"
                        />
                        {task.taskStatus}
                      </div>
                    </TableCell>
                    <TableCell className="font-BaiJamjuree w-[130px] text-center ml-5 font-bold">
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
