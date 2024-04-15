import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './presentation.component.html',
  styleUrl: './presentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresentationComponent { }
