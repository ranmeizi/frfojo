import { Box, Divider } from "@mui/material";
import { LayoutApp } from "@frfojo/components/layout";
import IconStorageColumns, {
  Item,
} from "@frfojo/components/widgets/IconStorage/Columns";
import createResizeElement from "@frfojo/components/element/createResizeElement";
import { useCallback, useState } from "react";
import { throttle } from "@frfojo/common/utils/delay";

import IconDota2 from "@/assets/move-icons/dota2.png";
import IconHTML from "@/assets/move-icons/html.png";
import IconJS from "@/assets/move-icons/js.png";
import IconMcDonalds from "@/assets/move-icons/mcdonalds.png";
import IconReact from "@/assets/move-icons/react.png";
import IconStarBucks from "@/assets/move-icons/starbucks.png";
import IconVue from "@/assets/move-icons/vue.png";
import Wu67 from "@/components/Wu67";
import Introduce from "@/components/Intro";

const ReDiv = createResizeElement("div");

const items: Item[] = [
  {
    id: "dota2",
    src: IconDota2,
  },
  {
    id: "html",
    src: IconHTML,
  },
  {
    id: "js",
    src: IconJS,
  },
  {
    id: "mcdonalds",
    src: IconMcDonalds,
  },
  {
    id: "react",
    src: IconReact,
  },
  {
    id: "starbucks",
    src: IconStarBucks,
  },
  {
    id: "vue",
    src: IconVue,
  },
];

//
export default function TestLayout() {
  const [list, setList] = useState(items);

  console.log("bb", list);

  const sidebar = (
    <Box
      sx={(theme) => ({
        padding: theme.spacing(1),
        height: "100%",
      })}
    >
      <Introduce />
      <Divider
        sx={({ spacing }) => ({
          marginTop: spacing(1),
          marginBottom: spacing(1),
        })}
      />
      <IconStorageColumns items={list} onChange={setList} />
    </Box>
  );

  const onResize = useCallback(
    throttle((el) => {
      console.log("external change", el.clientHeight, el.clientWidth);
    }, 50),
    []
  );

  return (
    <LayoutApp sidebar={sidebar}>
      <Box
        sx={(theme) => ({
          padding: theme.spacing(2),
        })}
      >
        content
        <ReDiv onResize={onResize}>
          <textarea name="" id=""></textarea>
        </ReDiv>
      </Box>
    </LayoutApp>
  );
}
