import { Emploi } from "../enums/emploi.enum"
import { Entrepot } from "./entrepot-type"

export type Employe = {
    trigramme: string,
    email: string,
    prenom: string,
    nom: string,
    photo: string,
    telephone: string,
    emploi: Emploi,
    entrepot: Entrepot
}