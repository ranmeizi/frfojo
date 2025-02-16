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
};

const MenuCard: FC<MenuCardProps> = ({ title, description, img, path }) => {
  const navigate = useNavigate();
  return (
    <Root elevation={6}>
      <CardActionArea
        sx={{ display: "flex", width: "100%", border: "none" }}
        onClick={() => path && navigate(path)}
      >
        <CardMedia
          component="img"
          sx={{ height: "96px", width: "96px" }}
          image={img}
        />
        <CardContent sx={{ width: "128px" }}>
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
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Root>
  );
};

export default MenuCard;
