import { Commande } from "./commande.type"
import { DeliveryTeam } from "./delivery-team.type";
import { Entrepot } from "./entrepot-type";

export type PlanDayFormsData = {
    selectedCommandes: Commande[],
    nbTurns: number,
    deliveryTeams: DeliveryTeam[]
};