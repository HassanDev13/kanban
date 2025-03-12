"use client";

import * as React from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Column } from "./Column";
import { AddColumn } from "./AddColumn";
import { TaskDialog } from "./TaskDialog";
import { TaskCard } from "./TaskCard";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Column as ColumnType, Task, User } from "./types";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { initialColumns, users } from "./data";

export function KanbanBoard() {
  const [columns, setColumns] = React.useState<ColumnType[]>(initialColumns);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = React.useState<ColumnType | null>(
    null
  );
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<{
    columnId: string;
    taskId: string;
  } | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = React.useState<ColumnType | null>(
    null
  ); // Added for column overlay
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 10 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;
    setActiveId(activeId);

    // Keep your existing code here
    if (!activeId.includes(":")) {
      const column = columns.find((col) => col.id === activeId);
      if (column) {
        setActiveColumn(column);
        setActiveTask(null);
      }
    } else {
      const [columnId, taskId] = activeId.split(":");
      const column = columns.find((col) => col.id === columnId);
      const task = column?.tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        setActiveColumn(null);
      }
    }
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      return;
    }

    setOverId(over.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);
    setActiveColumn(null);
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Column drag
    if (!activeId.includes(":")) {
      const oldIndex = columns.findIndex((col) => col.id === activeId);
      const newIndex = columns.findIndex((col) => col.id === overId);
      if (oldIndex !== newIndex) {
        const newColumns = structuredClone(columns);
        const [movedColumn] = newColumns.splice(oldIndex, 1);
        newColumns.splice(newIndex, 0, movedColumn);
        setColumns(newColumns);
      }
      return;
    }

    // Task drag
    const [sourceColumnId, sourceTaskId] = activeId.split(":");
    const [destColumnId] = overId.split(":");

    const sourceColumn = columns.find((col) => col.id === sourceColumnId);
    const destColumn = columns.find((col) => col.id === destColumnId);

    if (!sourceColumn || !destColumn) return;

    if (
      destColumn.tasks.length >= destColumn.limit &&
      sourceColumnId !== destColumnId
    ) {
      toast.error(
        `لا يمكن إضافة المزيد من المهام إلى "${destColumn.title}" (الحد: ${destColumn.limit})`
      );
      return;
    }

    const newColumns = structuredClone(columns);
    const sourceCol = newColumns.find((col) => col.id === sourceColumnId)!;
    const destCol = newColumns.find((col) => col.id === destColumnId)!;
    const sourceIndex = sourceCol.tasks.findIndex(
      (task) => task.id === sourceTaskId
    );
    const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);

    if (sourceColumnId === destColumnId) {
      const overTaskId = overId.includes(":") ? overId.split(":")[1] : null;
      const destIndex = overTaskId
        ? destCol.tasks.findIndex((task) => task.id === overTaskId)
        : destCol.tasks.length;
      destCol.tasks.splice(destIndex, 0, movedTask);
    } else {
      const overTaskId = overId.includes(":") ? overId.split(":")[1] : null;
      const destIndex = overTaskId
        ? destCol.tasks.findIndex((task) => task.id === overTaskId)
        : destCol.tasks.length;
      destCol.tasks.splice(destIndex, 0, movedTask);
    }

    setColumns(newColumns);
  };

  const addColumn = (title: string) => {
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان للعمود");
      return;
    }
    setColumns([
      ...columns,
      {
        id: `column-${Date.now()}`,
        title,
        tasks: [],
        limit: 5,
      },
    ]);
    toast.success(`تم إضافة عمود "${title}"`);
  };

  const removeColumn = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (column?.tasks.length) {
      toast.error("لا يمكن حذف عمود يحتوي على مهام");
      return;
    }
    setColumns(columns.filter((col) => col.id !== columnId));
    toast.success(`تم حذف عمود "${column?.title}"`);
  };

  const handleTaskSelect = (task: Task, column: ColumnType) => {
    setSelectedTask(task);
    setSelectedColumn(column);
    setIsTaskDialogOpen(true);
  };
  const handleUpdateLimit = (columnId: string, newLimit: number) => {
    // Validate the new limit
    if (newLimit < 0) {
      toast.error("الحد الأقصى لا يمكن أن يكون أقل من صفر");
      return;
    }

    // Find the column and check if the new limit is less than current tasks
    const column = columns.find((col) => col.id === columnId);
    if (column && column.tasks.length > newLimit) {
      toast.error(
        `لا يمكن تعيين الحد إلى ${newLimit} لأن العمود يحتوي حاليًا على ${column.tasks.length} مهام`
      );
      return;
    }

    // Update the column limit
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, limit: newLimit } : col
      )
    );

    toast.success(`تم تحديث الحد الأقصى للعمود إلى ${newLimit} مهام`);
  };
  const confirmDeleteTask = (task: Task, column: ColumnType) => {
    setTaskToDelete({ columnId: column.id, taskId: task.id });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setColumns(
        columns.map((col) =>
          col.id === taskToDelete.columnId
            ? {
                ...col,
                tasks: col.tasks.filter(
                  (task) => task.id !== taskToDelete.taskId
                ),
              }
            : col
        )
      );
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
      toast.success("تم حذف المهمة بنجاح");
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col p-4 bg-gray-100 text-right"
    >
      <h1 className="text-2xl font-bold mb-4">لوحة كانبان</h1>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((col) => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-col md:flex-row-reverse gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-120px)]">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onRemoveColumn={removeColumn}
                onTaskSelect={handleTaskSelect}
                onUpdateLimit={handleUpdateLimit}
                onDeleteTask={confirmDeleteTask}
                isOver={overId === column.id}
                isActive={activeId === column.id}
              />
            ))}
            <AddColumn onAddColumn={addColumn} />
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {" "}
          {/* Disable drop animation for smoother feel */}
          {activeColumn ? (
            <Column
              column={activeColumn}
              onRemoveColumn={() => {}}
              onTaskSelect={() => {}}
              onDeleteTask={() => {}}
              isDragging={true} // Indicate dragging state
            />
          ) : activeTask ? (
            <TaskCard
              task={activeTask}
              columnId={
                columns.find((col) =>
                  col.tasks.some((t) => t.id === activeTask.id)
                )?.id || ""
              }
              onSelect={() => {}}
              onDeleteTask={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && selectedColumn && (
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          task={selectedTask}
          column={selectedColumn}
          onTaskUpdate={(taskId, updates) => {
            setColumns(
              columns.map((col) => ({
                ...col,
                tasks: col.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updates } : task
                ),
              }))
            );
          }}
          onTaskCreate={(columnId, task) => {
            setColumns(
              columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      tasks: [
                        ...col.tasks,
                        { ...task, id: `task-${Date.now()}` },
                      ],
                    }
                  : col
              )
            );
          }}
          onRemoveTask={(taskId) =>
            confirmDeleteTask(selectedTask, selectedColumn)
          }
          users={users}
          mode="edit"
        />
      )}

      <TaskDialog
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        column={columns[0]}
        onTaskCreate={(columnId, task) => {
          setColumns(
            columns.map((col) =>
              col.id === columnId
                ? {
                    ...col,
                    tasks: [
                      ...col.tasks,
                      { ...task, id: `task-${Date.now()}` },
                    ],
                  }
                : col
            )
          );
          setIsAddTaskModalOpen(false);
        }}
        onTaskUpdate={() => {}}
        onRemoveTask={() => {}}
        users={users}
        mode="add"
      />

      <Button
        className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg"
        onClick={() => setIsAddTaskModalOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذه المهمة؟ هذا الإجراء لا يمكن التراجع
              عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
