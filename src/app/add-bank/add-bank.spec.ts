import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBank } from './add-bank';

describe('AddBank', () => {
  let component: AddBank;
  let fixture: ComponentFixture<AddBank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBank]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddBank);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
