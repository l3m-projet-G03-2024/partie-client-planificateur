import { EtatDeJournee } from "../enums/etat-de-journee.enum"
import { Entrepot } from "./entrepot-type"

export type Journee = {
    reference: string,
    etat: EtatDeJournee,
    date: string,
    distanceAParcourir?: number,
    montant?: number,
    tempsDeMontage?: number,
    entrepot?: Entrepot,
}