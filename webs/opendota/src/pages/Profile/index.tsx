import { FC, useMemo } from "react";
import {
  Box,
  Divider,
  Skeleton,
  Stack,
  styled,
  Typography,
  Paper,
} from "@mui/material";
import { LayoutMenu } from "@frfojo/components";
import LogoMenu from "@/components/LogoMenu";
import NavBar from "@/components/NavBar";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import LastMonthHeatMap from "./components/LastMonthHeatmap";
import { opendotaApi } from "@/redux/queryApis/opendota";
import { useHeroMap } from "@/redux/hooks/useOpendotaConstants";
import Avatar from "@/components/Widgets/Avatar";
import RankItem, { getRankText } from "@/components/Widgets/Rank";
import dayjs from "dayjs";

const Root = styled("div")(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
}));

type ProfileParams = {
  account_id?: string;
};

const Profile: FC = () => {
  const sidebar = <ProfileSidebar />;

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />} sidebar={sidebar}>
      <Root>
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Root>
    </LayoutMenu>
  );
};

export default Profile;

const ProfileSidebar: FC = () => {
  const params = useParams<ProfileParams>();
  const accountId = Number(params.account_id);
  const navigate = useNavigate();

  const { data: player, isFetching: loadingPlayer } =
    opendotaApi.usePlayerQuery(
      { account_id: accountId },
      {
        skip: Number.isNaN(accountId),
      } as any
    );

  const { data: matches, isFetching: loadingMatches } =
    opendotaApi.usePlayerMatchesQuery(
      {
        account_id: accountId,
        date: 90,
        significant: 0,
      },
      {
        skip: Number.isNaN(accountId),
      } as any
    );

  const summary = useMemo(() => {
    if (!matches || matches.length === 0) {
      return { total: 0, wins: 0, losses: 0, winrate: 0 };
    }
    let wins = 0;
    matches.forEach((m) => {
      const slot = m.player_slot ?? 0;
      const radiantWin = Boolean(m.radiant_win);
      const isRadiant = slot < 128;
      const win = (isRadiant && radiantWin) || (!isRadiant && !radiantWin);
      if (win) wins += 1;
    });
    const total = matches.length;
    const losses = total - wins;
    const winrate = total ? Math.round((wins / total) * 100) : 0;
    return { total, wins, losses, winrate };
  }, [matches]);

  const avatarUrl =
    player?.profile?.avatarfull ||
    player?.profile?.avatarmedium ||
    player?.profile?.avatar ||
    "";

  const rankTier = player?.rank_tier ?? 0;

  return (
    <>
      <Box sx={{ p: 2 }}>
        {loadingPlayer ? (
          <Skeleton variant="rounded" width={195} height={195} />
        ) : avatarUrl ? (
          <Box sx={{ width: 195 }}>
            <Avatar avatar={avatarUrl} vip={1} />
          </Box>
        ) : (
          <Skeleton variant="rounded" width={195} height={195} />
        )}

        <Box sx={{ mt: 1 }}>
          {loadingPlayer ? (
            <Skeleton
              variant="text"
              width={140}
              sx={{ fontSize: "24px" }}
            />
          ) : (
            <Box sx={{ maxWidth: 180 }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{ fontWeight: 600 }}
              >
                {player?.profile?.personaname || accountId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID: {accountId}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          {loadingPlayer ? (
            <Skeleton variant="rounded" width={40} height={40} />
          ) : (
            <Box sx={{ width: 40 }}>
              <RankItem rank_tier={rankTier || 0} />
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            {getRankText(rankTier)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
          {loadingMatches ? (
            [1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton
                  variant="text"
                  width={60}
                  sx={{ fontSize: "24px" }}
                />
                <Skeleton
                  variant="text"
                  width={60}
                  sx={{ fontSize: "24px" }}
                />
              </Box>
            ))
          ) : (
            <>
              <Box>
                <Typography variant="subtitle2">对局数</Typography>
                <Typography variant="h6">{summary.total}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">胜场</Typography>
                <Typography variant="h6" color="success.main">
                  {summary.wins}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">胜率</Typography>
                <Typography variant="h6">
                  {summary.winrate}%
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Stack spacing={1}>
          <Typography variant="subtitle2">视图</Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate(`/ffj/profile/${accountId}`)}
          >
            <Typography variant="body2">
              最近比赛
            </Typography>
          </Paper>
        </Stack>
      </Box>
      <Box sx={{ p: 1, bgcolor: "#111", minHeight: 185 }}>
        <LastMonthHeatMap account_id={accountId} />
      </Box>
    </>
  );
};

export const ProfileRecentMatches: FC = () => {
  const params = useParams<ProfileParams>();
  const accountId = Number(params.account_id);
  const navigate = useNavigate();

  const heroMap = useHeroMap();

  const { data, isFetching } = opendotaApi.usePlayerRecentMatchesQuery(
    {
      account_id: accountId,
    },
    {
      skip: Number.isNaN(accountId),
    } as any
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        最近比赛
      </Typography>
      <Paper variant="outlined">
        {isFetching || !data ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width={220} />
            <Skeleton variant="rectangular" height={160} />
          </Box>
        ) : (
          data.map((m) => {
            const slot = m.player_slot ?? 0;
            const radiantWin = Boolean(m.radiant_win);
            const isRadiant = slot < 128;
            const isWin =
              (isRadiant && radiantWin) || (!isRadiant && !radiantWin);

            const hero = m.hero_id ? heroMap.get(m.hero_id) : undefined;
            const heroImg = hero
              ? `https://cdn.cloudflare.steamstatic.com${hero.img}`
              : "";

            return (
              <Box
                key={m.match_id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 80px",
                  columnGap: 1.5,
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
                onClick={() =>
                  m.match_id && navigate(`/ffj/match/${m.match_id}`)
                }
              >
                <Box
                  sx={{
                    width: 56,
                    height: 28,
                    borderRadius: 0.5,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundImage: heroImg ? `url(${heroImg})` : "none",
                    bgcolor: "grey.900",
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    color={isWin ? "success.main" : "error.main"}
                  >
                    {isWin ? "胜利" : "失败"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    KDA：{m.kills ?? 0}/{m.deaths ?? 0}/{m.assists ?? 0}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    textAlign: "right",
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  {Math.round((m.duration ?? 0) / 60)} 分钟
                </Box>
              </Box>
            );
          })
        )}
      </Paper>
    </Box>
  );
};

export const ProfileTopHeroes: FC = () => {
  const params = useParams<ProfileParams>();
  const accountId = Number(params.account_id);

  const heroMap = useHeroMap();

  const { data: heroes, isFetching } = opendotaApi.usePlayerHeroesQuery(
    {
      account_id: accountId,
      limit: 12,
    },
    {
      skip: Number.isNaN(accountId),
    } as any
  );

  const { data: rankings } = opendotaApi.usePlayerRankingsQuery(
    { account_id: accountId },
    {
      skip: Number.isNaN(accountId),
    } as any
  );

  const rankingMap = useMemo(() => {
    const map = new Map<number, DTOs.Opendota.PlayerHeroRanking>();
    rankings?.forEach((r) => {
      map.set(r.hero_id, r);
    });
    return map;
  }, [rankings]);

  const list = useMemo(() => {
    if (!heroes) return [];
    return [...heroes].sort((a, b) => b.games - a.games);
  }, [heroes]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        常用英雄
      </Typography>
      <Paper variant="outlined">
        {isFetching || !heroes ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width={220} />
            <Skeleton variant="rectangular" height={160} />
          </Box>
        ) : (
          list.map((h) => {
            const hero = heroMap.get(h.hero_id);
            const heroImg = hero
              ? `https://cdn.cloudflare.steamstatic.com${hero.img}`
              : "";
            const r = rankingMap.get(h.hero_id);
            const winrate =
              h.games > 0 ? Math.round((h.win / h.games) * 100) : 0;

            return (
              <Box
                key={h.hero_id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 80px",
                  columnGap: 1.5,
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 34,
                    borderRadius: 1,
                    backgroundImage: heroImg ? `url(${heroImg})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    bgcolor: "grey.900",
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap>
                    {hero?.localized_name || `英雄 ${h.hero_id}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    场次：{h.games} · 胜率：{winrate}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", fontSize: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    MMR：{r?.score?.toFixed(0) ?? "-"}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Paper>
    </Box>
  );
};
