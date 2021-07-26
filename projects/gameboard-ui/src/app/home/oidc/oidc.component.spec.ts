// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OidcComponent } from './oidc.component';

describe('OidcComponent', () => {
  let component: OidcComponent;
  let fixture: ComponentFixture<OidcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OidcComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OidcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
