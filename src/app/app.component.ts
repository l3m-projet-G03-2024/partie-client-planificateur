import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AuthService } from './services/auth.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterModule,
    MatToolbarModule, MatListModule,
    MatSidenavModule, MatIconModule, MatButtonModule,
    AngularFireAuthModule,
  ],
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private readonly authService: AuthService) {
  }
    
  signUp() {
    this.authService.signUp("devfullcoul@gmail.com", "123456");
  }

  login() {
    this.authService.signIn("devfullcoul@gmail.com", "123456");
  }

   async loginGoogle() {
    return await this.authService.loginGoogle();
  }
}

