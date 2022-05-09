// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeObserverComponent } from './challenge-observer.component';

describe('ChallengeObserverComponent', () => {
  let component: ChallengeObserverComponent;
  let fixture: ComponentFixture<ChallengeObserverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengeObserverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeObserverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
