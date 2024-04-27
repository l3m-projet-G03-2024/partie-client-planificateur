import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { FormatTurn } from '../utils/types/format-turn.type';
import { Tournee } from '../utils/types/tournee.type';
import { EtatDeTournee } from '../utils/enums/etat-de-tournee.enum';

@Injectable({
  providedIn: 'root'
})
export class TourneeService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;

  constructor(private httpClient: HttpClient) { }


  listTournees(params: { etat?: EtatDeTournee; reference?: string; }): Promise<Tournee[]> {
    return firstValueFrom(this.httpClient.get<Tournee[]>(
        `${this.MAIN_SERVER_BASE_PATH}/tournees/`,
        {
          headers: { Accept: 'application/json' },
          params
        }
      )
    ); 
  }

  
  createTournees(dayReference: string, turns: FormatTurn[]): Promise<Object> {
    const tournees = turns.map(turn => {
      const {livraisons, ...rest} = turn;
      return rest;
    });

    return firstValueFrom(this.httpClient.post(
      `${this.MAIN_SERVER_BASE_PATH}/tournees/`,
      {
        referenceJournee: dayReference,
        tournees,
      },
      {
        headers: { Accept: 'application/json' },
      }
    ));
  }
}
