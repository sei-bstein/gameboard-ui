// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AgedDatePipe } from './aged-date.pipe';

describe('AgedDatePipe', () => {
  it('create an instance', () => {
    const pipe = new AgedDatePipe();
    expect(pipe).toBeTruthy();
  });
});
