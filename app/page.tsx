import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { RTLProvider } from "@/lib/rtl-provider";

export default function Home() {
  return (
    <RTLProvider>
      <main>
        <KanbanBoard />
      </main>
    </RTLProvider>
  );
}
