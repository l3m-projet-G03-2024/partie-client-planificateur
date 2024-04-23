import { EtatDeJournee } from "../enums/etat-de-journee.enum";
import { Journee } from "../types/journee.type";

export const journees: readonly Journee[] = [
    { reference: 'J020G', etat: EtatDeJournee.NONPLANIFIEE, date: "2024-04-22" },
    { reference: 'J019G', etat: EtatDeJournee.NONPLANIFIEE, date: "2024-04-19" },
    { reference: 'J018G', etat: EtatDeJournee.ENCOURS, date: "2024-04-18" },
    { reference: 'J013G', etat: EtatDeJournee.EFFECTUEE, date: "2024-04-13" },
    { reference: 'J012G', etat: EtatDeJournee.EFFECTUEE, date: "2024-04-12" },
    { reference: 'J011G', etat: EtatDeJournee.EFFECTUEE, date: "2024-04-11" },
    { reference: 'J010G', etat: EtatDeJournee.EFFECTUEE, date: "2024-04-10" },
];