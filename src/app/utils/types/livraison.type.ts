import { EtatDeLivraison } from "../enums/etat-de-livraison.enum";
import { Commande } from "./commande.type";

export type Livraison = {
    reference: string;
    etat: EtatDeLivraison;
    ordre: number;
    commandes?: Commande[];
}