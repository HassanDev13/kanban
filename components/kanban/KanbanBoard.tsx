"use client";

import * as React from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { Column } from "./Column";
import { AddColumn } from "./AddColumn";
import { TaskDialog } from "./TaskDialog";
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
  const [selectedColumn, setSelectedColumn] = React.useState<ColumnType | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<{ columnId: string; taskId: string } | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    // If no destination, do nothing
    if (!destination) return;

    // Handle column dragging
    if (type === "column") {
      const newColumns = structuredClone(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);
      setColumns(newColumns);
      return;
    }

    // Handle task dragging
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    if (destColumn.tasks.length >= destColumn.limit && source.droppableId !== destination.droppableId) {
      toast.error(`لا يمكن إضافة المزيد من المهام إلى "${destColumn.title}" (الحد: ${destColumn.limit})`);
      return;
    }

    const newColumns = structuredClone(columns);
    const [movedTask] = newColumns.find((col) => col.id === source.droppableId)!.tasks.splice(source.index, 1);
    const destCol = newColumns.find((col) => col.id === destination.droppableId)!;
    if (source.droppableId === destination.droppableId) {
      destCol.tasks.splice(destination.index, 0, movedTask);
    } else {
      destCol.tasks.splice(destination.index, 0, movedTask);
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

  const confirmDeleteTask = (task: Task, column: ColumnType) => {
    setTaskToDelete({ columnId: column.id, taskId: task.id });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setColumns(
        columns.map((col) =>
          col.id === taskToDelete.columnId
            ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskToDelete.taskId) }
            : col
        )
      );
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
      toast.success("تم حذف المهمة بنجاح");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col p-4 bg-gray-100 text-right">
      <h1 className="text-2xl font-bold mb-4">لوحة كانبان</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-col md:flex-row-reverse gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-120px)]"
            >
              {columns.map((column, index) => (
                <Column
                  key={column.id}
                  column={column}
                  index={index}
                  onRemoveColumn={removeColumn}
                  onTaskSelect={handleTaskSelect}
                  onDeleteTask={confirmDeleteTask}
                />
              ))}
              {provided.placeholder}
              <AddColumn onAddColumn={addColumn} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Task Dialog */}
      {selectedTask && selectedColumn && (
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          task={selectedTask}
          column={selectedColumn}
          onTaskUpdate={(taskId, updates) => {
            setColumns(columns.map((col) => ({
              ...col,
              tasks: col.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
            })));
          }}
          onTaskCreate={(columnId, task) => {
            setColumns(columns.map((col) =>
              col.id === columnId ? { ...col, tasks: [...col.tasks, { ...task, id: `task-${Date.now()}` }] } : col
            ));
          }}
          onRemoveTask={(taskId) => confirmDeleteTask(selectedTask, selectedColumn)}
          users={users}
          mode="edit"
        />
      )}

      {/* Add Task Dialog */}
      <TaskDialog
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        column={columns[0]}
        onTaskCreate={(columnId, task) => {
          setColumns(columns.map((col) =>
            col.id === columnId ? { ...col, tasks: [...col.tasks, { ...task, id: `task-${Date.now()}` }] } : col
          ));
          setIsAddTaskModalOpen(false);
        }}
        onTaskUpdate={() => {}}
        onRemoveTask={() => {}}
        users={users}
        mode="add"
      />

      {/* Floating Add Button */}
      <Button
        className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg"
        onClick={() => setIsAddTaskModalOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد حذف هذه المهمة؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}