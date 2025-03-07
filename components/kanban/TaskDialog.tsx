"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquare, MessageSquare, Users, Plus, Trash2 } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { TiptapEditor } from "../kanban/rich-text-editor";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Priority, Task } from "./types";

interface ChecklistItem {
  id: string;
  content: string;
  isCompleted: boolean;
}

interface Column {
  id: string;
  title: string;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  column: Column;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate: (columnId: string, task: Task) => void;
  onRemoveTask: (columnId: string, taskId: string) => void;
  users: User[];
  mode: "add" | "edit";
  initialPriority?: Priority;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  column,
  onTaskUpdate,
  onTaskCreate,
  onRemoveTask,
  users,
  mode = "edit",
  initialPriority = Priority.Medium,
}: TaskDialogProps) {
  const [title, setTitle] = React.useState(task?.content || "");
  const [description, setDescription] = React.useState(task?.description || "");
  const [priority, setPriority] = React.useState<Priority>(
    task?.priority || initialPriority
  );
  const [checklist, setChecklist] = React.useState<ChecklistItem[]>(
    task?.checklist || []
  );
  const [newChecklistItem, setNewChecklistItem] = React.useState("");
  const [isEditingDescription, setIsEditingDescription] = React.useState(
    mode === "add"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (mode === "add") {
        setTitle("");
        setDescription("");
        setPriority(initialPriority);
        setChecklist([]);
        setIsEditingDescription(true);
      } else if (mode === "edit" && task) {
        setTitle(task.content || "");
        setDescription(task.description || "");
        setPriority(task.priority || initialPriority);
        setChecklist(task.checklist || []);
        setIsEditingDescription(false);
      }
    }
  }, [open, mode, task, initialPriority]);
  
  const handleDescriptionSave = () => {
    if (mode === "edit" && task) {
      onTaskUpdate(task.id, { description });
    }
    setIsEditingDescription(false);
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setChecklist(updatedChecklist);

    if (mode === "edit" && task) {
      onTaskUpdate(task.id, { checklist: updatedChecklist });
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      content: newChecklistItem,
      isCompleted: false,
    };

    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    setNewChecklistItem("");

    if (mode === "edit" && task) {
      onTaskUpdate(task.id, { checklist: updatedChecklist });
    }
  };

  const removeChecklistItem = (itemId: string) => {
    const updatedChecklist = checklist.filter((item) => item.id !== itemId);
    setChecklist(updatedChecklist);

    if (mode === "edit" && task) {
      onTaskUpdate(task.id, { checklist: updatedChecklist });
    }
  };

  const handleSave = () => {
    if (mode === "add") {
      const newTask: Task = {
        id: uuidv4(),
        content: title,
        priority,
        description,
        checklist,
      };
      onTaskCreate(column.id, newTask);
    } else if (task) {
      onTaskUpdate(task.id, {
        content: title,
        priority,
        description,
        checklist,
      });
    }
    onOpenChange(false);
  };

  const checklistProgress = checklist.length
    ? Math.round(
        (checklist.filter((item) => item.isCompleted).length /
          checklist.length) *
          100
      )
    : 0;

  const confirmDeleteTask = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTask = () => {
    if (task) {
      onRemoveTask(column.id, task.id);
      onOpenChange(false);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden h-fit" dir="rtl">
        <DialogHeader className="p-6 pb-0">
          {mode === "add" ? (
            <div className="mt-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المهمة"
                className="text-xl font-semibold"
              />
            </div>
          ) : (
            <DialogTitle>
              <div className="flex items-start justify-between mt-6">
                <h2 className="text-xl font-semibold">{task?.content}</h2>
              </div>
            </DialogTitle>
          )}
        </DialogHeader>
        <div className="flex h-[70vh]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">الوصف</h3>
                  {!isEditingDescription && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(true)}
                    >
                      تعديل
                    </Button>
                  )}
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <TiptapEditor
                      content={description}
                      onChange={setDescription}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleDescriptionSave}>
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingDescription(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: description }}
                    dir="rtl"
                  />
                )}
              </div>

              {/* Task Details (Priority and other fields) */}
              {mode === "add" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="priority" className="w-24 text-right">
                      الأولوية
                    </Label>
                    <Select
                      value={priority}
                      onValueChange={setPriority}
                      dir="rtl"
                    >
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue placeholder="اختر الأولوية" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-right">
                          منخفض
                        </SelectItem>
                        <SelectItem value="medium" className="text-right">
                          متوسط
                        </SelectItem>
                        <SelectItem value="high" className="text-right">
                          مرتفع
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">قائمة المهام</h3>
                  <span className="text-sm text-muted-foreground">
                    {checklistProgress}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full mb-4">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${checklistProgress}%` }}
                  />
                </div>

                {/* Add new checklist item */}
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="إضافة عنصر جديد"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addChecklistItem();
                      }
                    }}
                  />
                  <Button size="sm" onClick={addChecklistItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 group">
                      <Checkbox
                        id={item.id}
                        checked={item.isCompleted}
                        onCheckedChange={() => toggleChecklistItem(item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className={`text-sm flex-1 ${
                          item.isCompleted
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.content}
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity */}
              {mode === "edit" && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">النشاط</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>م</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">المستخدم</span> أضاف هذه
                          البطاقة إلى{" "}
                          <span className="font-medium">
                            {column?.title ?? ""}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ٢٤ فبراير، ٢٠٢٤
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="p-4 border-t flex justify-between">
          {mode === "edit" && task && (
            <Button variant="destructive" onClick={confirmDeleteTask}>
              حذف المهمة
            </Button>
          )}
          <div className="flex gap-2 mr-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              {mode === "add" ? "إضافة المهمة" : "حفظ التغييرات"}
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد أنك تريد حذف هذه المهمة؟ هذا الإجراء لا يمكن
                التراجع عنه.
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
      </DialogContent>
    </Dialog>
  );
}
