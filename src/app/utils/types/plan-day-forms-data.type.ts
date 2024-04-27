import { Commande } from "./commande.type"
import { Entrepot } from "./entrepot-type";

export type PlanDayFormsData = {
    selectedCommandes: Commande[],
    nbTurns: number,
};