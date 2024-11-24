import { Draggable } from "@hello-pangea/dnd";
import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface DraggablePlayerProps {
  children: ReactNode;
  draggableId: string;
  index: number;
}

function DraggablePlayer({ children, draggableId, index }: DraggablePlayerProps) {
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => {
        const content = (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className={snapshot.isDragging ? "dragging" : ""}
            style={{
              ...provided.draggableProps.style,
              zIndex: snapshot.isDragging ? 99999 : 1,
            }}
          >
            {children}
          </div>
        );

        // When dragging, render in a portal at the document root
        if (snapshot.isDragging) {
          return createPortal(content, document.body);
        }

        return content;
      }}
    </Draggable>
  );
}

export default DraggablePlayer; 