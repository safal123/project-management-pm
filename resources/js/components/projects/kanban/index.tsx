import React from "react";
import { Task, Project } from "@/types";
import ColumnContainer from "./column-container";
import AddNewColumn from "./add-new-column";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import ColumnTaskContainer from "./column-task-container";
import { useKanbanBoard } from "@/hooks/use-kanban-board";

interface KanbanBoardProps {
  tasks: Task[];
  project: Project;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
  const {
    columns,
    sortedColumns,
    columnsIds,
    activeColumn,
    activeTask,
    setActiveColumn,
    setActiveTask,
    handleDragEnd,
    handleDragOver,
    getOrderedTasksForColumn,
  } = useKanbanBoard(tasks);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      const column = columns.find((c) => c.id === event.active.id);
      if (column) {
        setActiveColumn(column);
      }
      return;
    }
    if (event.active.data.current?.type === 'Task') {
      console.log(event.active.data.current);
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) {
        setActiveTask(task);
      }
      return;
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    handleDragEnd(
      active.id as string,
      over?.id as string | null,
      active.data.current?.type
    );
  }

  const sensors = useSensors(
    useSensor(
      PointerSensor,
      {
        activationConstraint: {
          distance: 5,
        },
      }
    )
  )

  const onDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    handleDragOver(
      over?.id as string | null,
      over?.data.current?.type,
      active.data.current?.type,
      active.id as string | null
    );
  }

  return (
    <div className="w-full h-full flex items-start justify-start overflow-x-auto px-8 py-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-4 max-h-[calc(100vh-220px)]">
          <SortableContext items={columnsIds} strategy={horizontalListSortingStrategy}>
            {sortedColumns.map((column) => (
              <ColumnContainer
                key={column?.id}
                column={column}
                tasks={getOrderedTasksForColumn(column?.id || '', column?.tasks || []) as Task[]}
              />
            ))}
            <AddNewColumn />
          </SortableContext>
        </div>
        <DragOverlay>
          {activeColumn ? (
            <ColumnContainer
              column={activeColumn}
              tasks={activeColumn.tasks}
            />
          ) : null}
          {activeTask ? (
            <ColumnTaskContainer task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
