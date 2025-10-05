import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSlots } from './user-slots';

describe('UserSlots', () => {
  let component: UserSlots;
  let fixture: ComponentFixture<UserSlots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSlots]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSlots);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
