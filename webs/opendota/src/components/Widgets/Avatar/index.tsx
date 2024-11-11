import { FC } from "react";
import { styled } from "@mui/material";
import BorderNormal from "./borders/Normal";
import BorderGolden from "./borders/Golden";
import BorderSilver from "./borders/Silver";

const Root = styled("div")<{ avatar: string }>(({ avatar }) => ({
  width: "100%",
  paddingTop: "100%",
  boxSizing: "border-box",
  position: "relative",

  ".border": {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    borderRadius: "9%",
  },

  ".dota-avatar": {
    height: "100%",
    width: "100%",
    position: "relative",

    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    borderRadius: "7%",
    backgroundImage: `url(${avatar})`,
    overflow: "hidden",

    "&::after": {
      position: "absolute",
      content: '""',
      height: "100%",
      width: "150%",
      backgroundImage:
        "linear-gradient(rgba(255,255,255,.3) 0%,rgba(255,255,255,.2) 50%,rgba(0,0,0,.7) 100%)",
      // filter: "blur(5px)",
    },

    "&::before": {
      zIndex: 2,
      position: "absolute",
      content: '""',
      left: "-10px",
      bottom: 0,
      height: "53%",
      width: "120%",
      borderTopLeftRadius: "32px",
      backgroundImage:
        "linear-gradient( -160deg,rgba(22,22,22,.3) 50%,rgba(122,111,111,.1) 100%)",
      filter: "blur(5px)",
    },
  },
}));

type AvatarProps = {
  avatar: string;
  vip?: 0 | 1 | 2;
};

const vipBorders = {
  0: BorderNormal,
  1: BorderSilver,
  2: BorderGolden,
};

const Avatar: FC<AvatarProps> = ({ avatar, vip = 0 }) => {
  const Border = vipBorders[vip];

  return (
    <Root avatar={avatar}>
      <Border>
        <div className="dota-avatar"></div>
      </Border>
    </Root>
  );
};

export default Avatar;
