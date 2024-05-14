import { EtatDeLivraison } from "../enums/etat-de-livraison.enum";
import { EtatDeTournee } from "../enums/etat-de-tournee.enum";
import { EtatColor } from "./etat-colors.shared";
import { EtatLabel } from "./etat-label.shared";

export const EtatDetails = [
    { etat: EtatDeLivraison.PLANIFIEE, color: EtatColor.PLANIFIEE, label: EtatLabel.PLANIFIEE},
    { etat: EtatDeTournee.ENCHARGEMENT, color: EtatColor.ENCHARGEMENT, label: EtatLabel.ENCHARGEMENT},
    { etat: EtatDeLivraison.ENDECHARGEMMENT, color: EtatColor.ENDECHARGEMMENT, label: EtatLabel.ENDECHARGEMMENT},
    { etat: EtatDeLivraison.ENPARCOURS, color: EtatColor.ENPARCOURS, label: EtatLabel.ENPARCOURS},
    { etat: EtatDeLivraison.ENCLIENTELE, color: EtatColor.ENCLIENTELE, label: EtatLabel.ENCLIENTELE},
    { etat: EtatDeLivraison.ENMONTAGE, color: EtatColor.ENMONTAGE, label: EtatLabel.ENMONTAGE},
    { etat: EtatDeLivraison.EFFECTUEE, color: EtatColor.EFFECTUEE, label: EtatLabel.EFFECTUEE},
    { etat: EtatDeTournee.ENRETOUR, color: EtatColor.ENRETOUR, label: EtatLabel.ENRETOUR},
];