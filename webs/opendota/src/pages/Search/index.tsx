import { FC, useEffect, useState } from "react";
import {
  Avatar as MuiAvatar,
  Box,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  styled,
  Typography,
} from "@mui/material";
import { LayoutMenu } from "@frfojo/components";
import NavBar from "@/components/NavBar";
import LogoMenu from "@/components/LogoMenu";
import { useNavigate, useParams } from "react-router-dom";
import { opendotaApi } from "@/redux/queryApis/opendota";
import SearchBar from "@/components/SearchBar";

const Root = styled("div")(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
}));

type SearchRouteParams = {
  q?: string;
};

const Search: FC = () => {
  const params = useParams<SearchRouteParams>();
  const navigate = useNavigate();

  const initialKeyword = params.q ?? "";
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  const { data, isFetching } = opendotaApi.useSerachQuery(
    { q: initialKeyword },
    {
      skip: !initialKeyword,
    } as any
  );

  function handleSubmit(value: string) {
    const next = value.trim();
    if (!next) {
      navigate("/ffj/search", { replace: true });
      return;
    }
    navigate(`/ffj/search/${encodeURIComponent(next)}`);
  }

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />}>
      <Root>
        <Box sx={{ maxWidth: 640, width: "100%", p: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              搜索 Dota 2 玩家
            </Typography>
            <SearchBar
              value={keyword}
              onChange={setKeyword}
              onSubmit={handleSubmit}
            />
          </Paper>

          <Paper sx={{ p: 1 }}>
            {!initialKeyword ? (
              <Box sx={{ p: 2, color: "text.secondary", fontSize: 14 }}>
                输入 Steam32 ID 或玩家昵称进行搜索。
              </Box>
            ) : isFetching ? (
              <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width={220} />
                <Skeleton variant="text" width={320} />
                <Skeleton variant="text" width={280} />
              </Box>
            ) : !data || data.length === 0 ? (
              <Box sx={{ p: 2, color: "text.secondary", fontSize: 14 }}>
                没有找到和 “{initialKeyword}” 相关的玩家。
              </Box>
            ) : (
              <List dense disablePadding>
                {data.map((item) => (
                  <ListItemButton
                    key={item.account_id}
                    onClick={() =>
                      item.account_id &&
                      navigate(`/ffj/profile/${item.account_id}`)
                    }
                    >
                      <ListItemAvatar>
                        <MuiAvatar
                          src={item.avatarfull || undefined}
                          sx={{ width: 32, height: 32 }}
                        >
                          ?
                        </MuiAvatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {item.personaname || item.account_id}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            ID: {item.account_id}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Root>
    </LayoutMenu>
  );
};

export default Search;
