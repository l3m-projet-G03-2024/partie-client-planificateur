import { EtatDeTournee } from "../enums/etat-de-tournee.enum";
import { Livraison } from "./livraison.type";

export type Tournee = {
    reference: string;
    etat: EtatDeTournee;
    distance: number;
    livraisons: Livraison[];
}