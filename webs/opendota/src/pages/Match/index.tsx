import { FC, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { LayoutMenu } from "@frfojo/components";
import LogoMenu from "@/components/LogoMenu";
import NavBar from "@/components/NavBar";
import { opendotaApi } from "@/redux/queryApis/opendota";
import { useHeroMap, useItemMaps } from "@/redux/hooks/useOpendotaConstants";
import Item from "@/components/Widgets/Item";
import { Tooltip } from "@mui/material";

type MatchPageParams = {
  match_id?: string;
};

const MatchPage: FC = () => {
  const params = useParams<MatchPageParams>();
  const matchId = Number(params.match_id);

  const heroMap = useHeroMap();
  const { keyById, itemByKey } = useItemMaps();

  const { data, isFetching } = opendotaApi.useMatchQuery(
    { match_id: matchId },
    {
      skip: Number.isNaN(matchId),
    } as any
  );

  const { radiant, dire } = useMemo(() => {
    const players = data?.players || [];
    const radiant = players.filter(
      (p) => (p.player_slot ?? 0) < 128
    );
    const dire = players.filter(
      (p) => (p.player_slot ?? 0) >= 128
    );
    return { radiant, dire };
  }, [data]);
  const [selected, setSelected] = useState<DTOs.Opendota.MatchPlayer | null>(
    null
  );

  const durationText = useMemo(() => {
    if (!data?.duration) return "--:--";
    const minutes = Math.floor(data.duration / 60);
    const seconds = data.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [data?.duration]);

  const content = (
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
      <Paper
        sx={{
          maxWidth: 960,
          width: "100%",
          p: 3,
        }}
      >
        {isFetching || !data ? (
          <Stack spacing={2}>
            <Skeleton variant="text" width={180} />
            <Skeleton variant="rectangular" height={80} />
            <Skeleton variant="rectangular" height={240} />
          </Stack>
        ) : (
          <>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="baseline"
              mb={2}
            >
              <Typography variant="h6">
                对局 #{data.match_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                时长：{durationText}
              </Typography>
            </Stack>

            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary">
                最终比分
              </Typography>
              <Typography variant="h5">
                天辉 {data.radiant_score} - {data.dire_score} 夜魇
              </Typography>
              <Typography
                variant="body2"
                color={data.radiant_win ? "success.main" : "error.main"}
              >
                {data.radiant_win ? "天辉胜利" : "夜魇胜利"}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TeamBlock
                title="天辉"
                players={radiant}
                heroMap={heroMap}
                onSelect={setSelected}
                selected={selected}
              />
              <TeamBlock
                title="夜魇"
                players={dire}
                heroMap={heroMap}
                onSelect={setSelected}
                selected={selected}
              />
            </Stack>

            {selected ? (
              <>
                <Divider sx={{ my: 2 }} />
                <PlayerDetail
                  player={selected}
                  heroMap={heroMap}
                  keyById={keyById}
                  itemByKey={itemByKey}
                />
              </>
            ) : null}
          </>
        )}
      </Paper>
    </Box>
  );

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />}>
      {content}
    </LayoutMenu>
  );
};

type TeamBlockProps = {
  title: string;
  players: DTOs.Opendota.MatchPlayer[];
  heroMap: ReturnType<typeof useHeroMap>;
  selected: DTOs.Opendota.MatchPlayer | null;
  onSelect: (p: DTOs.Opendota.MatchPlayer) => void;
};

