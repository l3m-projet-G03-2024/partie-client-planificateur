import { EtatDeTournee } from "../enums/etat-de-tournee.enum";
import { Camion } from "./camion.type";
import { Employe } from "./employe.type";
import { Livraison } from "./livraison.type";

export type Tournee = {
    reference: string;
    etat: EtatDeTournee;
    distance: number;
    employes: Employe[];
    camion: Camion;
    livraisons: Livraison[];
}