import { FC } from "react";
import {
  alpha,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  styled,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Root = styled(Card)(({ theme }) => ({
  width: "fit-content",
  minWidth: 260,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

type MenuCardProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  img?: string;
  path?: string;
};

const MenuCard: FC<MenuCardProps> = ({ title, description, img, path }) => {
  const navigate = useNavigate();
  return (
    <Root variant="outlined">
      <CardActionArea
        sx={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          "& .MuiCardActionArea-focusHighlight": {
            background: "transparent",
          },
        }}
        onClick={() => path && navigate(path)}
      >
        <CardMedia
          component="img"
          sx={{
            width: 100,
            minWidth: 100,
            height: 100,
            objectFit: "cover",
            bgcolor: "action.hover",
          }}
          image={img}
          alt=""
        />
        <CardContent
          sx={{
            flex: 1,
            minWidth: 0,
            py: 2,
            px: 2,
            "&:last-child": { pb: 2 },
          }}
        >
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: "0.95rem",
              lineHeight: 1.3,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              fontSize: "0.8rem",
              color: "text.secondary",
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Root>
  );
};

export default MenuCard;
