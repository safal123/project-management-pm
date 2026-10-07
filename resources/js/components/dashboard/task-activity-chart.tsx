import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export interface TaskActivityPoint {
  date: string;
  created: number;
  completed: number;
}

interface TaskActivityChartProps {
  data: TaskActivityPoint[];
}

const chartConfig = {
  created: {
    label: 'Created',
    color: 'var(--foreground)',
  },
  completed: {
    label: 'Completed',
    color: 'var(--muted-foreground)',
  },
} satisfies ChartConfig;

function formatTick(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TaskActivityChart({ data }: TaskActivityChartProps) {
  const chartData = Array.isArray(data) ? data : [];

  return (
    <Card className="gap-3 py-3.5 shadow-sm">
      <CardHeader className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-[13px] font-medium">Task activity</CardTitle>
            <CardDescription className="text-xs">
              Created vs completed over the last 14 days
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-foreground" />
              Created
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              Completed
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="h-[220px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={chartData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatTick}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={22}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatTick(String(value))}
                  />
                }
              />
              <Line
                dataKey="created"
                type="monotone"
                stroke="var(--color-created)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3 }}
              />
              <Line
                dataKey="completed"
                type="monotone"
                stroke="var(--color-completed)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
