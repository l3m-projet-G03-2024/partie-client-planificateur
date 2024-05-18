import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { firstValueFrom} from 'rxjs';
import { Employe } from '../utils/types/employe.type';
import { Emploi } from '../utils/enums/emploi.enum';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  private readonly MAIN_SERVER_BASE_PATH = `${environment.mainServer}/api/v1`;
  constructor(private httpClient: HttpClient) { }


  listEmployes(emploi: Emploi, nomEntrepot: string): Promise<Employe[]> {
    return firstValueFrom(this.httpClient.get<Employe[]>(
        `${this.MAIN_SERVER_BASE_PATH}/employes/`,
        {
          params: {
            emploi,
            nomEntrepot
          }
        }
      )
    ); 
  }

  getEmploye(emailEmploye: string): Promise<Employe> {
    return firstValueFrom(this.httpClient.get<Employe>(
        `${this.MAIN_SERVER_BASE_PATH}/employes/${emailEmploye}/`
      )
    ); 
  }

}
