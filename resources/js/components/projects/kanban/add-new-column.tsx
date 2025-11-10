import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { router } from '@inertiajs/react'
import { usePage } from '@inertiajs/react'
import { Project, SharedData } from '@/types'

const AddNewColumn = () => {
  const { project } = usePage<SharedData & { project: Project }>().props

  const createNewColumn = () => {
    router.post(route('tasks.store'), {
      title: 'New Section',
      description: 'New Section Description',
      project_id: project.id,
      parent_task_id: null,
      workspace_id: project.workspace_id,
    }, {
      preserveScroll: true,
    })
  }

  return (
    <div className="w-[350px] flex-shrink-0">
      <Button
        onClick={createNewColumn}
        variant="outline"
        className="bg-primary/10 text-primary w-full h-[120px] flex flex-col items-center justify-center gap-2 border-2 border-dashed hover:border-primary/50 hover:bg-accent/5 transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add Column</span>
      </Button>
    </div>
  )
}

export default AddNewColumn

