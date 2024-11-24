import { cn } from "@/lib/utils";
import { Droppable, DroppableProvided } from "@hello-pangea/dnd";
import { ReactNode } from "react";

interface DroppableListProps {
  children: ReactNode;
  droppableId: string;
  type?: "team" | "player";
}

function DroppableList({ children, droppableId, type = "player" }: DroppableListProps) {
  return (
    <Droppable droppableId={droppableId}>
      {(provided: DroppableProvided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={cn(
            "relative",
            type === "team" ? "z-0" : "z-10"
          )}
          style={{
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          {children}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default DroppableList; 