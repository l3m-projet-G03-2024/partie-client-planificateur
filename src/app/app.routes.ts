import { Routes } from '@angular/router';
import { JourneesComponent } from './components/journees/journees.component';
import { CommandesComponent } from './components/commandes/commandes.component';
import { LivraisonsComponent } from './components/livraisons/livraisons.component';
import { TourneesComponent } from './components/tournees/tournees.component';
import { DetailsJourneeComponent } from './components/journees/details-journee/details-journee.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full'},
    { path: 'sign-in', title: "Connexion", component: SignInComponent },
    { 
        path: 'dashboard',
        title: "Planificateur", 
        component: DashboardComponent,
        children: [
            { path: '', redirectTo: 'journees', pathMatch: 'full' },
            { path: 'journees', title: "Journées de l'entrepôt", component: JourneesComponent},
            { path: 'journees/details/:referenceJournee', title: "Details", component: DetailsJourneeComponent},
            { path: 'commandes', title: "Commandes des clients", component: CommandesComponent},
            { path: 'livraisons', title: "Livraisons", component: LivraisonsComponent},
            { path: 'tournees', title: "Tournées", component: TourneesComponent},
        ]
    },
    {path: '**', redirectTo: '/dashboard'}
];
