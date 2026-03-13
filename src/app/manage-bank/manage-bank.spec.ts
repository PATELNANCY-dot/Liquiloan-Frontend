import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBank } from './manage-bank';

describe('ManageBank', () => {
  let component: ManageBank;
  let fixture: ComponentFixture<ManageBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBank);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
