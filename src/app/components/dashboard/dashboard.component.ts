import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet, RouterModule,
    MatToolbarModule, MatListModule,
    MatSidenavModule, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  readonly sideBarLinks = [
    {link:"Journées", path:"/journees", img: "../assets/calendrier.png"},
    {link:"Commandes", path:"/commandes", img: "../assets/paquet.png"},
    {link:"Livraisons", path:"/livraisons", img: "../assets/livraison-rapide.png"},
    {link:"Tournées", path:"/tournees",img: "../assets/destination.png"},
  ];

  private readonly initialBreadCrumbsPath = [
    {title: "Journées", path: "/journees"}
  ];
  readonly breadCrumbsPath = signal(this.initialBreadCrumbsPath);

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router
  ) {}

  signOut() {
    this.localStorageService.clear();
    this.router.navigate(['/sign-in']);
  }
}
