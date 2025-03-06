"use client";

import * as React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { TaskDialog } from "./task-dialog";
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
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
}

interface Task {
  id: string;
  content: string;
  priority: string;
  description: string;
  assignedTo?: string;
  checklist: ChecklistItem[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  limit: number;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

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

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const priorityLabels = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

export function KanbanBoard() {
  const [columns, setColumns] = React.useState<Column[]>(initialColumns);
  const [newColumnTitle, setNewColumnTitle] = React.useState("");
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = React.useState<Column | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false); // State for delete confirmation
  const [taskToDelete, setTaskToDelete] = React.useState<{ columnId: string; taskId: string } | null>(null); // Track task to delete

  const [newTask, setNewTask] = React.useState({
    content: "",
    priority: "medium", // Default priority
    description: "",
    columnId: "",
    assignedTo: "",
    checklist: [] as ChecklistItem[],
  });
  const [newChecklistItem, setNewChecklistItem] = React.useState("");

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    if (destColumn.tasks.length >= destColumn.limit && source.droppableId !== destination.droppableId) {
      toast.error(`لا يمكن إضافة المزيد من المهام إلى "${destColumn.title}" (الحد: ${destColumn.limit})`);
      return;
    }

    const newColumns = [...columns];
    const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
    if (source.droppableId === destination.droppableId) {
      sourceColumn.tasks.splice(destination.index, 0, movedTask);
    } else {
      destColumn.tasks.splice(destination.index, 0, movedTask);
    }

    setColumns(newColumns);
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) {
      toast.error("يرجى إدخال عنوان للعمود");
      return;
    }
    setColumns([
      ...columns,
      {
        id: `column-${Date.now()}`,
        title: newColumnTitle,
        tasks: [],
        limit: 5,
      },
    ]);
    setNewColumnTitle("");
    toast.success(`تم إضافة عمود "${newColumnTitle}"`);
  };

  const removeColumn = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (column && column?.tasks.length > 0) {
      toast.error("لا يمكن حذف عمود يحتوي على مهام");
      return;
    }
    setColumns(columns.filter((col) => col.id !== columnId));
    toast.success(`تم حذف عمود "${column?.title}"`);
  };

  const addTask = () => {
    const targetColumn = columns.find((col) => col.id === newTask.columnId);
    if (!targetColumn) {
      toast.error("اختر عمودًا صالحًا");
      return;
    }
    if (targetColumn.tasks.length >= targetColumn.limit) {
      toast.error(`لا يمكن إضافة المزيد من المهام. الحد الأقصى لعدد المهام في هذا العمود هو ${targetColumn.limit}`);
      return;
    }
    const newTaskItem: Task = {
      id: `task-${Date.now()}`,
      content: newTask.content,
      priority: newTask.priority,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      checklist: newTask.checklist,
    };
    setColumns(
      columns.map((col) =>
        col.id === newTask.columnId ? { ...col, tasks: [...col.tasks, newTaskItem] } : col
      )
    );
    setNewTask({
      content: "",
      priority: "medium",
      description: "",
      columnId: "",
      assignedTo: "",
      checklist: [],
    });
    setIsAddTaskModalOpen(false);
  };

  const removeTask = (columnId: string, taskId: string) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, tasks: col.tasks.filter((task) => task.id !== taskId) } : col
      )
    );
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      content: newChecklistItem,
      isCompleted: false,
    };
    setNewTask({ ...newTask, checklist: [...newTask.checklist, newItem] });
    setNewChecklistItem("");
  };

  const toggleChecklistItem = (itemId: string) => {
    setNewTask({
      ...newTask,
      checklist: newTask.checklist.map((item) =>
        item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
      ),
    });
  };

  const removeChecklistItem = (itemId: string) => {
    setNewTask({
      ...newTask,
      checklist: newTask.checklist.filter((item) => item.id !== itemId),
    });
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setColumns(
      columns.map((col) => ({
        ...col,
        tasks: col.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
      }))
    );
  };

  const confirmDeleteTask = (columnId: string, taskId: string) => {
    setTaskToDelete({ columnId, taskId });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      removeTask(taskToDelete.columnId, taskToDelete.taskId);
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
      toast.success("تم حذف المهمة بنجاح");
    }
  };

  return (
    <div dir="rtl" className="h-screen flex flex-col p-4 bg-gray-100 text-right">
      <h1 className="text-2xl font-bold mb-4">لوحة كانبان</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-grow flex flex-row-reverse gap-4 overflow-x-auto pb-4 justify-start w-full"
            >
              {columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-80 flex-shrink-0"
                    >
                      <Card className="h-full">
                        <CardHeader
                          className="flex flex-row items-center justify-between space-y-0 pb-2"
                          {...provided.dragHandleProps}
                        >
                          <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {column.tasks.length}/{column.limit}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeColumn(column.id);
                              }}
                            >
                              <Cross2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Droppable droppableId={column.id} type="task">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`min-h-[200px] transition-colors ${
                                  snapshot.isDraggingOver ? "bg-secondary/50" : ""
                                }`}
                              >
                                {column.tasks.map((task, index) => (
                                  <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                      <Card
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="mb-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => {
                                          setSelectedTask(task);
                                          setSelectedColumn(column);
                                          setIsTaskDialogOpen(true);
                                        }}
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{task.content}</p>
                                              {task.assignedTo && (
                                                <div className="mt-2">
                                                  <Avatar className="h-6 w-6">
                                                    <AvatarImage
                                                      src={users.find((u) => u.id === task.assignedTo)?.avatar}
                                                    />
                                                    <AvatarFallback>
                                                      {users.find((u) => u.id === task.assignedTo)?.name[0]}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex items-center">
                                              <Badge className={`mr-2 ${priorityColors[task.priority]}`}>
                                                {priorityLabels[task.priority]}
                                              </Badge>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  confirmDeleteTask(column.id, task.id);
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              <div className="w-60 flex-shrink-0">
                <Card className="h-fit">
                  <CardHeader>
                    <CardTitle>إضافة عمود جديد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="text"
                      placeholder="عنوان العمود"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      className="mb-2"
                    />
                    <Button onClick={addColumn} className="w-full">
                      <PlusIcon className="mr-2 h-4 w-4" /> إضافة عمود
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Task Dialog (Edit Existing Task) */}
      {selectedTask && selectedColumn && (
        <TaskDialog
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
          task={selectedTask}
          column={selectedColumn}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={(columnId, task) => {
            const updatedTask: Task = {
              ...task,
              id: task.id || `task-${Date.now()}`,
              checklist: task.checklist || [],
            };
            setColumns((prevColumns) =>
              prevColumns.map((col) =>
                col.id === columnId ? { ...col, tasks: [...col.tasks, updatedTask] } : col
              )
            );
          }}
          onRemoveTask={(taskId) => removeTask(selectedColumn.id, taskId)}
          users={users}
          mode="edit"
        />
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg">
            <PlusIcon className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <TaskDialog
            open={isAddTaskModalOpen}
            onOpenChange={setIsAddTaskModalOpen}
            column={columns.find((col) => col.id === newTask.columnId) || columns[0]}
            onTaskCreate={(columnId, task) => {
              const updatedTask: Task = {
                ...task,
                id: task.id || `task-${Date.now()}`,
                checklist: task.checklist || [],
              };
              setColumns((prevColumns) =>
                prevColumns.map((col) =>
                  col.id === columnId ? { ...col, tasks: [...col.tasks, updatedTask] } : col
                )
              );
              setIsAddTaskModalOpen(false);
            }}
            onTaskUpdate={handleTaskUpdate}
            onRemoveTask={removeTask}
            users={users}
            mode="add"
            initialPriority={newTask.priority} // Pass initial priority to TaskDialog
          />
        </DialogContent>
      </Dialog>

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