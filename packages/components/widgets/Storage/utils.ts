import {
  CollisionDetection,
  CollisionDescriptor,
  ClientRect,
} from "@dnd-kit/core";
import { Coordinates } from "@dnd-kit/utilities";

function centerOfRectangle(
  rect: ClientRect,
  left = rect.left,
  top = rect.top
): Coordinates {
  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5,
  };
}

let previos: CollisionDescriptor[] = [];
let initial: CollisionDescriptor[] = [];

const zeroCoordinates: Coordinates = { x: 0, y: 0 };

function sortCollisionsAsc(
  { data: { value: a } }: CollisionDescriptor,
  { data: { value: b } }: CollisionDescriptor
) {
  return a - b;
}

function distanceBetween(p1: Coordinates, p2: Coordinates) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function isHovered(
  pointer: Coordinates | null,
  clientRect: DOMRect | undefined
) {
  if (!pointer || !clientRect) {
    return false;
  }

  return (
    pointer.x > clientRect.x &&
    pointer.x < clientRect.x + clientRect.width &&
    pointer.y > clientRect.y &&
    pointer.y < clientRect.y + clientRect.height
  );
}

const closestCenter: CollisionDetection = ({
  collisionRect,
  droppableRects,
  droppableContainers,
  active,
  pointerCoordinates,
}) => {
  const centerRect = centerOfRectangle(
    collisionRect,
    collisionRect.left,
    collisionRect.top
  );

  const currentIndex = initial.findIndex((v) => v.id === active.id);
  const currentId = previos[currentIndex]?.id || active.id;
  let collisions: CollisionDescriptor[] = [];
  const currentRect = droppableRects.get(currentId);

  const centerCurrectRect = currentRect
    ? centerOfRectangle(currentRect)
    : zeroCoordinates;

  const spaceSize = 8;
  const isEnabled =
    Math.abs(centerCurrectRect.x - centerRect.x) >
      collisionRect.width + spaceSize ||
    Math.abs(centerCurrectRect.y - centerRect.y) >
      collisionRect.height + spaceSize;

  for (const droppableContainer of droppableContainers) {
    const { id } = droppableContainer;
    const rect = droppableRects.get(id);
    const clientRect = droppableContainer.node.current?.getBoundingClientRect();

    if (rect) {
      let distBetween = distanceBetween(
        centerOfRectangle(rect),
        isEnabled ? centerRect : centerCurrectRect
      );

      if (droppableContainer.data.current!.sortable.containerId === "columns") {
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: distBetween,
            hovered:
              active.id !== id
                ? isHovered(pointerCoordinates, clientRect)
                : false,
          },
        });
      }
    }
  }

  previos = collisions.sort(sortCollisionsAsc);

  if (initial.length === 0 || initial.length !== previos.length) {
    initial = previos;
  }

  return previos;
};

function reset() {
  initial = [];
}

export { closestCenter, reset };
