import { FC, useMemo } from "react";
import { Box, styled } from "@mui/material";

/**
 * 物品
 */

const prefix =
  "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/";

function getUrl(name: string) {
  return `${prefix}${name}.png`;
}

const Root = styled("div")(() => ({
  width: "100%",
  paddingTop: "73%",
  boxSizing: "border-box",
  position: "relative",
  borderRadius: 4,
  background: "linear-gradient(145deg, #1b1f23, #0e1114)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,0.06), 0 0 4px rgba(0,0,0,0.9)",

  ".item-img": {
    position: "absolute",
    inset: 2,
    borderRadius: 3,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
  },
}));

type ItemProps = {
  itemName?: string;
  itemId?: string | number;
};

const Item: FC<ItemProps> = ({ itemId, itemName }) => {
  // 有name 用name ，没有name 使用 id 去找name

  const name = useMemo(() => {
    if (itemName) {
      return itemName;
    }

    if (itemId) {
      // 找
      return undefined;
    }

    return undefined;
  }, [itemName, itemId]);

  const src = name ? getUrl(name) : "";

  return (
    <Root>
      <Box className="item-img" sx={{ background: `url(${src})` }}></Box>
    </Root>
  );
};

export default Item;
