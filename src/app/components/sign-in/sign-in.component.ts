import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';
import { EmployeService } from '../../services/employe.service';
import { Emploi } from '../../utils/enums/emploi.enum';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [HttpClientModule],
  providers: [AuthService, EmployeService],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  error: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router,
    private readonly employeService: EmployeService
  ) {}

  async signIn(email: string, password: string): Promise<void> {
    try {
      const accessToken = await this.authService.signIn(email, password);
      this.localStorageService.setItem("accessToken", accessToken);
    } catch (error) {
      this.error = "Verifiez vos identifiants de connexion";
      console.log(error);
    }
    
    const employe = await this.employeService.getEmploye(email);
      
    if (employe.emploi == Emploi.PLANIFICATEUR) {
      this.router.navigate(['/','dashboard']);
    }
    this.error = "Vous n'êtes pas autoriser à accéder à cette application";
  }


}
