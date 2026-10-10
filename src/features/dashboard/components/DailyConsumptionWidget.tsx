import { WidgetCard } from "./WidgetCard";
import { ConsumptionChart } from "./ConsumptionChart";

export function DailyConsumptionWidget() {
  return (
    <WidgetCard title="Consumo diário">
      <ConsumptionChart readings={[]} />
    </WidgetCard>
  );
}
