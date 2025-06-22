"use client";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
interface UserWorkloadProps {
  userWorkload: UserWorkload[];
  setUserWorkload: React.Dispatch<React.SetStateAction<UserWorkload[]>>;
}

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
  }));
const AssignIcon = () => (
  <img src="/asset/icon/assigned.svg" alt="Assigned Icon" className="w-4 h-4" />
);
const InrecheckIcon= () => (
  <img src="/asset/icon/inrecheck.svg" alt="In Recheck Icon" className="w-4 h-4" />
);
const UnderReviewIcon = () => (
  <img src="/asset/icon/underreview.svg" alt="Under Review Icon" className="w-4 h-4" />
);
const DoneIcon = () => (
  <img src="/asset/icon/done.svg" alt="Done Icon" className="w-4 h-4" />
);
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
      <ChartContainer config={chartConfig}  className="max-h-[500px] w-full">
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
            
          <Bar dataKey="done" fill="#489CFF"  stackId="a" />
          <Bar dataKey="underReview" fill="#69BCA0"  stackId="a" />
          <Bar dataKey="inrecheck" fill="#F4BE38"  stackId="a" />
          <Bar dataKey="assigned" fill="#F79939"  stackId="a" />

          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        </BarChart>
      </ChartContainer>
    </div>
  </div>
</CardContent>


    
    </>
  );
}

export default WorkloadChart;
