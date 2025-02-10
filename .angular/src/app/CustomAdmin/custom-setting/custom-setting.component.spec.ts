import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSettingComponent } from './custom-setting.component';

describe('CustomSettingComponent', () => {
  let component: CustomSettingComponent;
  let fixture: ComponentFixture<CustomSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
