import React, { FC, PropsWithChildren } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useDndContext, useDroppable } from "@dnd-kit/core";

type DropableItemProps = {
  id: string;
} & React.HTMLAttributes<HTMLDivElement>;

const DropableItem: FC<PropsWithChildren<DropableItemProps>> = (props) => {
  const { id, children, ...divProps } = props;
  const { setNodeRef, active } = useDroppable({ id });

  const { collisions } = useDndContext();
  const isHovered =
    collisions?.find((collision) => collision.id === id)?.data?.hovered ||
    false;

  return (
    <div
      ref={setNodeRef}
      {...divProps}
      className={`${divProps.className} ${isHovered ? "mimicry" : ""}`}
    >
      {children}
    </div>
  );
};

export default DropableItem;
