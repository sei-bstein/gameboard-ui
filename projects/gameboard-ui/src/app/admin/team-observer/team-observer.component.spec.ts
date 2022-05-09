import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamObserverComponent } from './team-observer.component';

describe('TeamObserverComponent', () => {
  let component: TeamObserverComponent;
  let fixture: ComponentFixture<TeamObserverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamObserverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
