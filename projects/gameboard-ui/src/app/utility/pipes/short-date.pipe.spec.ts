// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ShortDatePipe } from './short-date.pipe';

describe('ShortDatePipe', () => {
  it('create an instance', () => {
    const pipe = new ShortDatePipe();
    expect(pipe).toBeTruthy();
  });
});
