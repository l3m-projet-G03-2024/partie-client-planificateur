import { Commande } from "./commande.type"

export type PlanDayReturnFormsData = {
    selectedCommandes: Commande[],
    nbTurns: number
};