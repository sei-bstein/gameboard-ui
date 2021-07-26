// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CountdownPipe } from './countdown.pipe';

describe('CountdownPipe', () => {
  it('create an instance', () => {
    const pipe = new CountdownPipe();
    expect(pipe).toBeTruthy();
  });
});
