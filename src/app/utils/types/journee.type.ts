import { EtatDeJournee } from "../enums/etat-de-journee.enum"

export type Journee = {
    reference: string,
    etat: EtatDeJournee,
    date: string,
    distanceAParcourir?: number,
    montant?: number,
    tempsDeMontage?: number,
}