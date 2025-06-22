"use client";

import { Circle } from "lucide-react";
import { Bar, BarChart, XAxis } from "recharts";
import type { UserWorkload } from "@/lib/shared";

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

interface UserWorkloadProps {
  userWorkload: UserWorkload[];
}

const chartConfig = {
  assigned: {
    label: "Assigned",
    color: "var(--chart-1)",
    icon: Circle,
  },
  inrecheck: {
    label: "In Recheck",
    color: "var(--chart-2)",
    icon: Circle,
  },
  underreview: {
    label: "Under Review",
    color: "var(--chart-3)",
    icon: Circle,
  },
  done: {
    label: "Done",
    color: "var(--chart-4)",
    icon: Circle,
  },
} satisfies ChartConfig;

export function ChartTooltipIcons({ userWorkload }: UserWorkloadProps) {
  const chartData = userWorkload.map((user) => ({
    name: user.name,
    assigned: user.metrics.breakdown.assigned,
    inrecheck: user.metrics.breakdown.inRecheck,
    underReview: user.metrics.breakdown.underReview,
    done: user.metrics.breakdown.done,
    perAssigned: user.metrics.breakdown.perAssigned,
    perInRecheck: user.metrics.breakdown.perInRecheck,
    perUnderReview: user.metrics.breakdown.perUnderReview,
    perDone: user.metrics.breakdown.perDone,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tooltip - Icons</CardTitle>
        <CardDescription>Tooltip with icons.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                 <Bar dataKey="done" fill="#489CFF" name="Done" stackId="a" />
              <Bar
                dataKey="underReview"
                fill="#69BCA0"
                name="Under Review"
                stackId="a"
              />
              <Bar
                dataKey="inrecheck"
                fill="#F4BE38"
                name="In Recheck"
                stackId="a"
              />
              <Bar
                dataKey="assigned"
                fill="#F79939"
                name="Assigned"
                stackId="a"
              />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel={false} />}
              cursor={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
