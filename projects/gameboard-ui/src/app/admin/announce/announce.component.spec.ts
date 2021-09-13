// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnounceComponent } from './announce.component';

describe('AnnounceComponent', () => {
  let component: AnnounceComponent;
  let fixture: ComponentFixture<AnnounceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnounceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnounceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
