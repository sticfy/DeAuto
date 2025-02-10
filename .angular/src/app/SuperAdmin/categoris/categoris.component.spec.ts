import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorisComponent } from './categoris.component';

describe('CategorisComponent', () => {
  let component: CategorisComponent;
  let fixture: ComponentFixture<CategorisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategorisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
