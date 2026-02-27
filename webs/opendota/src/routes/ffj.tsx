import { RouteObject } from "react-router-dom";
import Profile, {
  ProfileRecentMatches,
  ProfileTopHeroes,
} from "@/pages/Profile";
import Search from "@/pages/Search";
import Match from "@/pages/Match";
import MatchesPage from "@/pages/Matches";
import HeroesPage from "@/pages/Heroes";
import HeroDetailPage from "@/pages/HeroDetail";
import { LayoutMenu } from "@frfojo/components";

const routes: RouteObject[] = [
  {
    path: "/ffj",
    children: [
      {
        path: "/ffj/search",
        element: <Search />,
      },
      {
        path: "/ffj/search/:q",
        element: <Search />,
      },
      {
        path: "/ffj/matches",
        element: <MatchesPage />,
      },
      {
        path: "/ffj/profile/:account_id",
        element: <Profile />,
        children: [
          {
            index: true,
            element: <ProfileRecentMatches />,
          },
          {
            path: "heroes",
            element: <ProfileTopHeroes />,
          },
        ],
      },
      {
        path: "/ffj/match/:match_id",
        element: <Match />,
      },
      {
        path: "/ffj/heroes",
        element: <HeroesPage />,
      },
      {
        path: "/ffj/heroes/:hero_id",
        element: <HeroDetailPage />,
      },
      {
        path: "/ffj/*",
        element: <LayoutMenu>没有这个路由</LayoutMenu>,
      },
    ],
  },
];

export default routes;
