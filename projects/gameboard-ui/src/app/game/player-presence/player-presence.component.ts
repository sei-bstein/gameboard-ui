// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { faCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subject } from 'rxjs';
import { delay, switchMap, tap } from 'rxjs/operators';
import { Player } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { Actor, HubState, NotificationService } from '../../utility/notification.service';

@Component({
  selector: 'app-player-presence',
  templateUrl: './player-presence.component.html',
  styleUrls: ['./player-presence.component.scss']
})
export class PlayerPresenceComponent implements OnInit, OnChanges {
  @Input() id = '';
  refresh$ = new Subject<string>();
  hub$: Observable<HubState>;
  team$: Observable<Player[]>;
  faDot = faCircle;
  faStar = faStar;

  constructor(
    private api: PlayerService,
    private hub: NotificationService
  ) {
    this.hub$ = hub.state$;

    this.team$ = this.refresh$.pipe(
      switchMap(tid => api.list({tid})),
      delay(2000),
      tap(list => hub.initActors(list as unknown as Actor[]))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.id) {
    this.refresh$.next(changes.id.currentValue);
    }
  }

  ngOnInit(): void {
    // this.refresh$.next(this.id);
  }

  ngAfterViewInit(): void {
    this.refresh$.next(this.id);
  }
}