const TeamBlock: FC<TeamBlockProps> = ({
  title,
  players,
  heroMap,
  selected,
  onSelect,
}) => {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" mb={1}>
        {title}
      </Typography>
      <Paper
        variant="outlined"
        sx={{ p: 1, bgcolor: "background.default" }}
      >
        {players.map((p, index) => {
          const hero = p.hero_id ? heroMap.get(p.hero_id) : undefined;
          const heroImg = hero
            ? `https://cdn.cloudflare.steamstatic.com${hero.img}`
            : "";
          const isSelected =
            selected?.player_slot !== undefined &&
            selected.player_slot === p.player_slot;

          return (
            <Stack
              key={p.player_slot ?? index}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                py: 0.5,
                cursor: "pointer",
                "&:not(:last-child)": {
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
                bgcolor: isSelected ? "action.selected" : "transparent",
              }}
              onClick={() => onSelect(p)}
            >
              <Box
                sx={{
                  width: 40,
                  height: 22,
                  borderRadius: 0.5,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundImage: heroImg ? `url(${heroImg})` : "none",
                  bgcolor: "grey.900",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 500 }}
                >
                  {p.personaname || p.account_id || "匿名玩家"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  KDA：{p.kills ?? 0}/{p.deaths ?? 0}/{p.assists ?? 0}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Paper>
    </Box>
  );
};

type PlayerDetailProps = {
  player: DTOs.Opendota.MatchPlayer;
  heroMap: ReturnType<typeof useHeroMap>;
  keyById: Map<number, string>;
  itemByKey: Map<string, DTOs.Opendota.ConstantsItem>;
};

const PlayerDetail: FC<PlayerDetailProps> = ({
  player,
  heroMap,
  keyById,
  itemByKey,
}) => {
  const hero = player.hero_id ? heroMap.get(player.hero_id) : undefined;
  const heroImg = hero
    ? `https://cdn.cloudflare.steamstatic.com${hero.img}`
    : "";

  const mainSlots = [
    player.item_0,
    player.item_1,
    player.item_2,
    player.item_3,
    player.item_4,
    player.item_5,
  ];

  const backpackSlots = [
    player.backpack_0,
    player.backpack_1,
    player.backpack_2,
  ];

  const neutralSlots = [player.item_neutral];

  const mapSlot = (id: number | null | undefined) => {
    if (typeof id !== "number") {
      return { id: undefined as number | undefined, key: undefined, meta: undefined as DTOs.Opendota.ConstantsItem | undefined };
    }
    const key = keyById.get(id);
    const meta = key ? itemByKey.get(key) : undefined;
    return { id, key, meta };
  };

  const mainItems = mainSlots.map(mapSlot);
  const backpackItems = backpackSlots.map(mapSlot);
  const neutralItems = neutralSlots.map(mapSlot);

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        玩家详情
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Box sx={{ width: 120 }}>
          <Box
            sx={{
              width: "100%",
              paddingTop: "56%",
              borderRadius: 1,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundImage: heroImg ? `url(${heroImg})` : "none",
              bgcolor: "grey.900",
            }}
          />
          <Typography
            variant="body2"
            sx={{ mt: 1 }}
            noWrap
          >
            {hero?.localized_name || "未知英雄"}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            等级：{player.level ?? "-"}
          </Typography>
          <Typography variant="body2">
            KDA：{player.kills ?? 0}/{player.deaths ?? 0}/{player.assists ?? 0}
          </Typography>
          <Typography variant="body2">
            GPM / XPM：{player.gold_per_min ?? 0} / {player.xp_per_min ?? 0}
          </Typography>
          <Typography variant="body2">
            补刀 / 英雄伤害：{player.last_hits ?? 0} /{" "}
            {player.hero_damage ?? 0}
          </Typography>
          <Typography variant="body2">
            建筑伤害：{player.tower_damage ?? 0}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              物品栏
            </Typography>
            <Stack direction="row" spacing={1}>
              {mainItems.map(({ key, meta }, index) => (
                <Box key={`main-${index}`} sx={{ width: 36 }}>
                  {key ? (
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="body2">
                            {meta?.dname || key}
                          </Typography>
                          {meta?.lore ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {meta.lore}
                            </Typography>
                          ) : null}
                        </Box>
                      }
                    >
                      <Box>
                        <Item itemName={key} />
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 0.5,
                        background:
                          "linear-gradient(145deg, #1b1f23, #0e1114)",
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.06)",
                        opacity: 0.35,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
            <Typography variant="body2" sx={{ mt: 1, mb: 0.5 }}>
              背包 / 中立物品
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {backpackItems.map(({ key, meta }, index) => (
                <Box key={`bp-${index}`} sx={{ width: 28 }}>
                  {key ? (
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="body2">
                            {meta?.dname || key}
                          </Typography>
                          {meta?.lore ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {meta.lore}
                            </Typography>
                          ) : null}
                        </Box>
                      }
                    >
                      <Box>
                        <Item itemName={key} />
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 0.5,
                        background:
                          "linear-gradient(145deg, #1b1f23, #0e1114)",
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.06)",
                        opacity: 0.35,
                      }}
                    />
                  )}
                </Box>
              ))}
              {neutralItems.map(({ key, meta }, index) => (
                <Box key={`nt-${index}`} sx={{ width: 28, ml: 1 }}>
                  {key ? (
                    <Tooltip
                      title={
                        <Box>
                          <Typography variant="body2">
                            {meta?.dname || key}
                          </Typography>
                          {meta?.lore ? (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {meta.lore}
                            </Typography>
                          ) : null}
                        </Box>
                      }
                    >
                      <Box>
                        <Item itemName={key} />
                      </Box>
                    </Tooltip>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 0.5,
                        background:
                          "linear-gradient(145deg, #1b1f23, #0e1114)",
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.06)",
                        opacity: 0.35,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default MatchPage;

