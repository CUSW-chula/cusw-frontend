"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
interface UserWorkloadProps {
  userWorkload: UserWorkload[];
  setUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
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

export function WorkloadChart({
  userWorkload,
  setUserWorkload,
}: UserWorkloadProps) {
  const chartData = userWorkload.map((user) => ({
    name: user.name,
    assigned: user.metrics.breakdown.assigned,
    inrecheck: user.metrics.breakdown.inRecheck,
    underReview: user.metrics.breakdown.underReview,
    done: user.metrics.breakdown.done,
    perAssigned: user.metrics.breakdown.perAssigned,
    perInRecheck: user.metrics.breakdown.perInRecheck,
    perDone: user.metrics.breakdown.perDone,
    perUnderReview: user.metrics.breakdown.perUnderReview,
  }));

  const chartConfig = {
    done: { label: "Done", icon: DoneIcon },
    underReview: { label: "Under Review", icon: UnderReviewIcon },
    inrecheck: { label: "In Recheck", icon: InrecheckIcon },
    assigned: { label: "Assigned", icon: AssignIcon },
  };

  const barSize = 80;
  const barCategoryGap = 50;
  const chartWidth = userWorkload.length * (barSize + barCategoryGap);

  return (
    <>
      <CardContent>
        <div className="w-full overflow-x-auto ">
          <div style={{ minWidth: `${chartWidth}px`, height: "500px" }}>
            <ChartContainer
              config={chartConfig}
              className="max-h-[500px] w-full"
            >
              <BarChart
                width={chartWidth}
                height={300}
                data={chartData}
                barSize={barSize}
                barCategoryGap={barCategoryGap}
                barGap={0}
              >
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={true}
                />

                <Bar dataKey="done" fill="#489CFF" stackId="a" />
                <Bar dataKey="underReview" fill="#69BCA0" stackId="a" />
                <Bar dataKey="inrecheck" fill="#F4BE38" stackId="a" />
                <Bar
                  dataKey="assigned"
                  fill="#F79939"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />

                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </>
  );
}
export default WorkloadChart;

export function WorkloadAllUserTable({
  userWorkload,
  setUserWorkload,
}: UserWorkloadProps) {
  return (
    <div className="p-7 bg-white rounded-md">
      <Table className="w-full  bg-white h-[570px] rounded-md border-0  border-b-0">
        <TableRow className="  flex w-full  items-center border-0 border-b-0 rounded-sm bg-[#F9FAFB]">
          <TableHead className="w-[450px] py-3">
            <div className="font-BaiJamjuree text-sm text-black font-bold ">
              User
            </div>
          </TableHead>
          <TableHead className="w-[112px] ml-5 text-center py-3">
            <div className="font-BaiJamjuree text-sm text-black font-bold ">
              Task Count
            </div>
          </TableHead>
          <TableHead className="w-[112px] ml-5 text-center py-3">
            <div className="font-BaiJamjuree text-sm text-black font-bold">
              Rechecked
            </div>
          </TableHead>
          <TableHead className="w-[112px] ml-5 text-center py-3">
            <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree text-black font-bold">
              <AssignIcon /> Assigned
            </div>
          </TableHead>
          <TableHead className="w-[130px] ml-5 text-center py-3">
            <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree  text-black font-bold">
              <InrecheckIcon /> In recheck
            </div>
          </TableHead>
          <TableHead className="w-[150px] ml-5 text-center py-3">
            <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree text-black font-bold">
              <UnderReviewIcon /> Under Review
            </div>
          </TableHead>
          <TableHead className="w-[112px] ml-5 text-center py-3">
            <div className="flex flex-row items-center gap-2 text-sm font-BaiJamjuree text-black font-bold">
              <DoneIcon /> Done
            </div>
          </TableHead>
        </TableRow>

        {/* ส่วน TableBody ที่ scroll ได้ */}

        <TableBody className="block overflow-y-auto h-[500px] w-full">
          {userWorkload.map((user) => (
            <Link key={user.userId} href={"/admin"} className="block">
              <TableRow key={user.userId} className="flex w-full border-0  ">
                <TableCell className="w-[450px] text-start">
                  {user.name}
                </TableCell>
                <TableCell className="w-[112px]  ml-5 text-center">
                  {user.metrics.taskCount}
                </TableCell>
                <TableCell className="w-[112px]  ml-5 text-center">
                  {user.metrics.rechecked}
                </TableCell>
                <TableCell className="w-[112px]  ml-5 text-center">
                  {user.metrics.breakdown.assigned}
                </TableCell>
                <TableCell className="w-[130px]  ml-5 text-center">
                  {user.metrics.breakdown.inRecheck}
                </TableCell>
                <TableCell className="w-[150px]  ml-5 text-center">
                  {user.metrics.breakdown.underReview}
                </TableCell>
                <TableCell className="w-[112px]  ml-5 text-center">
                  {user.metrics.breakdown.done}
                </TableCell>
              </TableRow>
            </Link>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
