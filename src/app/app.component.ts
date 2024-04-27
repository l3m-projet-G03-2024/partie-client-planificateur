import { Component, OnInit, } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { LocalStorageService } from './services/local-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterModule,
    AngularFireAuthModule,
  ],
  providers: [LocalStorageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const localStorageAccessToken = this.localStorageService.getItem("accessToken");
    
    if (!localStorageAccessToken) {
      this.router.navigate(['/','sign-in']);
    } 
  }
}

