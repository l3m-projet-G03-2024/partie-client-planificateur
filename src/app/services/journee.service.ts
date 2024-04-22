import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { Journee } from '../utils/types/journee.type';
import { CreateJournee } from '../utils/types/create-journee.type';
import { Commande } from '../utils/types/commande.type';
import { PlanDayReturnFormsData } from '../utils/types/plan-day-return-forms-data.type';
import { Client } from '../utils/types/client.type';

export type ClientGroupBy = Partial<Client> & {
  commandes: Commande[]
};

@Injectable({
  providedIn: 'root'
})
export class JourneeService {

  private readonly DOMAIN_NAME = environment.server_url;
  private readonly BASE_PATH = `${this.DOMAIN_NAME}/api/v1/journees`;

  constructor(private httpClient: HttpClient) { }

  createDay(date: Date): Promise<Journee> {
    const noDay = this.calculateYearDateNo(date);
    const reference = `j${("000" + noDay).slice(-3)}G`;
    
    return firstValueFrom(
      this.httpClient.post(
        `${this.BASE_PATH}`,
        {
          reference,
          date: date.toISOString()
        }
      )
    ) as Promise<Journee>;
  }

  listDays(): Promise<Journee[]> {
    return firstValueFrom(this.httpClient.get(
        `${this.BASE_PATH}`
      )
    ) as Promise<Journee[]>; 
  }

  deleteDay(reference: string): void {
    firstValueFrom(this.httpClient.delete(
      `${this.BASE_PATH}/${reference}`
    ));
  }

  calculateYearDateNo(date: Date): number {
    const startYearDate = new Date(`${date.getFullYear()}-01-01`);

    const noDay = (date.getTime() - startYearDate.getTime())
                / (24 * 3600 * 1000)
                + 1;
    
    return Math.round(+noDay.toFixed(0)); 
  }

  planDay(data: PlanDayReturnFormsData) {
    console.log(data);
  }

  groupByClientGeoLocation(commandes: Commande[]): ClientGroupBy[] {
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
