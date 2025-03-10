import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Cross2Icon,
  DotsHorizontalIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { TaskCard } from "./TaskCard";
import { Column as ColumnType, Task } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColumnProps {
  column: ColumnType;
  onRemoveColumn: (columnId: string) => void;
  onTaskSelect: (task: Task, column: ColumnType) => void;
  onDeleteTask: (task: Task, column: ColumnType) => void;
  onUpdateLimit?: (columnId: string, newLimit: number) => void;
  isHighlighted?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
  isActive?: boolean;
}
export function Column({
  column,
  onRemoveColumn,
  onTaskSelect,
  onDeleteTask,
  onUpdateLimit,
  isHighlighted = false,
  isDragging = false,
  isActive = false,
  isOver = false,
}: ColumnProps) {
  const [isEditLimitOpen, setIsEditLimitOpen] = React.useState(false);
  const [newLimit, setNewLimit] = React.useState(column.limit);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: column.id,
      data: { type: "column" },
      transition: {
        duration: 150, // Faster transition for smoother dragging
        easing: "ease-in-out",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 150ms ease-in-out", // Ensure consistent transition
    opacity: isDragging ? 0.6 : 1, // Consistent opacity during drag
  };

  const isAtCapacity = column.tasks.length >= column.limit;
  const isNearCapacity = column.tasks.length >= column.limit - 1;

  const handleLimitSave = () => {
    if (onUpdateLimit && newLimit >= column.tasks.length) {
      onUpdateLimit(column.id, newLimit);
      setIsEditLimitOpen(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full md:w-80 flex-shrink-0 ${
        isHighlighted ? "scale-105" : ""
      }`}
    >
      <Card
        className={`flex flex-col h-[calc(100vh-170px)] overflow-hidden ${
          isHighlighted ? "ring-2 ring-blue-400 shadow-lg" : ""
        } ${isDragging ? "shadow-xl" : ""}
  ${isOver && !isActive ? "ring-2 ring-blue-500 bg-blue-50" : ""}
  ${isActive ? "opacity-50" : ""}`}
      >
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              {column.title}
            </CardTitle>
            <Badge
              variant={
                isAtCapacity
                  ? "destructive"
                  : isNearCapacity
                  ? "secondary"
                  : "outline"
              }
              className={`transition-colors ${
                isAtCapacity ? "text-white" : "text-black"
              }`}
            >
              {column.tasks.length}/{column.limit}
            </Badge>
          </div>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>خيارات العمود</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditLimitOpen(true);
                }}
              >
                <Pencil1Icon className="ml-2 h-4 w-4" />
                تعديل الحد الأقصى
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveColumn(column.id);
                }}
                className="text-red-600"
              >
                <Cross2Icon className="ml-2 h-4 w-4" />
                حذف العمود
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-2">
          <SortableContext
            items={column.tasks.map((task) => `${column.id}:${task.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className={`h-full overflow-y-auto px-1 transition-colors ${
                isHighlighted ? "bg-blue-50" : ""
              } ${isAtCapacity ? "bg-red-50" : ""}`}
            >
              {column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnId={column.id}
                  onSelect={() => onTaskSelect(task, column)}
                  onDeleteTask={() => onDeleteTask(task, column)}
                  isOver={isOver}
                  isActive={isActive}
                />
              ))}
              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-200 rounded-md m-2">
                  <p className="text-sm">لا توجد مهام</p>
                  <p className="text-xs">اسحب المهام هنا أو أضف جديدة</p>
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>

      <Dialog open={isEditLimitOpen} onOpenChange={setIsEditLimitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الحد الأقصى للمهام</DialogTitle>
            <DialogDescription>
              حدد العدد الأقصى للمهام المسموح بها في عمود "{column.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="task-limit">الحد الأقصى للمهام</Label>
            <Input
              id="task-limit"
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(parseInt(e.target.value) || 1)}
              min={Math.max(1, column.tasks.length)}
              max={20}
              className="mt-2"
            />
            {newLimit < column.tasks.length && (
              <p className="text-red-500 text-sm mt-2">
                الحد الأقصى يجب أن يكون على الأقل {column.tasks.length} (عدد
                المهام الحالية)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLimitOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleLimitSave}
              disabled={newLimit < column.tasks.length}
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
