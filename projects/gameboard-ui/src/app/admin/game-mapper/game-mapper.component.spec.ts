// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMapperComponent } from './game-mapper.component';

describe('GameMapperComponent', () => {
  let component: GameMapperComponent;
  let fixture: ComponentFixture<GameMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameMapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
