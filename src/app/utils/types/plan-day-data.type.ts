import { ClientGroupBy } from "./client-deliveries-group-by.type";
import { PlanDayFormsData } from "./plan-day-forms-data.type"

export type PlanDayData = PlanDayFormsData & {
    clientDeliveries: ClientGroupBy[],
    dayReference: string,
};