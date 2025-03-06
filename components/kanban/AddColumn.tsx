import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface AddColumnProps {
  onAddColumn: (title: string) => void;
}

export function AddColumn({ onAddColumn }: AddColumnProps) {
  const [newColumnTitle, setNewColumnTitle] = React.useState("");

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) {
      toast.error("يرجى إدخال عنوان للعمود");
      return;
    }
    onAddColumn(newColumnTitle);
    setNewColumnTitle("");
  };

  return (
    <div className="w-full md:w-60 flex-shrink-0">
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
          <Button onClick={handleAddColumn} className="w-full">
            <PlusIcon className="mr-2 h-4 w-4" /> إضافة عمود
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}