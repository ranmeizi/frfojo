import { FC, forwardRef } from "react";
import {
  Tooltip,
  styled,
  tooltipClasses,
  TooltipProps,
  keyframes,
  alpha,
} from "@mui/material";
import Logo from "../Logo";
import IconCode from "@/assets/web-command.png";

const action = keyframes({
  "0%": {
    transform: "translateY(0)",
  },
  "100%": {
    transform: "translateY(-4px)",
  },
});

const Root = styled("div")(({ theme }) => ({
  padding: 0,
  margin: 0,

  ".icon": {
    borderRadius: "50%",
    background: "rgba(66, 66, 66, 0.5)",
    overflow: "hidden",
    width: "52px",
    height: "52px",
    transition: "0.2s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    "&:hover": {
      overflow: "visible",
      borderRadius: "8px",
      background: alpha(theme.palette.primary.main, 0.5),

      // 动一动
      img: {
        height: "110%",
        width: "110%",
        animationName: action,
        animationDuration: "1.5s",
        animationDirection: "alternate",
        animationTimingFunction: "cubic-bezier(0.42, 0, 0.58, 1)",
        animationIterationCount: "infinite",
      },
    },

    img: {
      width: "100%",
      height: "100%",
      transition: "0.2s",
    },
  },
}));

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}));

const StyledIntro = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  width: "250px",
  height: "300px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  ".content": {
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid #666",
    width: "100%",
  },
}));

const Introduce: FC = () => {
  const intro = (
    <StyledIntro>
      <Logo title="Boboan"></Logo>
      <div className="content">
        <div>这只是一个壳子哦</div>
        <div> TODO</div>
        <ul>
          <li>Drop</li>
          <li>i18n</li>
          <li>theme</li>
          <li>SubApp layout</li>
          <li>集成garfish</li>
        </ul>
      </div>
    </StyledIntro>
  );
  return (
    <div>
      <BootstrapTooltip title={intro} placement="right-start">
        <FakeBtn />
      </BootstrapTooltip>
    </div>
  );
};

const FakeBtn = forwardRef((props, ref: any) => {
  return (
    <Root {...props} style={{ padding: 0, margin: 0 }} ref={ref}>
      <div className="icon">
        <img src={IconCode} />
      </div>
    </Root>
  );
});

export default Introduce;
