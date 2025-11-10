import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { Plus } from 'lucide-react'

const AddNewTask = ({ projectId, parentTaskId, workspaceId }: { projectId: string, parentTaskId: string, workspaceId: string }) => {
  const createNewTask = () => {
    router.post(route('tasks.store'), {
      title: 'New Task',
      description: 'New Task Description',
      project_id: projectId,
      parent_task_id: parentTaskId,
      workspace_id: workspaceId,
    }, {
      preserveScroll: true,
    })
  }
  return (
    <Button
      onClick={createNewTask}
      variant="outline"
      className="w-full flex h-fit items-center justify-center gap-3 border-2 border-dashed hover:border-primary/50 hover:bg-accent/5 transition-all rounded-lg"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
        <Plus className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Add Task
      </span>
    </Button>
  )
}

export default AddNewTask

