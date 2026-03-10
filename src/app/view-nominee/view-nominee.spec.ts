import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNominee } from './view-nominee';

describe('ViewNominee', () => {
  let component: ViewNominee;
  let fixture: ComponentFixture<ViewNominee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewNominee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewNominee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
