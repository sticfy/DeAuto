import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesRequestComponent } from './services-request.component';

describe('ServicesRequestComponent', () => {
  let component: ServicesRequestComponent;
  let fixture: ComponentFixture<ServicesRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
