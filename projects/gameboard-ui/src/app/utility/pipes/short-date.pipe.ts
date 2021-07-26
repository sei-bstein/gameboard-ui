// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'shortdate'})
export class ShortDatePipe implements PipeTransform {
    transform(date: any): string {
        const t = new Date(date);
        return t.toLocaleDateString();
        // return t.toLocaleString('en-us', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'});
    }
}
