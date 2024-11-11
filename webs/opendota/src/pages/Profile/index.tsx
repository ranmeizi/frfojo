import { FC } from "react";
import { Box, Divider, Skeleton, styled } from "@mui/material";
import { LayoutMenu } from "@frfojo/components/layout";
import LogoMenu from "@/components/LogoMenu";
import NavBar from "@/components/NavBar";
import { useParams } from "react-router-dom";
import LastMonthHeatMap from "./components/LastMonthHeatmap";

const Root = styled("div")(({ theme }) => ({}));

type ProfileProps = {};

const Profile: FC<ProfileProps> = (props) => {
  const params = useParams<{ account_id: string }>();

  console.log("kanwo yixia,", params);

  const sidebar = <SideSkeleton />;
  // const sidebar = <LastMonthHeatMap account_id={Number(params.account_id)} />;

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />} sidebar={sidebar}>
      <Root>
        <Box sx={{ width: "500px", padding: "24px", background: "#111" }}>
          <LastMonthHeatMap account_id={Number(params.account_id)} />
        </Box>
      </Root>
    </LayoutMenu>
  );
};

export default Profile;

function SideSkeleton() {
  const params = useParams<{ account_id: string }>();
  return (
    <>
      <Box sx={{ padding: "20px" }}>
        <Skeleton variant="rounded" width={195} height={195} />
        {/* 名字 */}
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: "8px" }}
        >
          <Skeleton variant="text" width={140} sx={{ fontSize: "24px" }} />
          <Skeleton variant="text" width={30} sx={{ fontSize: "24px" }} />
        </Box>
        <Divider sx={{ margin: "4px 0" }} />
        {/* 胜率 */}
        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
          <Box>
            <Skeleton variant="text" width={60} sx={{ fontSize: "24px" }} />
            <Skeleton variant="text" width={60} sx={{ fontSize: "24px" }} />
          </Box>
          <Box>
            <Skeleton variant="text" width={60} sx={{ fontSize: "24px" }} />
            <Skeleton variant="text" width={60} sx={{ fontSize: "24px" }} />
          </Box>
          <Box>
            <Skeleton variant="text" width={60} sx={{ fontSize: "24px" }} />
            <Skeleton variant="text" width={60} sx={{ fontSize: "24px" }} />
          </Box>
        </Box>
        <Divider sx={{ margin: "4px 0" }} />
      </Box>
      <Box sx={{ padding: "8px", background: "#111" }}>
        <LastMonthHeatMap account_id={Number(params.account_id)} />
      </Box>
    </>
  );
}
