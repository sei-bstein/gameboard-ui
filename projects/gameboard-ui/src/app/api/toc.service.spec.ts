// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { TocService } from './toc.service';

describe('TocService', () => {
  let service: TocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
