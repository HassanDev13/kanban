import * as React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cross2Icon } from "@radix-ui/react-icons";
import { TaskCard } from "./TaskCard";
import { Column as ColumnType, Task } from "./types";

interface ColumnProps {
  column: ColumnType;
  index: number;
  onRemoveColumn: (columnId: string) => void;
  onTaskSelect: (task: Task, column: ColumnType) => void;
  onDeleteTask: (task: Task, column: ColumnType) => void;
}

export function Column({ column, index, onRemoveColumn, onTaskSelect, onDeleteTask }: ColumnProps) {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-full md:w-80 flex-shrink-0"
        >
          <Card className="flex flex-col h-[calc(100vh-120px)]"> {/* Fixed height for the entire column */}
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0"
              {...provided.dragHandleProps}
            >
              <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{column.tasks.length}/{column.limit}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveColumn(column.id)}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <Droppable droppableId={column.id} type="task">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`h-full no-scrollbar overflow-y-auto transition-colors ${
                      snapshot.isDraggingOver ? "bg-secondary/50" : ""
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onSelect={() => onTaskSelect(task, column)}
                        onDeleteTask={() => onDeleteTask(task, column)}
                      />
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
  );
}