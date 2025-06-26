"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { UserWorkload } from "@/lib/shared";

import { Circle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

interface EachUserWorkloadProps {
  eachUserWorkload: UserWorkload[];
  setEachUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
}

const AssignIcon = () => (
  <img src="/asset/icon/assigned.svg" alt="Assigned Icon" className="w-4 h-4" />
);
const InrecheckIcon = () => (
  <img
    src="/asset/icon/inrecheck.svg"
    alt="In Recheck Icon"
    className="w-4 h-4"
  />
);
const UnderReviewIcon = () => (
  <img
    src="/asset/icon/underreview.svg"
    alt="Under Review Icon"
    className="w-4 h-4"
  />
);
const DoneIcon = () => (
  <img src="/asset/icon/done.svg" alt="Done Icon" className="w-4 h-4" />
);
const getInitials = (name: string) => {
  const nameParts = name.split(" ");
  return nameParts.map((part) => part[0]).join(""); // Take the first letter of each part
};

export function WorkloadEachUserTable({
  eachUserWorkload,
  setEachUserWorkload,
}: EachUserWorkloadProps) {
  return (
    <div className="p-7 bg-white rounded-md">
      <Table className="w-full bg-white  rounded-md border-0 border-b-0">
        <TableHeader >
          <TableRow className="flex w-full items-center border-0 !border-b-0 rounded-sm  ">
            <TableHead className="w-[830px] py-3">
              <div className="font-BaiJamjuree text-sm text-black font-bold ">
                Project/Task
              </div>
            </TableHead>

            <TableHead className="w-[170px] ml-5 text-center py-3">
              <div className="font-BaiJamjuree text-sm text-black font-bold ">
                Acceptance Status
              </div>
            </TableHead>
            <TableHead className="w-[130px] ml-5 text-center py-3">
              <div className="font-BaiJamjuree text-sm text-black font-bold">
                Task Status
              </div>
            </TableHead>
            <TableHead className="w-[130px] ml-5 text-center py-3">
              <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree  text-black font-bold">
                <InrecheckIcon /> In recheck
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {eachUserWorkload.flatMap((user) =>
            user.projects.flatMap((project) => [
              <TableRow
                key={`project-${project.id}`}
                className="hover:bg-transparent cursor-default "
              >
                <TableCell colSpan={4} className="font-bold py-2 ">
                  Project Title: {project.title}
                </TableCell>
              </TableRow>,
              ...project.tasks.map((task) => (
                <TableRow
                  key={`task-${task.taskId}`}
                  className="flex w-full  border-0"
                >
                  <TableCell className="w-[830px] ml-0">{task.name}</TableCell>
                  <TableCell className="w-[170px] text-center ml-5">
                    {task.acceptanceStatus}
                  </TableCell>
                  <TableCell className="w-[130px] text-center ml-5">
                    {task.taskStatus}
                  </TableCell>
                  <TableCell className="w-[130px] text-center ml-5">
                    {task.rechecked}
                  </TableCell>
                </TableRow>
              )),
              <TableRow
                key={`spacer-${project.id}`}
                className="border-0 hover:bg-transparent"
              >
                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                <TableCell colSpan={4} className="py-3"></TableCell>
              </TableRow>,
            ])
          )}
        </TableBody>
      </Table>
    </div>
  );
}
