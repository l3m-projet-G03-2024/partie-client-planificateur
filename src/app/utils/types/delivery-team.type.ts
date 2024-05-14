import { Camion } from "./camion.type";
import { Employe } from "./employe.type";

export type DeliveryTeam = {
    livreurs: Employe[];
    camion: Camion | undefined;
    inEdition: boolean;
  };