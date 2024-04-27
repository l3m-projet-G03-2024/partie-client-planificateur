import { EtatDeCommande } from "../enums/etat-de-commande.enum"
import { Client } from "./client.type"

export type Commande = {
    reference: string,
    etat: EtatDeCommande,
    dateDeCreation: string,
    client: Partial<Client>
}