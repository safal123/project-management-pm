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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from 'recharts';
import AppEmpty from '@/components/app-empty';
import { BarChart3 } from 'lucide-react';

interface TasksByProject {
  name: string;
  total: number;
  slug: string;
}

interface TasksByProjectChartProps {
  data: TasksByProject[];
}

const PROJECT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#8b5cf6']

const barChartConfig = {
  total: {
    label: 'Tasks',
    color: PROJECT_COLORS[0],
  },
} satisfies ChartConfig;

function toNumber(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') return parseInt(val, 10) || 0;
  return 0;
}

export function TasksByProjectChart({ data }: TasksByProjectChartProps) {
  // Ensure we have an array (Inertia/API may send object with numeric keys)
  const rawData = Array.isArray(data) ? data : Object.values(data ?? {});
  // Normalize data - ensure total is always a number (API may send string)
  const normalizedData = rawData
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      name: String(item.name ?? ''),
      total: toNumber(item.total),
      slug: String(item.slug ?? ''),
    }));
  const hasData = normalizedData.length > 0;

  return (
    <Card className="gap-3 py-3.5 shadow-sm">
      <CardHeader className="px-4">
        <CardTitle className="text-[13px] font-medium">Tasks by project</CardTitle>
        <CardDescription className="text-xs">Task count across your top projects</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        {hasData ? (
          <div className="h-[200px] w-full">
            <ChartContainer
              config={barChartConfig}
              className="h-full w-full"
            >
              <BarChart data={normalizedData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) =>
                    typeof v === 'string' && v.length > 12 ? `${v.slice(0, 12)}…` : v
                  }
                />
                <YAxis tickLine={false} axisLine={false} width={24} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent formatter={(value) => [`${value} Tasks`]} />
                  }
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {normalizedData.map((entry, index) => (
                    <Cell
                      key={entry.slug || entry.name}
                      fill={PROJECT_COLORS[index % PROJECT_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        ) : (
          <AppEmpty
            title="No projects with tasks yet"
            description="Create a project and add tasks to see the chart."
            icon={<BarChart3 />}
          />
        )}
      </CardContent>
    </Card>
  );
}
