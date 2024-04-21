import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [],
  providers: [AuthService],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {

  constructor(
    private readonly authService: AuthService,
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const localStorageAccessToken = this.localStorageService.getItem("accessToken");
    
    if (localStorageAccessToken) {
      this.router.navigate(['/','dashboard']);
    } 
  }

  async signIn(email: string, password: string): Promise<void> {
    const accessToken = await this.authService.signIn(email, password);
    
    this.localStorageService.setItem("accessToken", accessToken);
    this.router.navigate(['/','dashboard']);
  }


}