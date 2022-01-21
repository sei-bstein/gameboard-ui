// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faExternalLinkAlt, faExternalLinkSquareAlt, faListOl } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, combineLatest, Observable, of, scheduled, timer } from 'rxjs';
import { filter, map, switchMap, tap, zipAll } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { Player, Standing } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser } from '../../api/user-models';
import { UserService as LocalUserService } from '../../utility/user.service';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements OnInit {
  ctx$: Observable<{ user: ApiUser; game: Game; player: Player; }>;
  faLink = faExternalLinkAlt;
  faList = faListOl;

  constructor(
    router: Router,
    route: ActivatedRoute,
    apiGame: GameService,
    apiPlayer: PlayerService,
    local: LocalUserService
  ) {
    const user$ = local.user$.pipe(
      map(u => !!u ? u : {} as ApiUser)
    );

    const game$ = route.params.pipe(
      filter(p => !!p.id),
      switchMap(p => apiGame.retrieve(p.id))
    );

    const player$ = scheduled([
      route.params,
      local.user$
    ], asyncScheduler).pipe(
      zipAll(),
      map(([p,u]) => ({ gid: p?.id, uid: u?.id })),
      switchMap(z => apiPlayer.list(z).pipe(
        map(p => p.length ? p[0] : {userId: z.uid} as Player)
      ))
    );

    this.ctx$ = combineLatest([ user$, game$, player$]).pipe(
      map(([user, game, player]) => ({user, game, player})),
      // tap(c => console.log(c)),
      tap(c => {
        if (!c.game) { router.navigateByUrl("/"); }
      }),
      filter(c => !!c.game)
    );

  }

  ngOnInit(): void {
  }

}
