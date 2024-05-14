import { Component, Input } from '@angular/core';
import { Livraison } from '../../../utils/types/livraison.type';
import { EtatDeLivraison } from '../../../utils/enums/etat-de-livraison.enum';
import { EtatDeTournee } from '../../../utils/enums/etat-de-tournee.enum';
import { EtatDetails } from '../../../utils/shared/etat-details.shared';
import { EtatDetails as EtatDetailsType } from '../../../utils/types/etat-details.type';


@Component({
  selector: 'app-livraison',
  standalone: true,
  imports: [],
  templateUrl: './livraison.component.html',
  styleUrl: './livraison.component.scss'
})
export class LivraisonComponent {
  
  @Input({required: true}) livraison!: Livraison;

  defineEtat(etat: EtatDeTournee | EtatDeLivraison): Partial<EtatDetailsType> {
    if (etat) {
      const etatDetails = EtatDetails.find(x => x.etat == etat.toString());
      return {
        label: etatDetails!.label,
        color: etatDetails!.color
      }
    } else {
      return {}
    }
  }

}
