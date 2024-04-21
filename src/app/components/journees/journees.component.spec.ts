import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneesComponent } from './journees.component';

describe('JourneesComponent', () => {
  let component: JourneesComponent;
  let fixture: ComponentFixture<JourneesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JourneesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JourneesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
