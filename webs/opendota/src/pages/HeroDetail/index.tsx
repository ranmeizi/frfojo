import { FC, useMemo } from "react";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { LayoutMenu } from "@frfojo/components";
import LogoMenu from "@/components/LogoMenu";
import NavBar from "@/components/NavBar";
import { useParams } from "react-router-dom";
import { opendotaApi } from "@/redux/queryApis/opendota";

type HeroDetailParams = {
  hero_id?: string;
};

const HeroDetailPage: FC = () => {
  const params = useParams<HeroDetailParams>();
  const heroId = Number(params.hero_id);

  const { data: heroStats, isFetching } = opendotaApi.useHeroStatsQuery();

  const hero = useMemo(() => {
    if (!heroStats || Number.isNaN(heroId)) return undefined;
    return heroStats.find((h) => h.id === heroId);
  }, [heroStats, heroId]);

  const img = hero
    ? `https://cdn.cloudflare.steamstatic.com${hero.img}`
    : "";
  const icon = hero
    ? `https://cdn.cloudflare.steamstatic.com${hero.icon}`
    : "";

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />}>
      <Box
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          p: 3,
        }}
      >
        <Box sx={{ maxWidth: 980, width: "100%" }}>
          {isFetching || !hero ? (
            <Paper sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={180} sx={{ mb: 2 }} />
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={320} />
            </Paper>
          ) : (
            <Stack spacing={3}>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        width: "100%",
                        paddingTop: "56%",
                        borderRadius: 1,
                        backgroundImage: `url(${img})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        mb: 1,
                      }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      {icon ? (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            backgroundImage: `url(${icon})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      ) : null}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap>
                          {hero.localized_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {hero.name}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        主属性：{hero.primary_attr} · 攻击类型：
                        {hero.attack_type}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap" }}>
                      {hero.roles.slice(0, 4).map((r) => (
                        <Chip
                          key={r}
                          label={r}
                          size="small"
                          sx={{
                            mr: 0.5,
                            mb: 0.5,
                            fontSize: 10,
                            height: 18,
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      基础属性
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          生命值
                        </Typography>
                        <Typography variant="body2">
                          {hero.base_health} (+{hero.base_health_regen}/s)
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          魔法
                        </Typography>
                        <Typography variant="body2">
                          {hero.base_mana} (+{hero.base_mana_regen}/s)
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          护甲 / 魔抗
                        </Typography>
                        <Typography variant="body2">
                          {hero.base_armor} / {hero.base_mr}%
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          攻击力
                        </Typography>
                        <Typography variant="body2">
                          {hero.base_attack_min} - {hero.base_attack_max}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          攻击距离
                        </Typography>
                        <Typography variant="body2">
                          {hero.attack_range}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          移动速度
                        </Typography>
                        <Typography variant="body2">
                          {hero.move_speed}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="text.secondary">
                          视野（昼/夜）
                        </Typography>
                        <Typography variant="body2">
                          {hero.day_vision} / {hero.night_vision}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          属性成长
                        </Typography>
                        <Typography variant="body2">
                          力量：{hero.base_str} (+{hero.str_gain}) · 敏捷：
                          {hero.base_agi} (+{hero.agi_gain}) · 智力：
                          {hero.base_int} (+{hero.int_gain})
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  胜率与选择率（最近）
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <StatBlock
                      label="公开对局 Pick"
                      value={hero.pub_pick ?? 0}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StatBlock
                      label="公开对局 胜率"
                      value={
                        hero.pub_pick
                          ? `${Math.round(
                              (hero.pub_win / hero.pub_pick) * 100,
                            )}%`
                          : "-"
                      }
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StatBlock label="职业比赛 Pick" value={hero.pro_pick ?? 0} />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <StatBlock
                      label="职业赛 胜率"
                      value={
                        hero.pro_pick
                          ? `${Math.round(
                              (hero.pro_win / hero.pro_pick) * 100,
                            )}%`
                          : "-"
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </Box>
      </Box>
    </LayoutMenu>
  );
};

type StatBlockProps = {
  label: string;
  value: number | string;
};

const StatBlock: FC<StatBlockProps> = ({ label, value }) => {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
};

export default HeroDetailPage;

