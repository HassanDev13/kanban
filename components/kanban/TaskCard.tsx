import * as React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { Priority, Task } from "./types";

interface TaskCardProps {
  task: Task;
  index: number;
  onSelect: () => void;
  onDeleteTask: () => void;
}


const priorityColors: Record<Priority, string> = {
  [Priority.Low]: "bg-green-100 text-green-800",
  [Priority.Medium]: "bg-yellow-100 text-yellow-800",
  [Priority.High]: "bg-red-100 text-red-800",
};

const priorityLabels = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

export function TaskCard({
  task,
  index,
  onSelect,
  onDeleteTask,
}: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="m-2 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={onSelect}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{task.content}</p>
                {task.assignedTo && (
                  <div className="mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignedTo} />
                      <AvatarFallback>{task.assignedTo[0]}</AvatarFallback>
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
                    e.stopPropagation(); // Prevent onSelect from firing
                    onDeleteTask();
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
  );
}
