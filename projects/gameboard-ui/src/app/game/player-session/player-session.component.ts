// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faBolt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameContext } from '../../api/models';
import { Player, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser } from '../../api/user-models';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent implements OnInit {
  @Input() ctx!: GameContext;
  errors: any[] = [];
  ctx$: Observable<GameContext>;
  faBolt = faBolt;
  faTrash = faTrash;

  constructor(
    private api: PlayerService
  ) {
    this.ctx$ = timer(0, 1000).pipe(
      map(i => this.ctx),
      tap(ctx => {
        ctx.player.session = new TimeWindow(ctx.player.sessionBegin, ctx.player.sessionEnd);
        ctx.game.session = new TimeWindow(ctx.game.gameStart, ctx.game.gameEnd);
      })
    );
  }

  ngOnInit(): void {
  }

  start(p: Player): void {
    const sub: Subscription = this.api.start(p).pipe(
      tap(p => p.session = new TimeWindow(p.sessionBegin, p.sessionEnd)),
      finalize(() => sub.unsubscribe())
    ).subscribe(
      p => this.ctx.player = p,
      err => this.errors.push(err)
    );
  }

  reset(p: Player): void {
    this.api.delete(p.id).subscribe(() =>
      window.location.reload()
    );
  }
}
