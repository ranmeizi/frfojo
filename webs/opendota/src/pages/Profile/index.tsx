import { FC } from "react";
import { styled } from "@mui/material";

const Root = styled("div")(({ theme }) => ({}));

type ProfileProps = {};

const Profile: FC<ProfileProps> = (props) => {
  return <Root>Component Profile</Root>;
};

export default Profile;
