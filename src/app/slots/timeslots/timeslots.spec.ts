import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Timeslots } from './timeslots';

describe('Timeslots', () => {
  let component: Timeslots;
  let fixture: ComponentFixture<Timeslots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Timeslots]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Timeslots);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
