import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom, map } from 'rxjs';
import { Tournee } from '../utils/types/tournee.type';
import { Entrepot } from '../utils/types/entrepot-type';

@Injectable({
  providedIn: 'root'
})
export class EntrepotService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;

  constructor(private httpClient: HttpClient) { }


  listEntrepots(): Promise<Entrepot[]> {
    return firstValueFrom(this.httpClient.get<Entrepot[]>(
        `${this.MAIN_SERVER_BASE_PATH}/entrepots/`,
        {
          headers: { Accept: 'application/json' },
        }
      )
    ); 
  }

}
