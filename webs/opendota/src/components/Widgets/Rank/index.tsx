import { FC, useMemo } from "react";
import { Box, styled } from "@mui/material";

/**
 * 天梯
 */

const prefix = "https://www.opendota.com/assets/images";

type PartialNumItem = number | undefined;

function getRankStar(rank_tier: number): [PartialNumItem, PartialNumItem] {
  if (typeof rank_tier !== "number") {
    return [undefined, undefined];
  }
  const r = Math.floor((rank_tier / 10) % 10);
  const s = rank_tier % 10;

  return [r, s];
}

export enum EnumRank {
  先锋 = 1,
  卫士 = 2,
  中军 = 3,
  统帅 = 4,
  传奇 = 5,
  万古流芳 = 6,
  超凡入圣 = 7,
  冠绝一世 = 8,
}

export function getRankText(rank_tier: number) {
  const [r, s] = getRankStar(rank_tier);

  if (r === undefined || s === undefined) {
    return "";
  }

  return `${EnumRank[r]}[${s}]`;
}

/**
 * 获取 rank url
 */
function getRankUrl(num: number) {
  return `${prefix}/dota2/rank_icons/rank_icon_${num}.png`;
}

/**
 * 获取 star url
 */
function getStarUrl(num: number) {
  return `${prefix}/dota2/rank_icons/rank_star_${num}.png`;
}

const Root = styled("div")(() => ({
  width: "100%",
  paddingTop: "100%",
  boxSizing: "border-box",
  position: "relative",

  ".rank-box": {
    position: "absolute",
    height: "100%",
    width: "100%",
    left: 0,
    top: 0,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
  },

  ".star-box": {
    position: "absolute",
    height: "100%",
    width: "100%",
    left: 0,
    top: 0,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    zIndex: 1,
  },
}));

type RankItemProps = {
  /**
   * number 类型 2位
   * 例如：72
   * 第一位 7 代表
   * 1-先锋 2-卫士 3-中军 4-统帅 5-传奇 6-万古流芳 7-超凡入圣 8-冠绝一世
   * 第二位是星级
   *
   * 但不需要搞清楚，直接分开不同位请求这2张图片就行
   */
  rank_tier: number;
};

const RankItem: FC<RankItemProps> = ({ rank_tier }) => {
  const [rank, star] = useMemo(() => {
    const [r, s] = getRankStar(rank_tier);

    const rUrl = r ? getRankUrl(r) : "";
    const sUrl = s ? getStarUrl(s) : "";

    return [rUrl, sUrl];
  }, [rank_tier]);

  return (
    <Root>
      <Box
        className="rank-box"
        sx={rank ? { background: `url(${rank})` } : {}}
      />
      <Box
        className="star-box"
        sx={star ? { background: `url(${star})` } : {}}
      />
    </Root>
  );
};

export default RankItem;
