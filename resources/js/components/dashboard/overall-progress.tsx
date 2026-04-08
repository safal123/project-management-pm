import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OverallProgressProps {
  tasksDone: number;
  totalTasks: number;
  completionRate: number;
}

export function OverallProgress({
  tasksDone,
  totalTasks,
  completionRate,
}: OverallProgressProps) {
  return (
    <Card className="dark:bg-primary/5 dark:border-primary/20">
      <CardHeader>
        <CardTitle>Overall Progress</CardTitle>
        <CardDescription className="dark:text-muted-foreground">
          Task completion rate across your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {tasksDone} of {totalTasks} tasks completed
            </span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
