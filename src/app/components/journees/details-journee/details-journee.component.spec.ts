import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsJourneeComponent } from './details-journee.component';

describe('DetailsJourneeComponent', () => {
  let component: DetailsJourneeComponent;
  let fixture: ComponentFixture<DetailsJourneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsJourneeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailsJourneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
