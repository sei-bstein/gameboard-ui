// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamespaceQuizComponent } from './gamespace-quiz.component';

describe('GamespaceQuizComponent', () => {
  let component: GamespaceQuizComponent;
  let fixture: ComponentFixture<GamespaceQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GamespaceQuizComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GamespaceQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
