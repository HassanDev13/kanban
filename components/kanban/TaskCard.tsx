import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Clock } from "lucide-react";
import { Priority, Task } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskCardProps {
  task: Task;
  columnId: string;
  onSelect: () => void;
  onDeleteTask: () => void;
  isOver?: boolean;
  isActive?: boolean;
}

const priorityColors: Record<Priority, string> = {
  [Priority.Low]: "bg-green-100 text-green-800 hover:bg-green-200",
  [Priority.Medium]: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [Priority.High]: "bg-red-100 text-red-800 hover:bg-red-200",
};

const priorityLabels = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

export function TaskCard({
  task,
  columnId,
  onSelect,
  onDeleteTask,
  isActive,
  isOver,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${columnId}:${task.id}`,
    data: {
      type: "task",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get formatted date for display
  const getFormattedDate = () => {
    if (!task.dueDate) return null;

    const dueDate = new Date(task.dueDate);
    return dueDate.toLocaleDateString("ar-EG");
  };

  // Calculate if task is overdue
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  }, [task.dueDate]);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`m-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        task.priority === Priority.High
          ? "border-l-4 border-red-500"
          : task.priority === Priority.Medium
          ? "border-l-4 border-yellow-500"
          : ""
      }
    ${isOverdue ? "border-r-4 border-red-500" : ""}
    ${isOver && !isActive ? "ring-2 ring-blue-500 bg-blue-50" : ""}
    ${isActive ? "opacity-50" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <p className="font-medium line-clamp-2">{task.content}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-1 -mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>حذف المهمة</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
          {task.assignedTo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                    // src={task.assignedTo}
                    />
                    <AvatarFallback>
                      {task.assignedTo.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{task.assignedTo || "مستخدم"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <div className="flex gap-1 items-center flex-wrap">
            {task.dueDate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={isOverdue ? "destructive" : "outline"}
                      className={`text-xs flex items-center gap-1 ${
                        isOverdue ? "bg-red-100 text-red-800" : ""
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {getFormattedDate()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isOverdue ? "متأخرة" : "تاريخ الاستحقاق"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Badge className={`text-xs ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
