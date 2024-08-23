import { Box, Divider } from "@mui/material";
import { LayoutApp } from "@frfojo/components/layout";
// import IconStorageColumns, {
//   Item,
// } from "@frfojo/components/widgets/IconStorage/Columns";
import StorageColumns, {
  ItemData,
} from "@frfojo/components/widgets/Storage/Columns";
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
import Introduce from "@/components/Intro";

const ReDiv = createResizeElement("div");

const items: ItemData[] = [
  {
    id: "dota2",
    src: IconDota2,
    data: {
      src: "/",
      tooltip: "Dota2战绩查询",
    },
  },
  {
    id: "html",
    src: IconHTML,
    data: {
      src: "/",
      tooltip: "HTML 真好学",
    },
  },
  {
    id: "js",
    src: IconJS,
    data: {
      src: "/",
      tooltip: "JS 真好学",
    },
  },
  {
    id: "mcdonalds",
    src: IconMcDonalds,
    data: {
      src: "/",
      tooltip: "麦得劳月饼",
    },
  },
  {
    id: "react",
    src: IconReact,
    data: {
      src: "/",
      tooltip: "React 真好学",
    },
  },
  {
    id: "starbucks",
    src: IconStarBucks,
    data: {
      src: "/",
      tooltip: "李大嘴还未研发出星巴克",
    },
  },
  {
    id: "vue",
    src: IconVue,
    data: {
      src: "/",
      tooltip: "Vue 真好学",
    },
  },
];

//
export default function TestLayout() {
  const [list, setList] = useState(items);

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
      <StorageColumns value={list} onChange={setList} />
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
