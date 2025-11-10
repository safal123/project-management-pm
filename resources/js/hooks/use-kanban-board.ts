import { useState, useEffect, useMemo } from "react";
import { Task } from "@/types";
import { arrayMove } from "@dnd-kit/sortable";
import { router } from "@inertiajs/react";

interface Column {
  id: string;
  title: string;
  order: number | null;
  tasks: Task[];
}

export const useKanbanBoard = (tasks: Task[]) => {
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [taskOrderByColumn, setTaskOrderByColumn] = useState<Record<string, string[]>>({});
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  // Parse tasks into columns
  const columns = useMemo(() => {
    const parentTasks = tasks.filter((t) => t.parent_task_id === null);
    const childTasks = tasks.filter((t) => t.parent_task_id !== null);

    const cols = parentTasks.map((parent) => ({
      id: parent.id,
      title: parent.title,
      order: parent.order,
      tasks: childTasks.filter((t) => t.parent_task_id === parent.id),
    }));

    return cols;
  }, [tasks]);

  // Initialize and update task order for columns
  useEffect(() => {
    const newTaskOrder: Record<string, string[]> = { ...taskOrderByColumn };

    columns.forEach((col) => {
      const currentTaskIds = col.tasks.map((t) => t.id);

      if (!taskOrderByColumn[col.id]) {
        // Initialize new column
        newTaskOrder[col.id] = currentTaskIds;
      } else {
        // Update existing column with new tasks
        const existingOrder = taskOrderByColumn[col.id];
        const newTaskIds = currentTaskIds.filter((id) => !existingOrder.includes(id));
        if (newTaskIds.length > 0) {
          // Append new tasks to the end
          newTaskOrder[col.id] = [...existingOrder, ...newTaskIds];
        } else if (currentTaskIds.length !== existingOrder.length) {
          // Tasks were deleted or reordered - sync completely
          newTaskOrder[col.id] = currentTaskIds;
        }
      }
    });

    setTaskOrderByColumn(newTaskOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  // Reconcile column order whenever columns list changes
  useEffect(() => {
    if (columns.length === 0) return;

    const currentIds = columns.map((c) => c.id);

    if (columnOrder.length === 0) {
      setColumnOrder(currentIds);
      return;
    }

    const filtered = columnOrder.filter((id) => currentIds.includes(id));
    const missing = currentIds.filter((id) => !filtered.includes(id));
    const next = [...filtered, ...missing];

    const changed = next.length !== columnOrder.length || next.some((id, i) => id !== columnOrder[i]);
    if (changed) setColumnOrder(next);
  }, [columns, columnOrder]);

  const columnsIds = useMemo(() =>
    columnOrder.length > 0 ? columnOrder : columns.map((column) => column.id),
    [columns, columnOrder]
  );

  const sortedColumns = useMemo(() => {
    if (columnOrder.length === 0) return columns;
    return columnOrder
      .map((id) => columns.find((c) => c.id === id))
      .filter((col): col is Column => col !== undefined);
  }, [columns, columnOrder]);

  const handleDragEnd = (activeId: string, overId: string | null, activeType: string | undefined) => {
    setOverColumnId(null); // Reset drag over state

    if (!overId || activeId === overId) {
      return;
    }

    if (activeType === 'Column') {
      setActiveColumn(null);
      const oldIndex = columnOrder.findIndex((id) => id === activeId);
      const newIndex = columnOrder.findIndex((id) => id === overId);
      const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
      setColumnOrder(newOrder);

      router.post(route('tasks.reorder'), {
        taskIds: newOrder,
        sourceColumnId: activeId,
        targetColumnId: overId,
      }, {
        preserveScroll: true,
      });
      return;
    }

    if (activeType === 'Task') {
      setActiveTask(null);

      const activeColumn = columns.find((c) => c.tasks.some((t) => t.id === activeId));
      const overColumn = columns.find((c) => c.tasks.some((t) => t.id === overId) || c.id === overId);

      if (!activeColumn || !overColumn) return;

      const isSameColumn = activeColumn.id === overColumn.id;

      if (isSameColumn) {
        // Reorder within same column
        const currentOrder = taskOrderByColumn[activeColumn.id] || [];
        const overTaskItem = tasks.find((t) => t.id === overId);
        if (!overTaskItem) return;

        const oldIndex = currentOrder.findIndex((id) => id === activeId);
        const newIndex = currentOrder.findIndex((id) => id === overId);
        const newOrder = arrayMove(currentOrder, oldIndex, newIndex);

        setTaskOrderByColumn((prev) => ({
          ...prev,
          [activeColumn.id]: newOrder,
        }));

        router.post(route('tasks.reorder'), {
          taskIds: newOrder,
          sourceColumnId: activeColumn.id,
          targetColumnId: overColumn.id,
        }, {
          preserveScroll: true,
        });
      } else {
        // Move task to different column
        const taskToMove = tasks.find((t) => t.id === activeId);
        if (!taskToMove) return;

        // Remove from source column
        const sourceOrder = (taskOrderByColumn[activeColumn.id] || []).filter((id) => id !== activeId);
        setTaskOrderByColumn((prev) => ({
          ...prev,
          [activeColumn.id]: sourceOrder,
        }));

        // Get target column order
        const targetOrder = taskOrderByColumn[overColumn.id] || overColumn.tasks.map((t) => t.id);

        // Check if we're dropping over a task in the target column
        const overTask = tasks.find((t) => t.id === overId);
        const isOverTaskInTargetColumn = overTask && overColumn.tasks.some((t) => t.id === overId);

        let newTargetOrder: string[];
        if (isOverTaskInTargetColumn && overTask) {
          // Insert at the position of the task we're dropping over
          const insertIndex = targetOrder.findIndex((id) => id === overId);
          newTargetOrder = [
            ...targetOrder.slice(0, insertIndex),
            activeId,
            ...targetOrder.slice(insertIndex),
          ];
        } else {
          // Drop on column itself - append to end
          newTargetOrder = [...targetOrder, activeId];
        }

        setTaskOrderByColumn((prev) => ({
          ...prev,
          [overColumn.id]: newTargetOrder,
        }));

        // Update task's parent_task_id in database
        router.patch(route('tasks.update', activeId), {
          parent_task_id: overColumn.id,
        }, {
          preserveScroll: true,
        });
      }
      return;
    }
  };

  const handleDragOver = (overId: string | null, overType: string | undefined, activeType: string | undefined, activeTaskId: string | null) => {
    if (activeType !== 'Task' || !activeTaskId) {
      setOverColumnId(null);
      return;
    }

    if (!overId) {
      setOverColumnId(null);
      return;
    }

    if (overType === 'Column') {
      setOverColumnId(overId);
      return;
    }

    if (overType === 'Task') {
      const parentCol = columns.find((c) => c.tasks.some((t) => t.id === overId));
      setOverColumnId(parentCol ? parentCol.id : null);
      return;
    }

    setOverColumnId(null);
  };

  const getOrderedTasksForColumn = (columnId: string, columnTasks: Task[]) => {
    const orderedTaskIds = taskOrderByColumn[columnId] || columnTasks.map((t) => t.id);
    let result = orderedTaskIds
      .map((id) => {
        const taskInColumn = columnTasks.find((t) => t.id === id);
        if (taskInColumn) return taskInColumn;
        return tasks.find((t) => t.id === id);
      })
      .filter(Boolean);

    // If dragging a task over this column, show it temporarily
    if (activeTask && overColumnId === columnId) {
      const activeTaskId = activeTask.id;
      const alreadyInColumn = result.some((t) => t.id === activeTaskId);
      if (!alreadyInColumn) {
        result = [...result, activeTask];
      }
    }

    return result;
  };

  return {
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
  };
};

