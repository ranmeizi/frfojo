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

  ".item-img": {
    height: "100%",
    width: "100%",
    position: "absolute",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    top: 0,
    left: 0,
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
  }, []);

  const src = name ? getUrl(name) : "";

  return (
    <Root>
      <Box className="item-img" sx={{ background: `url(${src})` }}></Box>
    </Root>
  );
};

export default Item;
