import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBillComponent } from './custom-bill.component';

describe('CustomBillComponent', () => {
  let component: CustomBillComponent;
  let fixture: ComponentFixture<CustomBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomBillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
