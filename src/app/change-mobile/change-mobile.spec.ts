import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMobile } from './change-mobile';

describe('ChangeMobile', () => {
  let component: ChangeMobile;
  let fixture: ComponentFixture<ChangeMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeMobile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
