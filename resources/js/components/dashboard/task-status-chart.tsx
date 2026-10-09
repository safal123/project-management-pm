import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell, Legend } from 'recharts';
import AppEmpty from '@/components/app-empty';
import { BarChart } from 'lucide-react';

interface TasksByStatus {
  todo: number;
  in_progress: number;
  done: number;
}

interface TaskStatusChartProps {
  tasksByStatus: TasksByStatus;
}

const STATUS_COLORS = {
  todo: '#64748b',
  in_progress: '#0ea5e9',
  done: '#10b981',
}

const chartConfig = {
  todo: { label: 'To Do', color: STATUS_COLORS.todo },
  in_progress: { label: 'In Progress', color: STATUS_COLORS.in_progress },
  done: { label: 'Done', color: STATUS_COLORS.done },
} satisfies ChartConfig;

function toNumber(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') return parseInt(val, 10) || 0;
  return 0;
}

export function TaskStatusChart({ tasksByStatus }: TaskStatusChartProps) {
  const data = [
    { name: 'To Do', value: toNumber(tasksByStatus?.todo), fill: STATUS_COLORS.todo },
    { name: 'In Progress', value: toNumber(tasksByStatus?.in_progress), fill: STATUS_COLORS.in_progress },
    { name: 'Done', value: toNumber(tasksByStatus?.done), fill: STATUS_COLORS.done },
  ];

  const chartData = data.filter((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hasData = total > 0;

  return (
    <Card className="gap-3 py-3.5 shadow-sm">
      <CardHeader className="px-4">
        <CardTitle className="text-[13px] font-medium">Task status</CardTitle>
        <CardDescription className="text-xs">Distribution of tasks by status</CardDescription>
      </CardHeader>

      <CardContent className="px-4">
        {hasData ? (
          <div className="h-[200px] w-full">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full aspect-auto
              [&_.recharts-pie]:outline-none
              [&_.recharts-legend-item]:text-xs"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  strokeWidth={1}
                  stroke="var(--card)"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  height={40}
                  formatter={(value) => (
                    <span className="text-muted-foreground text-xs">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </div>
        ) : (
          <AppEmpty
            title="No tasks yet"
            description="Create a project and add tasks to see the chart."
            icon={<BarChart />}
          />
        )}
      </CardContent>
    </Card>
  );
}
