import { EtatDeCommande } from "../enums/etat-de-commande.enum";
import { EtatDeLivraison } from "../enums/etat-de-livraison.enum";
import { EtatDeTournee } from "../enums/etat-de-tournee.enum";
import { FormatTurn } from "../types/format-turn.type";

export const tournees: FormatTurn[] = [
    {
        reference: "t118G-A",
        etat: EtatDeTournee.PLANIFIEE,
        distance: 3000,
        livraisons: [
            {
                reference: "l118G-A1",
                etat: EtatDeLivraison.PLANIFIEE,
                ordre: 1,
                commandes: [
                    {
                        reference: "c114",
                        etat: EtatDeCommande.PLANIFIEE,
                        client: {
                            latitude: 45.21678,
                            longitude: 5.688157
                        }
                    }
                ]
            },
            {
                reference: "l118G-A2",
                etat: EtatDeLivraison.PLANIFIEE,
                ordre: 2,
                commandes: [
                    {
                        reference: "c009",
                        etat: EtatDeCommande.PLANIFIEE,
                        client: {
                            latitude: 45.148263,
                            longitude: 5.750864
                        }
                    }
                ]
            }
        ]
    },
    {
        reference: "t118G-B",
        etat: EtatDeTournee.PLANIFIEE,
        distance: 3000,
        livraisons: [
            {
                reference: "l118G-B1",
                etat: EtatDeLivraison.PLANIFIEE,
                ordre: 1,
                commandes: [
                    {
                        reference: "c346",
                        etat: EtatDeCommande.PLANIFIEE,
                        client: {
                            latitude: 45.21449,
                            longitude: 5.648892
                        }
                    }
                ]
            },
            {
                reference: "l118G-B2",
                etat: EtatDeLivraison.PLANIFIEE,
                ordre: 2,
                commandes: [
                    {
                        reference: "c164",
                        etat: EtatDeCommande.PLANIFIEE,
                        client: {
                            latitude: 45.184334,
                            longitude: 5.695172
                        }
                    },
                ]
            }
        ]
    }
]