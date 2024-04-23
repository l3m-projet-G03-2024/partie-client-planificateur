import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { Journee } from '../utils/types/journee.type';
import { Commande } from '../utils/types/commande.type';
import { PlanDayFormsData } from '../utils/types/plan-day-return-forms-data.type';
import { Client } from '../utils/types/client.type';
import { OptimizeDayResponse } from '../utils/types/optimize-day-response.type';

export type ClientGroupBy = Partial<Client> & {
  commandes: Commande[]
};

@Injectable({
  providedIn: 'root'
})
export class JourneeService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;
  private readonly PLANNER_WS_BASE_PATH = `${environment.plannerWsServer}`;

  constructor(private httpClient: HttpClient) { }

  createDay(date: Date): Promise<Journee> {
    const noDay = this.calculateYearDateNo(date);
    const reference = `j${("000" + noDay).slice(-3)}G`;
    
    return firstValueFrom(
      this.httpClient.post<Journee>(
        `${this.MAIN_SERVER_BASE_PATH}/journees`,
        {
          reference,
          date: date.toISOString()
        },
        {
          headers: { Accept: 'application/json' }
        }
      )
    );
  }

  listDays(): Promise<Journee[]> {
    return firstValueFrom(this.httpClient.get<Journee[]>(
        `${this.MAIN_SERVER_BASE_PATH}/journees`
      )
    ); 
  }

  deleteDay(reference: string): void {
    firstValueFrom(this.httpClient.delete(
      `${this.MAIN_SERVER_BASE_PATH}/journees/${reference}`,
      {
        headers: { Accept: 'application/json' }
      }
    ));
  }

  
  getDayDetails(reference: string): Promise<Journee> {
    return firstValueFrom(this.httpClient.get<Journee>(
      `${this.MAIN_SERVER_BASE_PATH}/journees/${reference}`,
      {
        headers: { Accept: 'application/json' }
      }
    ));
  }

  calculateYearDateNo(date: Date): number {
    const startYearDate = new Date(`${date.getFullYear()}-01-01`);

    const noDay = (date.getTime() - startYearDate.getTime())
                / (24 * 3600 * 1000)
                + 1;
    
    return Math.round(+noDay.toFixed(0)); 
  }

  planDay(planDayData: PlanDayFormsData, distancesMatrix: number[][]): Promise<OptimizeDayResponse> {
    const data = {
      k: planDayData.nbTurns,
      matrix: distancesMatrix,
      start: 0
    }

    return firstValueFrom(this.httpClient.post<OptimizeDayResponse>(
      `${this.PLANNER_WS_BASE_PATH}/planner/planif`,
      {...data},
      {
        headers: { Accept: 'application/json' }
      }
    ));
  }

  groupCommandsByClientGeoLocation(commandes: Commande[]): ClientGroupBy[] {
    return commandes.reduce((acc, commande) => {
      const client = acc.find(x => 
        x.lat == commande.client.lat &&
        x.lng == commande.client.lng
      );

      if (client == undefined) this.addNewClient(acc, commande);
      if (client != undefined) this.addCommandeToClient(acc, commande);
      return acc;
    }, [] as ClientGroupBy[]);
  }

  addNewClient(clients: ClientGroupBy[], commande: Commande) {
    clients.push({
      lat: commande.client.lat,
      lng: commande.client.lng,
      commandes: [commande]
    })
  }

  addCommandeToClient(clients: ClientGroupBy[], commande: Commande) {
    const clientIndex = clients.findIndex(x => 
      x.lat == commande.client.lat &&
      x.lng == commande.client.lng
    )
    
    clients[clientIndex].commandes.push(commande); 
  }

}
