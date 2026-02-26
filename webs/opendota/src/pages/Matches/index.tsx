import { FC, useMemo } from "react";
import {
  Box,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import { LayoutMenu } from "@frfojo/components";
import LogoMenu from "@/components/LogoMenu";
import NavBar from "@/components/NavBar";
import { opendotaApi } from "@/redux/queryApis/opendota";
import { useHeroMap } from "@/redux/hooks/useOpendotaConstants";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const Root = styled("div")(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
}));

const MatchesPage: FC = () => {
  const navigate = useNavigate();
  const heroMap = useHeroMap();

  const {
    data: publicMatches,
    isFetching: loadingPublic,
  } = opendotaApi.usePublicMatchesQuery();

  const {
    data: proMatches,
    isFetching: loadingPro,
  } = opendotaApi.useProMatchesQuery();

  const latestPublic = useMemo(
    () => (publicMatches || []).slice(0, 20),
    [publicMatches]
  );

  const latestPro = useMemo(
    () => (proMatches || []).slice(0, 8),
    [proMatches]
  );

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />}>
      <Root>
        <Box
          sx={{
            maxWidth: 1200,
            width: "100%",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* 最近公共比赛 - 占满整行 */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              最近公共比赛
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                maxHeight: "calc(100vh - 220px)",
                overflowY: "auto",
              }}
            >
              {loadingPublic || !publicMatches ? (
                <Box sx={{ p: 2 }}>
                  <Skeleton variant="text" width={220} />
                  <Skeleton variant="rectangular" height={200} />
                </Box>
              ) : (
                latestPublic.map((m) => {
                    const start = m.start_time
                      ? dayjs(m.start_time * 1000)
                      : null;
                    const durationMin = m.duration
                      ? Math.round(m.duration / 60)
                      : 0;
                    const isRadiantWin = Boolean(m.radiant_win);

                    const radiantHeroes =
                      m.radiant_team
                        ?.map((id) => heroMap.get(id))
                        .filter(Boolean) || [];
                    const direHeroes =
                      m.dire_team
                        ?.map((id) => heroMap.get(id))
                        .filter(Boolean) || [];

                    return (
                      <Box
                        key={m.match_id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "100px 1fr",
                          columnGap: 1.5,
                          alignItems: "center",
                          px: 2,
                          py: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                        onClick={() =>
                          m.match_id && navigate(`/ffj/match/${m.match_id}`)
                        }
                      >
                        <Box sx={{ fontSize: 12 }}>
                          <Typography variant="caption" color="text.secondary">
                            #{m.match_id}
                          </Typography>
                          {start ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {start.format("MM-DD HH:mm")}
                            </Typography>
                          ) : null}
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <HeroRow heroes={radiantHeroes} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              vs
                            </Typography>
                            <HeroRow heroes={direHeroes} />
                          </Stack>
                          <Typography
                            variant="caption"
                            color={isRadiantWin ? "success.main" : "error.main"}
                          >
                            {isRadiantWin ? "天辉胜利" : "夜魇胜利"} ·{" "}
                            {durationMin} 分钟
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
              )}
            </Paper>
          </Box>

          {/* 明星选手比赛（职业） - 下面占满整行，用卡片网格 */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              明星选手比赛（职业）
            </Typography>
            <Grid container spacing={2}>
              {loadingPro || !proMatches
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                      <Paper sx={{ p: 2, height: "100%" }}>
                        <Skeleton variant="text" width={160} />
                        <Skeleton variant="text" width={80} />
                        <Skeleton
                          variant="rectangular"
                          height={60}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    </Grid>
                  ))
                : latestPro.map((m) => {
                    const start = m.start_time
                      ? dayjs(m.start_time * 1000)
                      : null;
                    const durationMin = m.duration
                      ? Math.round(m.duration / 60)
                      : 0;
                    const isRadiantWin = Boolean(m.radiant_win);

                    return (
                      <Grid item xs={12} sm={6} md={3} key={m.match_id}>
                        <Paper
                          sx={{
                            p: 2,
                            height: "100%",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                          }}
                          onClick={() =>
                            m.match_id && navigate(`/ffj/match/${m.match_id}`)
                          }
                        >
                          <Typography variant="body2" noWrap>
                            {m.radiant_name || "天辉"} vs{" "}
                            {m.dire_name || "夜魇"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {m.league_name || "未知联赛"}
                          </Typography>
                          <Box sx={{ flex: 1, mt: 1 }}>
                            <Typography
                              variant="body2"
                              color={
                                isRadiantWin ? "success.main" : "error.main"
                              }
                            >
                              {m.radiant_score} - {m.dire_score}{" "}
                              {isRadiantWin ? "天辉胜利" : "夜魇胜利"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {start ? start.format("MM-DD HH:mm") : ""} ·{" "}
                              {durationMin} 分钟
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
            </Grid>
          </Box>
        </Box>
      </Root>
    </LayoutMenu>
  );
};

type HeroRowProps = {
  heroes: DTOs.Opendota.ConstantsHero[];
};

const HeroRow: FC<HeroRowProps> = ({ heroes }) => {
  if (!heroes || heroes.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        未知阵容
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.5}>
      {heroes.slice(0, 5).map((h) => (
        <Box
          key={h.id}
          sx={{
            width: 20,
            height: 12,
            borderRadius: 0.5,
            backgroundImage: `url(https://api.opendota.com${h.img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}
    </Stack>
  );
};

export default MatchesPage;

