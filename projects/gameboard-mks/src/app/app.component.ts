// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsoleRequest } from './api.models';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'gameboard-mks';
  context: Observable<ConsoleRequest>;
  errorMsg = '';

  constructor(
    route: ActivatedRoute,
    // api: ApiService
  ) {
    this.context = route.queryParams.pipe(
      debounceTime(500),
      map(p => ({
        name: p.v,
        sessionId: p.s,
        token: p.t,
        fullbleed: p.f,
        observer: p.o
      }))
      // switchMap(p => api.redeem(p.token).pipe(
      //   catchError(err => of(p)),
      //   map(r => p)
      // ))
    );
  }

}
