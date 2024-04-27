import { Client } from "./client.type";
import { Commande } from "./commande.type";

export type ClientGroupBy = Partial<Client> & {
    commandes: Commande[]
  };