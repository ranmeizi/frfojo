import { FC, forwardRef } from "react";
import { Tooltip, styled, tooltipClasses, TooltipProps } from "@mui/material";
import Wu67 from "../Wu67";
import Logo from "../Logo";

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
    <div {...props} style={{ padding: 0, margin: 0 }} ref={ref}>
      <Wu67></Wu67>
    </div>
  );
});

export default Introduce;
