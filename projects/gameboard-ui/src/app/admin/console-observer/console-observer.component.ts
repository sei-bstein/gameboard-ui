// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faArrowLeft, faSyncAlt, faTv } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, timer, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, tap, switchMap } from 'rxjs/operators';
import { ConsoleActor } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { ConfigService } from '../../utility/config.service';

@Component({
  selector: 'app-console-observer',
  templateUrl: './console-observer.component.html',
  styleUrls: ['./console-observer.component.scss']
})
export class ConsoleObserverComponent implements OnInit {
  refresh$ = new BehaviorSubject<boolean>(true);
  fetch$: Observable<ConsoleActor[]>;
  gid = '';
  faArrowLeft = faArrowLeft;
  faTv = faTv;
  faSync = faSyncAlt;

  constructor(
    route: ActivatedRoute,
    private api: BoardService,
    private conf: ConfigService
  ) {
    this.fetch$ = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 60000)
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.gid = a.id),
      switchMap(() => this.api.actormap(this.gid)),
    );

  }

  ngOnInit(): void {
  }

  trackById(index: number, model: ConsoleActor): string {
    return model.userId;
  }

  go(p: ConsoleActor): void {
    this.conf.openConsole(`?f=0&o=1&s=${p.challengeId}&v=${p.vmName}`);
  }
}
