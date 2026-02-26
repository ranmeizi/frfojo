import { FC, useMemo } from "react";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Typography,
  styled,
} from "@mui/material";
import { LayoutMenu } from "@frfojo/components";
import LogoMenu from "@/components/LogoMenu";
import NavBar from "@/components/NavBar";
import { opendotaApi } from "@/redux/queryApis/opendota";

const Root = styled("div")(() => ({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
}));

const CARD_HEIGHT = 220;

const HeroesPage: FC = () => {
  const { data, isFetching } = opendotaApi.useConstantsHeroesQuery();

  const heroes = useMemo(() => {
    if (!data) return [];
    return Object.values(data).sort((a, b) =>
      (a.localized_name || "").localeCompare(b.localized_name || ""),
    );
  }, [data]);

  return (
    <LayoutMenu logo={<LogoMenu />} header={<NavBar />}>
      <Root>
        <Box sx={{ maxWidth: 1200, width: "100%", p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            英雄列表
          </Typography>
          <Grid container spacing={2}>
            {isFetching || !data
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}>
                    <Paper
                      sx={{
                        p: 1.5,
                        height: CARD_HEIGHT,
                        width: CARD_HEIGHT,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Skeleton
                        variant="rectangular"
                        height={120}
                        sx={{ mb: 1 }}
                      />
                      <Skeleton variant="text" width={80} />
                      <Skeleton variant="text" width={60} />
                    </Paper>
                  </Grid>
                ))
              : heroes.map((hero) => {
                  const img = `https://api.opendota.com${hero.img}`;
                  return (
                    <Grid item xs={6} sm={4} md={3} key={hero.id}>
                      <Paper
                        sx={{
                          p: 1.5,
                          cursor: "default",
                          bgcolor: "background.paper",
                          height: CARD_HEIGHT,
                          width: CARD_HEIGHT,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: 120,
                            borderRadius: 1,
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            mb: 1,
                          }}
                        />
                        <Typography variant="body2" noWrap>
                          {hero.localized_name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          属性：{hero.primary_attr}
                        </Typography>
                        <Box
                          sx={{
                            mt: 0.5,
                            display: "flex",
                            flexWrap: "wrap",
                            flexGrow: 1,
                            alignItems: "flex-start",
                          }}
                        >
                          {hero.roles.slice(0, 3).map((r) => (
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
                      </Paper>
                    </Grid>
                  );
                })}
          </Grid>
        </Box>
      </Root>
    </LayoutMenu>
  );
};

export default HeroesPage;
