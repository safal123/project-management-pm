import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { PaginatedData, Project, SharedData, Task } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import AppAvatar from '@/components/app-avatar'
import AppEmpty from '@/components/app-empty'
import { TaskDetailSheet } from '@/components/projects/task-detail-sheet'
import { ListTodo } from 'lucide-react'
import { STATUS_LABELS, STATUS_BADGE_COLORS, PRIORITY_LABELS, PRIORITY_BADGE_COLORS } from '@/utils/task-colors'

interface TasksTableProps {
  paginatedTasks: PaginatedData<Task> | null
}

export default function TasksTable({ paginatedTasks }: TasksTableProps) {
  const { project } = usePage<SharedData & { project: Project }>().props
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const selectedTask = paginatedTasks?.data.find((t) => t.id === selectedTaskId) ?? null

  const handleRowClick = (task: Task) => {
    setSelectedTaskId(task.id)
    setSheetOpen(true)
  }

  if (!paginatedTasks || paginatedTasks.data.length === 0) {
    return (
      <AppEmpty
        title="No tasks yet"
        description="Tasks will appear here once they're added to the project."
        icon={<ListTodo className="text-primary" />}
      />
    )
  }

  const { data: tasks, current_page, last_page, from, to, total } = paginatedTasks

  const navigateToPage = (page: number) => {
    router.get(
      route('projects.tasks', { project: project.slug }),
      { page, tab: 'table' },
      { preserveState: true, preserveScroll: true, only: ['paginatedTasks'] }
    )
  }

  const pageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (last_page <= 7) {
      for (let i = 1; i <= last_page; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current_page > 3) pages.push('ellipsis')
      for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
        pages.push(i)
      }
      if (current_page < last_page - 2) pages.push('ellipsis')
      pages.push(last_page)
    }
    return pages
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Column</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="cursor-pointer" onClick={() => handleRowClick(task)}>
                <TableCell className="font-medium">
                  {task.title}
                </TableCell>
                <TableCell>
                  {(task as Task & { parent_task?: { title: string } }).parent_task?.title ?? '—'}
                </TableCell>
                <TableCell>
                  {task.status ? (
                    <Badge className={STATUS_BADGE_COLORS[task.status] ?? ''}>
                      {STATUS_LABELS[task.status] ?? task.status}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.priority ? (
                    <Badge className={PRIORITY_BADGE_COLORS[task.priority] ?? ''}>
                      {PRIORITY_LABELS[task.priority] ?? task.priority}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.assigned_to ? (
                    <div className="flex items-center gap-2">
                      <AppAvatar
                        src={task.assigned_to.profile_picture?.url}
                        name={task.assigned_to.name}
                        size="sm"
                      />
                      <span className="text-sm">{task.assigned_to.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <span className="text-sm">
                      {new Date(task.due_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {task.progress != null ? `${task.progress}%` : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {from}–{to} of {total} tasks
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => current_page > 1 && navigateToPage(current_page - 1)}
                  className={current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {pageNumbers().map((page, idx) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === current_page}
                      onClick={() => navigateToPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => current_page < last_page && navigateToPage(current_page + 1)}
                  className={current_page >= last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}
