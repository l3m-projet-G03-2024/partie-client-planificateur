import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { Journee } from '../utils/types/journee.type';
import { Commande } from '../utils/types/commande.type';
import { OptimizeDayResponse } from '../utils/types/optimize-day-response.type';
import { ClientGroupBy } from '../utils/types/client-deliveries-group-by.type';
import { PlanDayData } from '../utils/types/plan-day-data.type';
import { EtatDeLivraison } from '../utils/enums/etat-de-livraison.enum';
import { alphabet } from '../utils/data/alphabet.data';
import { EtatDeTournee } from '../utils/enums/etat-de-tournee.enum';
import { EtatDeCommande } from '../utils/enums/etat-de-commande.enum';
import { FormatTurn } from '../utils/types/format-turn.type';
import { Entrepot } from '../utils/types/entrepot-type';
import { EtatDeJournee } from '../utils/enums/etat-de-journee.enum';
import { Livraison } from '../utils/types/livraison.type';
import { AddDayDialogResponse } from '../components/journees/add-day-dialog/add-day-dialog';

type UpdateDay = {
  etat?: EtatDeJournee;
  distanceAParcourir?: number;
};

@Injectable({
  providedIn: 'root'
})
export class JourneeService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;
  private readonly PLANNER_WS_BASE_PATH = `${environment.plannerWsServer}`;

  constructor(private httpClient: HttpClient) { }

  createDay(data: AddDayDialogResponse): Promise<Journee> {
    const {date, selectedEntrepot} = data;
    const noDay = this.calculateYearDateNo(date);
    const reference = `j${("000" + noDay).slice(-3)}${selectedEntrepot.lettre}`;
    
    
    return firstValueFrom(
      this.httpClient.post<Journee>(
        `${this.MAIN_SERVER_BASE_PATH}/journees/`,
        {
          reference,
          date: `${date.getFullYear()}-${("00" + (date.getMonth()+1)).slice(-2)}-${("00" + date.getDate()).slice(-2)}`,
          nomEntrepot: selectedEntrepot.nom
        }
      )
    );
  }

  listDays(): Promise<Journee[]> {
    return firstValueFrom(this.httpClient.get<Journee[]>(
        `${this.MAIN_SERVER_BASE_PATH}/journees/`
      )
    ); 
  }

  deleteDay(reference: string): Promise<Object> {
    return firstValueFrom(this.httpClient.delete(
      `${this.MAIN_SERVER_BASE_PATH}/journees/${reference}`
    ));
  }

  
  getDayDetails(reference: string): Promise<Journee> {
    return firstValueFrom(this.httpClient.get<Journee>(
      `${this.MAIN_SERVER_BASE_PATH}/journees/${reference}`
    ));
  }

  async planDay(planDayData: PlanDayData, distancesMatrix: number[][]): Promise<FormatTurn[]> {
    const optimizedDayData = await this.optmizeDay(planDayData, distancesMatrix);

    await this.updateDay(
      planDayData.dayReference,
      {
        etat: EtatDeJournee.PLANIFIEE,
        distanceAParcourir: optimizedDayData.longTournees.reduce((acc, next) => acc+next)
      },
    )
    
    return this.formatOptimizedDayData(planDayData, optimizedDayData);
  }

  updateDay(dayReference: string, body: UpdateDay): Promise<Journee> {
    return firstValueFrom(this.httpClient.patch<Journee>(
      `${this.MAIN_SERVER_BASE_PATH}/journees/${dayReference}`,
      {
        ...body
      }
    ));
  }

  listEntrepots(): Promise<Entrepot[]> {
    return firstValueFrom(this.httpClient.get<Entrepot[]>(
      `${this.MAIN_SERVER_BASE_PATH}/entrepots`,
      {
        
      }
    ));
  }


  formatOptimizedDayData(planDayData: PlanDayData, optimizedDayData: OptimizeDayResponse): FormatTurn[] {
    return optimizedDayData.tournees.map((turn, index) => {
      const formattedTurn = this.formatTurn(index, planDayData.dayReference);
      return {
        ...formattedTurn,
        distance: optimizedDayData.longTournees[index],
        livraisons: turn.slice(1).map((delivery, index) => ({   // slice(1): pour enlever l'entrepôt de la liste des livraisons
          ...this.formatDelivery(index+1, formattedTurn.reference),
          commandes: planDayData.clientDeliveries[delivery-1].commandes.map(commande => ({ // [delivery-1]: pour remettre à niveau les indexes
            ...commande,
            etat: EtatDeCommande.PLANIFIEE,
            client: undefined
          }))
        }))
      }
    }
    );
  }

  formatTurn(index: number, dayReference: string) {
    return {
      reference: `t${dayReference.substring(1)}-${alphabet[index].toUpperCase()}`,
      etat: EtatDeTournee.PLANIFIEE,
    }
  }

  formatDelivery(index: number, turnReference: string): Livraison {
    return {
      reference: `l${turnReference.substring(1)}${index}`,
      etat: EtatDeLivraison.PLANIFIEE,
      ordre: index
    }
  }

  async optmizeDay(planDayData: PlanDayData, distancesMatrix: number[][]): Promise<OptimizeDayResponse> {
    const data = {
      k: planDayData.nbTurns,
      matrix: distancesMatrix,
      start: 0
    }

    const response = await firstValueFrom(this.httpClient.post<OptimizeDayResponse>(
      `${this.PLANNER_WS_BASE_PATH}/planner/planif`,
      {...data},
    ));

    return {
      tournees: response.tournees.filter(tournee => tournee.length > 1),
      longTournees: response.longTournees.filter(long => long > 0)
    }
  }

  groupCommandsByClientGeoLocation(commandes: Commande[]): ClientGroupBy[] {
    return commandes.reduce((acc, commande) => {
      const client = acc.find(x =>
        x.email === commande.client.email
      );

      if (client == undefined) this.addNewClient(acc, commande);
      if (client != undefined) this.addCommandeToClient(acc, commande);
      return acc;
    }, [] as ClientGroupBy[]);
  }

  addNewClient(clients: ClientGroupBy[], commande: Commande) {
    clients.push({
      email : commande.client.email,
      adresse: commande.client.adresse,
      codePostal: commande.client.codePostal,
      ville: commande.client.ville,
      commandes: [commande]
    })
  }

  addCommandeToClient(clients: ClientGroupBy[], commande: Commande) {
    const clientIndex = clients.findIndex(x =>
      x.email === commande.client.email
    )
    
    clients[clientIndex].commandes.push(commande);
  }

  calculateYearDateNo(date: Date): number {
    const startYearDate = new Date(`${date.getFullYear()}-01-01`);

    const noDay = (date.getTime() - startYearDate.getTime())
                / (24 * 3600 * 1000)
                + 1;
    
    return Math.round(+noDay.toFixed(0)); 
  }

}
