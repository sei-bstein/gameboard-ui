import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSessionComponent } from './player-session.component';

describe('PlayerSessionComponent', () => {
  let component: PlayerSessionComponent;
  let fixture: ComponentFixture<PlayerSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerSessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
