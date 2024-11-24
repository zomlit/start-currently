import {
  DraggableProvided,
  DroppableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot
} from 'react-beautiful-dnd';

declare module 'react-beautiful-dnd' {
  export interface DroppableProvidedProps {
    ref: (element: HTMLElement | null) => void;
    droppableProps: {
      'data-rbd-droppable-id': string;
      'data-rbd-droppable-context-id': string;
    };
  }

  export interface DraggableProvidedDragHandleProps {
    'data-rbd-drag-handle-draggable-id': string;
    'data-rbd-drag-handle-context-id': string;
    'aria-describedby': string;
    role: string;
    tabIndex: number;
    draggable: boolean;
    onDragStart: (event: React.DragEvent<HTMLElement>) => void;
  }

  export interface DraggableProvidedDraggableProps {
    'data-rbd-draggable-context-id': string;
    'data-rbd-draggable-id': string;
    style?: React.CSSProperties;
  }

  export interface DraggableProvided {
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: DraggableProvidedDraggableProps;
    dragHandleProps: DraggableProvidedDragHandleProps | null;
  }

  export interface DroppableProvided {
    innerRef: (element: HTMLElement | null) => void;
    droppableProps: DroppableProvidedProps;
    placeholder?: React.ReactElement | null;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    draggingOver: string | null;
    dropAnimation: {
      duration: number;
      curve: string;
      moveTo: {
        x: number;
        y: number;
      };
    } | null;
    mode: string | null;
    combineWith: string | null;
    combineTargetFor: string | null;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: string | null;
    draggingFromThisWith: string | null;
    isUsingPlaceholder: boolean;
  }
} 