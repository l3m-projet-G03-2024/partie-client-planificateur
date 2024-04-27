import { EtatDeLivraison } from "../enums/etat-de-livraison.enum";
import { Commande } from "./commande.type";

export type FormatDelivery = {
    reference: string;
    etat: EtatDeLivraison;
    ordre: number;
    commandes?: Partial<Commande>[];
    referenceTournee?: string;
}