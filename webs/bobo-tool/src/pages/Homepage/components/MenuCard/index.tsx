import { FC } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  styled,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Root = styled(Card)(({ theme }) => ({
  width: "fit-content !important",
}));

type MenuCardProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  img?: string;
  path?: string;
  /** 无权限时置灰且不可点击 */
  disabled?: boolean;
};

const MenuCard: FC<MenuCardProps> = ({
  title,
  description,
  img,
  path,
  disabled = false,
}) => {
  const navigate = useNavigate();
  return (
    <Root
      elevation={disabled ? 1 : 6}
      sx={{
        opacity: disabled ? 0.45 : 1,
        filter: disabled ? "grayscale(0.7)" : "none",
      }}
    >
      <CardActionArea
        disabled={disabled}
        sx={{ display: "flex", width: "100%", border: "none" }}
        onClick={() => {
          if (disabled || !path) return;
          navigate(path);
        }}
      >
        <CardMedia
          component="img"
          sx={{ height: "96px", width: "96px" }}
          image={img}
        />
        <CardContent sx={{ width: "180px" }}>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{ fontSize: "16px" }}
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontSize: "12px", color: "text.secondary" }}
          >
            {disabled ? "无访问权限" : description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Root>
  );
};

export default MenuCard;
