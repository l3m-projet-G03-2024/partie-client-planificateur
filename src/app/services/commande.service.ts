import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { Commande } from '../utils/types/commande.type';
import { EtatDeCommande } from '../utils/enums/etat-de-commande.enum';
import { FormatTurn } from '../utils/types/format-turn.type';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;

  constructor(private httpClient: HttpClient) { }


  listCommandes(etat: EtatDeCommande): Promise<Commande[]> {
    return firstValueFrom(this.httpClient.get<Commande[]>(
        `${this.MAIN_SERVER_BASE_PATH}/commandes/`,
        {
          headers: { Accept: 'application/json' },
          params: {
            etat: etat,
          }
        }
      )
    ); 
  }

  
  getCommandeDetails(reference: string): Promise<Commande> {
    return firstValueFrom(this.httpClient.get<Commande>(
      `${this.MAIN_SERVER_BASE_PATH}/commandes/${reference}`,
      {
        headers: { Accept: 'application/json' }
      }
    ));
  }

  updateCommandes(turns: FormatTurn[]): Promise<Object> {
    const commandes = turns.flatMap(turn => 
      turn.livraisons.flatMap(livraison => 
        livraison.commandes!.map(commande => ({
          reference: commande.reference,
          etat: commande.etat,
          referenceLivraison: livraison.reference
        }))
      )
    );

    return firstValueFrom(this.httpClient.patch(
      `${this.MAIN_SERVER_BASE_PATH}/commandes/`,
      {
        commandes
      },
      {
        headers: { Accept: 'application/json' },
      }
    ));
  }
}
