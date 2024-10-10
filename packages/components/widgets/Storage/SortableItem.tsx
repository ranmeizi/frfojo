import { useSortable } from "@dnd-kit/sortable";
import React, { FC, PropsWithChildren } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useDndContext } from "@dnd-kit/core";

type SortableItemProps = {
  id: string;
} & React.HTMLAttributes<HTMLDivElement>;

const SortableItem: FC<PropsWithChildren<SortableItemProps>> = (props) => {
  const { id, children, ...divProps } = props;
  const { attributes, listeners, setNodeRef, transform, transition, active } =
    useSortable({ id });

  const isActive = active?.id === id;

  const { collisions } = useDndContext();

  let isHovered =
    collisions?.find((collision) => collision.id === id)?.data?.hovered ||
    false;

  // isHovered = false;
  if (transform && transform?.scaleY !== 1) {
    transform.scaleY = 1;
  }
  const style = {
    transform: CSS.Transform.toString(transform),
    zIndex: isActive ? 999 : 0,
    position: "relative",
    transition,
  } as const;

  return (
    <div
      ref={setNodeRef}
      {...divProps}
      style={style}
      {...attributes}
      {...listeners}
      className={`${divProps.className} ${isHovered ? "mimicry" : ""} ${
        isActive ? "active" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default SortableItem;
