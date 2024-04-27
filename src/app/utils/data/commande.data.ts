import { EtatDeCommande } from "../enums/etat-de-commande.enum";
import { Commande } from "../types/commande.type";

export const commandes: Commande[] = [
    // {
    //     reference: "c084",
    //     etat: EtatDeCommande.OUVERTE,
    //     client: {
    //         latitude: 45.165727,
    //         longitude: 5.735303
    //     }
    // },
    // {
    //     reference: "c224",
    //     etat: EtatDeCommande.OUVERTE,
    //     client: {
    //         latitude: 45.165727,
    //         longitude: 5.735303
    //     }
    // },
    {
        reference: "c328",
        etat: EtatDeCommande.OUVERTE,
        dateDeCreation: "",
        client: {
            latitude: 45.21678,
            longitude: 5.688157
        }
    },
    {
        reference: "c009",
        etat: EtatDeCommande.OUVERTE,
        dateDeCreation: "",
        client: {
            latitude: 45.148263,
            longitude: 5.750864
        }
    },
    {
        reference: "c346",
        etat: EtatDeCommande.OUVERTE,
        dateDeCreation: "",
        client: {
            latitude: 45.148263,
            longitude: 5.750864
        }
    },
    {
        reference: "c164",
        etat: EtatDeCommande.OUVERTE,
        dateDeCreation: "",
        client: {
            latitude: 45.184334,
            longitude: 5.695172
        }
    },
    
]