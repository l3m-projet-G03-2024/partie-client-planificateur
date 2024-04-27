import { EtatDeTournee } from "../enums/etat-de-tournee.enum";
import { FormatDelivery } from "./format-delivery.type";

export type FormatTurn = {
    reference: string;
    etat: EtatDeTournee;
    distance: number;
    livraisons: FormatDelivery[]
}