import { FC, forwardRef } from "react";
import {
  Tooltip,
  styled,
  tooltipClasses,
  TooltipProps,
  keyframes,
  alpha,
  Link,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Logo } from "@frfojo/components";
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

    "&.hover": {
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
    padding: 0,
    maxWidth: 340,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}));

const StyledIntro = styled("div")(({ theme }) => ({
  padding: theme.spacing(1.25),
  width: "280px",
  maxHeight: "280px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  ".card": {
    width: "100%",
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    padding: theme.spacing(1.25),
    background: alpha(theme.palette.common.black, 0.06),
    border: `1px solid ${alpha(theme.palette.common.black, 0.18)}`,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.75),
  },

  ".scroll": {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: theme.spacing(0.5),
  },

  ".chips": {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.5),
  },

  ".desc": {
    color: alpha(theme.palette.text.primary, 0.78),
    lineHeight: 1.45,
  },

  ".list": {
    margin: 0,
    paddingLeft: theme.spacing(2),
    color: alpha(theme.palette.text.primary, 0.86),
    lineHeight: 1.55,
  },

  ".footer": {
    marginTop: "auto",
    paddingTop: theme.spacing(0.75),
  },
}));

const Introduce: FC = () => {
  const intro = (
    <StyledIntro>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Logo title="Boboan"></Logo>
      </Box>

      <div className="card">
        <div className="scroll">
          <Typography fontWeight={900} fontSize={14} sx={{ mb: 0.25 }}>
            自用工具箱 · 微前端壳
          </Typography>

          <Typography variant="body2" className="desc">
            一个自用的 Web/Tauri 应用集合。主应用负责布局、登录与全局状态，并通过 Garfish
            挂载子应用。
          </Typography>

          <Box sx={{ mt: 1 }}>
            <div className="chips">
              <Chip size="small" variant="outlined" label="Tauri" />
              <Chip size="small" variant="outlined" label="Vite + React" />
              <Chip size="small" variant="outlined" label="MUI" />
              <Chip size="small" variant="outlined" label="Garfish" />
            </div>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary" fontWeight={800}>
              Modules
            </Typography>
            <ul className="list">
              <li>main：主应用壳子（Layout/App 状态/路由）</li>
              <li>opendota：数据展示子应用</li>
              <li>bobo-tool：工具集子应用</li>
              <li>server：仿 Discord 的服务器/频道/聊天 Demo（/bc 接口）</li>
            </ul>
          </Stack>
        </div>

        <div className="footer">
          <Typography variant="caption" color="text.secondary">
            博客
          </Typography>
          <Box>
            <Link
              href="https://ranmeizi.github.io/boboan.github.io/"
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{ fontSize: 13, fontWeight: 700 }}
            >
              ranmeizi.github.io/boboan.github.io
            </Link>
          </Box>
        </div>
      </div>
    </StyledIntro>
  );
  return (
    <BootstrapTooltip
      title={intro}
      placement="right-start"
      PopperProps={{
        modifiers: [
          { name: "preventOverflow", options: { padding: 8 } },
          {
            name: "flip",
            options: {
              fallbackPlacements: ["right", "left-start", "left", "bottom-start"],
            },
          },
        ],
      }}
    >
      <FakeBtn />
    </BootstrapTooltip>
  );
};

const FakeBtn = forwardRef((props: any, ref: any) => {
  const isHover = !!props["aria-labelledby"];
  return (
    <Root {...props} style={{ padding: 0, margin: 0 }} ref={ref}>
      <div className={`icon ${isHover ? "hover" : ""}`}>
        <img src={IconCode} />
      </div>
    </Root>
  );
});

export default Introduce;
