import { BattleShell } from "@/components/battle-shell";
import { routePages } from "@/lib/route-content";
import { RegionCurrencyForm } from "@/app/battle/region-currency/region-currency-form";
import { getWorldCurrencyOptions, getWorldRegionOptions } from "@/lib/world-options";

export default function RegionCurrencyPage() {
  const worldRegions = getWorldRegionOptions("zh-CN");
  const worldCurrencies = getWorldCurrencyOptions("zh-CN");

  return (
    <BattleShell
      content={routePages.regionCurrency}
      showActions={false}
      showStatusBadge={false}
      showHighlights={false}
      showSidebar={false}
    >
      <RegionCurrencyForm worldRegions={worldRegions} worldCurrencies={worldCurrencies} />
    </BattleShell>
  );
}
