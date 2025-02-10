import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesRequestDetailsComponent } from './services-request-details.component';

describe('ServicesRequestDetailsComponent', () => {
  let component: ServicesRequestDetailsComponent;
  let fixture: ComponentFixture<ServicesRequestDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesRequestDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesRequestDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
