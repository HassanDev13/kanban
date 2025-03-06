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

const initialColumns: Column[] = [
    {
      id: "todo",
      title: "للقيام",
      tasks: [
        {
          id: "task-1",
          content: "إنشاء صفحة تسجيل الدخول",
          priority: "high",
          description:
            "<p>تنفيذ صفحة تسجيل دخول آمنة مع حقول البريد الإلكتروني وكلمة المرور.</p><ul><li>تصميم واجهة المستخدم</li><li>تنفيذ التحقق من النموذج</li></ul>",
          assignedTo: "user1",
          checklist: [
            { id: "check1", content: "تصميم واجهة المستخدم", isCompleted: false },
            { id: "check2", content: "تنفيذ التحقق من النموذج", isCompleted: false },
          ],
        },
        {
          id: "task-2",
          content: "تصميم مخطط قاعدة البيانات",
          priority: "medium",
          description: "<p>إنشاء مخطط قاعدة بيانات فعال للتطبيق.</p>",
          checklist: [],
        },
      ],
      limit: 4,
    },
    {
      id: "in-progress",
      title: "قيد التنفيذ",
      tasks: [
        {
          id: "task-3",
          content: "تنفيذ مصادقة المستخدم",
          priority: "high",
          description:
            "<p>إعداد مصادقة المستخدم باستخدام رموز JWT.</p><ol><li>تنفيذ إنشاء JWT</li><li>إعداد مسارات محمية</li></ol>",
          assignedTo: "user2",
          checklist: [
            { id: "check3", content: "تنفيذ إنشاء JWT", isCompleted: true },
            { id: "check4", content: "إعداد مسارات محمية", isCompleted: false },
          ],
        },
      ],
      limit: 3,
    },
    {
      id: "done",
      title: "منتهي",
      tasks: [
        {
          id: "task-4",
          content: "إعداد المشروع",
          priority: "low",
          description:
            "<p>تهيئة المشروع وإعداد بيئة التطوير.</p><ul><li>تثبيت التبعيات</li><li>تهيئة عملية البناء</li></ul>",
          checklist: [
            { id: "check5", content: "تثبيت التبعيات", isCompleted: true },
            { id: "check6", content: "تهيئة عملية البناء", isCompleted: true },
          ],
        },
      ],
      limit: 5,
    },
  ];
  
  const users: User[] = [
    { id: "user1", name: "أليس", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "user2", name: "بوب", avatar: "/placeholder.svg?height=32&width=32" },
    { id: "user3", name: "تشارلي", avatar: "/placeholder.svg?height=32&width=32" },
  ];
  
export function KanbanBoard() {
  const [columns, setColumns] = React.useState<ColumnType[]>(initialColumns);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = React.useState<ColumnType | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<{ columnId: string; taskId: string } | null>(null);

  const handleDragEnd = (result: DropResult) => {
    // ... (same as before)
  };

  const addColumn = (title: string) => {
    // ... (same as before)
  };

  const removeColumn = (columnId: string) => {
    // ... (same as before)
  };

  const handleTaskSelect = (task: Task, column: ColumnType) => {
    setSelectedTask(task);
    setSelectedColumn(column);
    setIsTaskDialogOpen(true);
  };

  const confirmDeleteTask = (columnId: string, taskId: string) => {
    setTaskToDelete({ columnId, taskId });
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
              className="flex flex-col md:flex-row-reverse gap-4 overflow-x-auto pb-4"
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
          onRemoveTask={(taskId) => confirmDeleteTask(selectedColumn.id, taskId)}
          users={users}
          mode="edit"
        />
      )}

      {/* Add Task Dialog */}
      <TaskDialog
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
        column={columns[0]} // Default to first column
        onTaskCreate={(columnId, task) => {
          setColumns(columns.map((col) =>
            col.id === columnId ? { ...col, tasks: [...col.tasks, { ...task, id: `task-${Date.now()}` }] } : col
          ));
          setIsAddTaskModalOpen(false);
        }}
        onTaskUpdate={() => {}} // Not used in add mode
        onRemoveTask={() => {}} // Not used in add mode
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