import { Routes } from '@angular/router';
import { JourneesComponent } from './components/journees/journees.component';
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
        ]
    },
    {path: '**', redirectTo: '/sign-in'}
];
