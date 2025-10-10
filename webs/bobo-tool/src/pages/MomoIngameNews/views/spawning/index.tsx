import { Box, Button, Paper, Tooltip, Typography } from "@mui/material";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { getMvpDeathNote } from "../../services/momoro";
import { AsyncButton } from "@frfojo/components";
import { useConstant } from "@frfojo/common/hooks";
import config, { EnumMvpIndex, MvpConfig, MvpDeathNote } from "../../mvp";
import dayjs from "dayjs";
import { DeathNote } from "../../note";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import { RequestQueue } from "@frfojo/common/request";

dayjs.extend(duration);
dayjs.extend(utc);

export default function Spawning() {
  const [note, setNote] = useState<MvpDeathNote[]>();

  // 所有mvp地块
  const map = useAllMap();

  console.log("map", map);
  console.log("note", note);

  useEffect(() => {
    // 轮流请求
    setTimeout(() => {
      for (const item of Object.values(map)) {
        rq.push(() => reqImage(item.imgUrl));
        rq.push(() =>
          reqImage(`https://file5s.ratemyserver.net/maps/${item.mapId}.gif`)
        );
      }
    }, 5000);
  }, []);

  // 按deathnote 分类地块
  const { alive, dead, maybe } = useFilterMap(map, note || []);

  async function getData() {
    const res = await getMvpDeathNote();

    if (res.code === "000000") {
      res.data.sort((a, b) => b?.death_time - a?.death_time);
      setNote(res.data);
    }
    console.log(res);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <Box>
      <Box display={"flex"} justifyContent={"space-between"} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom component="div">
          {"MVP存活状态 (先用插件去discord自行爬数据)"}
        </Typography>

        <AsyncButton variant="contained" onClick={getData}>
          刷新
        </AsyncButton>
      </Box>

      <Paper>
        <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
          {"肯定"}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {alive?.map((item) => (
            <MvpMapItem
              key={`${item.id}_${item.mapId}`}
              mvpId={item.id}
              mapId={item.mapId}
              note={item.note}
            ></MvpMapItem>
          ))}
        </Box>
      </Paper>
      <Paper>
        <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
          {"可能"}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {maybe?.map((item) => (
            <MvpMapItem
              key={`${item.id}_${item.mapId}`}
              mvpId={item.id}
              mapId={item.mapId}
              note={item.note}
            ></MvpMapItem>
          ))}
        </Box>
      </Paper>
      <Paper>
        <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
          死亡
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {dead?.map((item) => (
            <MvpMapItem
              key={`${item.id}_${item.mapId}`}
              mvpId={item.id}
              mapId={item.mapId}
              note={item.note}
            ></MvpMapItem>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

type MapItem = MvpConfig & MvpConfig["respawn_map"][""] & { mapId: string };

function useAllMap(): Record<string, MapItem> {
  const allMapItem = useConstant(() => {
    const res: Record<string, MapItem> = {};
    for (const conf of Object.values(config)) {
      for (const [name, spawnInfo] of Object.entries(conf.respawn_map)) {
        if (spawnInfo) {
          res[name] = {
            ...conf,
            mapId: name,
            ...spawnInfo,
          };
        }
      }
    }
    return res;
  });
  return allMapItem;
}

type DeathInfoMvp = MapItem & { note?: MvpDeathNote };

function useFilterMap(
  map: Record<string, MapItem>,
  death_note: MvpDeathNote[]
) {
  const deathMap = useMemo(() => {
    const res: Record<string, MvpDeathNote> = {};
    for (const row of death_note) {
      const map = row.map;

      if (!res[map]) {
        res[map] = row;
      }
    }
    return res;
  }, [death_note]);

  return useMemo(() => {
    const alive: DeathInfoMvp[] = [];
    const maybe: DeathInfoMvp[] = [];
    const dead: DeathInfoMvp[] = [];

    for (const mapItem of Object.values(map)) {
      const { time_lower, time_upper } = mapItem;

      console.log("mapItem", mapItem);

      const state = getMvpState(
        time_lower,
        time_upper,
        deathMap[mapItem.mapId]?.death_time
      );

      switch (state) {
        case "alive":
          alive.push({
            ...mapItem,
            // note: deathMap[mapItem.mapId],
          });
          break;
        case "dead":
          dead.push({
            ...mapItem,
            note: deathMap[mapItem.mapId],
          });
          break;
        case "maybe":
          maybe.push({
            ...mapItem,
            note: deathMap[mapItem.mapId],
          });
          break;
      }
    }

    return { alive, maybe, dead };
  }, [map, deathMap]);
}

function ShowValue({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box>
        {label}
        {":"}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

const rq = new RequestQueue();

// Mvp图块
function MvpMapItem(props: {
  mvpId: EnumMvpIndex;
  mapId: string;
  note?: MvpDeathNote;
}) {
  const { mvpId, mapId, note } = props;
  const mvpInfo = useConstant(() => config[mvpId]);

  const mapInfo = useConstant(() => config[mvpId].respawn_map[mapId]);

  return (
    <Tooltip
      placement="right"
      title={
        <Box sx={{ minWidth: "160px" }}>
          <ShowValue label="名称">{mvpInfo.name_CN}</ShowValue>
          <ShowValue label="地图">
            <a
              href="#"
              onClick={() => {
                window.open(
                  `https://ro.ro321.com/index.php?page=npc_shop_warp&map=${mapId}`
                );
              }}
            >
              {mapId}
            </a>
          </ShowValue>
          {note ? (
            <>
              <ShowValue label="死于">
                {`${note.killer}(${dayjs(note?.death_time).format(
                  "HH:mm:ss"
                )})`}
              </ShowValue>
              <ShowValue label="可能复活于">
                {`${dayjs(note.death_time + mapInfo.time_lower).format(
                  "HH:mm:ss"
                )}~${dayjs(note.death_time + mapInfo.time_upper).format(
                  "HH:mm:ss"
                )}`}
              </ShowValue>
            </>
          ) : null}
        </Box>
      }
    >
      <Box
        onClick={() => {
          window.open(
            `https://ro.ro321.com/index.php?page=mob_db&mob_id=${mvpId}`
          );
        }}
        sx={{
          height: "96px",
          width: "96px",
          backgroundRepeat: "no-repeat",
          background: `url(https://file5s.ratemyserver.net/maps/${mapId}.gif)`,
          backgroundSize: "100% 100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            height: "80%",
            width: "80%",
            background: `url(${mvpInfo.imgUrl})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "50%",
            color: "red",
          }}
        >
          {mvpId}
        </Box>
      </Box>
    </Tooltip>
  );
}

export function getMvpState(
  time_lower: number,
  time_upper: number,
  death_time: number
): "alive" | "dead" | "maybe" {
  // 如果 没有 death_time 或者 death_time + time_upper < now 那就一定活着

  if (!death_time || death_time + time_upper < Date.now()) {
    return "alive";
  }

  // 如果 death_time + time_lower> now 那就一定死了
  if (death_time + time_lower > Date.now()) {
    return "dead";
  }

  return "maybe";
}

async function reqImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      try {
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = function () {
      reject(); // 加载失败返回空字符串
    };
    img.src = url;
  });
}
