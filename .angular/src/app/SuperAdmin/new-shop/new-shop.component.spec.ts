import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewShopComponent } from './new-shop.component';

describe('NewShopComponent', () => {
  let component: NewShopComponent;
  let fixture: ComponentFixture<NewShopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewShopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewShopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
