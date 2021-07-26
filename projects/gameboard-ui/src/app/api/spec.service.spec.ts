// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { SpecService } from './spec.service';

describe('SpecsService', () => {
  let service: SpecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
