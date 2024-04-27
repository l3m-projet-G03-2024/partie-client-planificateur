import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { FormatTurn } from '../utils/types/format-turn.type';

@Injectable({
  providedIn: 'root'
})
export class LivraisonService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;

  constructor(private httpClient: HttpClient) { }

  
  createLivraisons(turns: FormatTurn[]): Promise<Object> {
    const deliveries = turns.flatMap(turn => {
      return turn.livraisons.map(livraison => ({
        reference: livraison.reference,
        etat: livraison.etat,
        ordre: livraison.ordre,
        referenceTournee: turn.reference
      }))
    });
    

    return firstValueFrom(this.httpClient.post(
      `${this.MAIN_SERVER_BASE_PATH}/livraisons/`,
      {
        livraisons: deliveries
      },
      {
        headers: { Accept: 'application/json' },
      }
    ));
  }
  
}
