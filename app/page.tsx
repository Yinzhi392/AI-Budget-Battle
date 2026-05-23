import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";

export default function Home() {
  return (
    <BattleShell
      content={routePages.landing}
      showSidebar={false}
      showStatusBadge={false}
    />
  );
}
