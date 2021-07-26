// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'untag'
})
export class UntagPipe implements PipeTransform {

  transform(value: string | undefined, ...args: unknown[]): string {
    if (!value) { return ''; }
    return (value.split('#').shift() || value).trim();
  }

}
