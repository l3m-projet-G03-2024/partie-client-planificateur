import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom} from 'rxjs';
import { Camion } from '../utils/types/camion.type';

@Injectable({
  providedIn: 'root'
})
export class CamionService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;

  constructor(private httpClient: HttpClient) { }


  listCamions(nomEntrepot: string): Promise<Camion[]> {
    return firstValueFrom(this.httpClient.get<Camion[]>(
        `${this.MAIN_SERVER_BASE_PATH}/camions/`,
        {
          params: {
            nomEntrepot
          }
        }
      )
    ); 
  }

}
