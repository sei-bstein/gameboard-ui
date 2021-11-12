// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrereqsComponent } from './prereqs.component';

describe('PrereqsComponent', () => {
  let component: PrereqsComponent;
  let fixture: ComponentFixture<PrereqsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrereqsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrereqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
