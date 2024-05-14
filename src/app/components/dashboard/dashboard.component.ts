import { Component, OnInit, signal } from '@angular/core';
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
export class DashboardComponent implements OnInit {

  readonly sideBarLinks = [
    {link:"Journées", path:"/dashboard/journees", img: "../assets/calendrier.png"},
  ];

  private readonly initialBreadCrumbsPath = [
    {title: "Journées", path: "/journees"}
  ];
  readonly breadCrumbsPath = signal(this.initialBreadCrumbsPath);

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

  signOut() {
    this.localStorageService.clear();
    this.router.navigate(['/sign-in']);
  }
}
