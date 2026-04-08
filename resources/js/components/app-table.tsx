import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppEmpty from '@/components/app-empty';
import { ListTodo } from 'lucide-react';

/** Applied to the inner `<table>` for consistent app-wide table styling */
export const DATA_TABLE_SURFACE_CLASS =
  'bg-[#fafaf9] shadow-sm rounded-md dark:bg-primary/5';

/** Outer chrome: border + radius around the scroll area */
export const DATA_TABLE_CONTAINER_CLASS = 'rounded-md border';

type DataTableProps = {
  children: React.ReactNode;
  className?: string;
  tableClassName?: string;
};

/**
 * Bordered table shell when you compose `TableHeader` / `TableBody` yourself.
 * For prop-driven rows, use {@link AppTable}.
 */
export function DataTable({ children, className, tableClassName }: DataTableProps) {
  return (
    <div className={cn(DATA_TABLE_CONTAINER_CLASS, className)}>
      <Table className={cn(DATA_TABLE_SURFACE_CLASS, tableClassName)}>{children}</Table>
    </div>
  );
}

type DataTableToolbarProps = {
  children: React.ReactNode;
  className?: string;
};

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center gap-2', className)}>{children}</div>
  );
}

type DataTablePaginationRowProps = {
  children: React.ReactNode;
  className?: string;
};

/** Footer for “Showing x–y of z” + pagination controls */
export function DataTablePaginationRow({ children, className }: DataTablePaginationRowProps) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}

export type AppTableColumn<T> = {
  id: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  /** Cell content for this column */
  render: (row: T, index: number) => React.ReactNode;
};

type AppTableBaseProps<T> = {
  items: T[];
  /** Stable row key (defaults to `row.id` when present, else index) */
  getRowKey?: (row: T, index: number) => React.Key;
  /** Optional trailing column — use `action` **or** `renderAction` */
  actionsHeader?: React.ReactNode;
  actionsHeaderClassName?: string;
  actionsCellClassName?: string;
  /** Component receiving `row` and `index` for the actions column */
  action?: React.ComponentType<{ row: T; index: number }>;
  renderAction?: (row: T, index: number) => React.ReactNode;
  className?: string;
  tableClassName?: string;
  /** Shown when `items.length === 0` */
  emptyState?: React.ReactNode;
  onRowClick?: (row: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;
  getRowClassName?: (row: T, index: number) => string | undefined;
};

/** Pass `columns` or `headers` (same shape: id, header, render). */
export type AppTableProps<T> = AppTableBaseProps<T> &
  (
    | { columns: AppTableColumn<T>[]; headers?: never }
    | { headers: AppTableColumn<T>[]; columns?: never }
  );

function defaultRowKey<T>(row: T, index: number): React.Key {
  if (row != null && typeof row === 'object' && 'id' in row && (row as { id?: unknown }).id != null) {
    return String((row as { id: React.Key }).id);
  }
  return index;
}

export function AppTable<T>({
  items,
  columns,
  headers,
  getRowKey = defaultRowKey,
  actionsHeader = 'Actions',
  actionsHeaderClassName,
  actionsCellClassName = 'text-right',
  action: ActionComponent,
  renderAction,
  className,
  tableClassName,
  emptyState,
  onRowClick,
  getRowClassName,
}: AppTableProps<T>) {
  const resolvedColumns = columns ?? headers ?? [];
  const showActions = Boolean(renderAction || ActionComponent);

  if (items.length === 0 && emptyState != null) {
    return <>{emptyState}</>;
  }

  if (items.length === 0) {
    return (
      <AppEmpty
        title="No rows to display."
        description="No rows to display."
        icon={<ListTodo className="w-4 h-4" />}
      />
    );
  }

  return (
    <div className={cn(DATA_TABLE_CONTAINER_CLASS, className)}>
      <Table className={cn(DATA_TABLE_SURFACE_CLASS, tableClassName)}>
        <TableHeader>
          <TableRow>
            {resolvedColumns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(col.headerClassName, 'text-primary text-sm font-medium')}
              >
                {col.header}
              </TableHead>
            ))}
            {showActions && (
              <TableHead className={cn('w-[100px]', actionsHeaderClassName)}>
                {actionsHeader}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row, index) => (
            <TableRow
              key={getRowKey(row, index)}
              className={cn(
                onRowClick && 'cursor-pointer',
                getRowClassName?.(row, index)
              )}
              onClick={
                onRowClick
                  ? (e) => onRowClick(row, index, e)
                  : undefined
              }
            >
              {resolvedColumns.map((col) => (
                <TableCell key={col.id} className={col.cellClassName}>
                  {col.render(row, index)}
                </TableCell>
              ))}
              {showActions && (
                <TableCell
                  className={actionsCellClassName}
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderAction
                    ? renderAction(row, index)
                    : ActionComponent && <ActionComponent row={row} index={index} />}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
