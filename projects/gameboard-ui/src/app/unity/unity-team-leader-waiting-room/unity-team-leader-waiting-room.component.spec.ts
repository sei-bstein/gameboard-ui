import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnityTeamLeaderWaitingRoomComponent } from './unity-team-leader-waiting-room.component';

describe('UnityTeamLeaderWaitingRoomComponent', () => {
  let component: UnityTeamLeaderWaitingRoomComponent;
  let fixture: ComponentFixture<UnityTeamLeaderWaitingRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnityTeamLeaderWaitingRoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnityTeamLeaderWaitingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
