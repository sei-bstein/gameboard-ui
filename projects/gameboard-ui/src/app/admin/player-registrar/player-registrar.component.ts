// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faTrash, faList, faSearch, faFilter, faCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, BehaviorSubject, combineLatest, interval, merge, Observable, scheduled, Subscription, timer } from 'rxjs';
import { debounceTime, finalize, map, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { Player, PlayerSearch, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';
import { ApiUser, UserRole } from '../../api/user-models';
import { UserService } from '../../api/user.service';

@Component({
  selector: 'app-player-registrar',
  templateUrl: './player-registrar.component.html',
  styleUrls: ['./player-registrar.component.scss']
})
export class PlayerRegistrarComponent implements OnInit {
  refresh$ = new BehaviorSubject<boolean>(true);
  source$: Observable<Player[]>;
  source: Player[] = [];
  selected: Player[] = [];
  viewed: Player | undefined = undefined;
  viewChange$ = new BehaviorSubject<Player | undefined>(this.viewed);
  search: PlayerSearch = { term: '', take: 100};
  filter = '';
  scope = '';
  scopes: string[] = [];

  faTrash = faTrash;
  faList = faList;
  faSearch = faSearch;
  faFilter = faFilter;
  faCheck = faCheck;
  faArrowLeft = faArrowLeft;

  constructor(
    route: ActivatedRoute,
    private api: PlayerService,
  ) {
    this.source$ = combineLatest([
      route.params,
      this.refresh$,
      timer(0, 60000)
    ]).pipe(
      debounceTime(500),
      tap(([a, b, c]) => this.search.gid = a.id),
      switchMap(() => this.api.list(this.search)),
      tap(r => this.source = r),
      tap(() => this.review()),
    );

    const sub: Subscription = timer(0, 1000).pipe(
      finalize(() => sub.unsubscribe())
    ).subscribe(() => {
      this.source.forEach(p => {
        p.session = new TimeWindow(p.sessionBegin, p.sessionEnd);
      });
    });

  }

  ngOnInit(): void {
  }

  toggleFilter(role: string): void {
    this.filter = this.filter !== role ? role : '';
    this.search.filter = [this.filter];
    this.refresh$.next(true);
  }

  toggleScope(scope: string): void {
    this.scope = this.scope !== scope ? scope : '';
    this.refresh$.next(true);
  }

  view(u: Player): void {
    this.viewed = this.viewed !== u ? u : undefined;
    this.viewChange$.next(this.viewed);
  }

  review(): void {
    this.viewed = this.source.find(g => g.id === this.viewed?.id);
  }

  delete(model: Player): void {
    this.api.delete(model.id).subscribe(() => {
      const found = this.source.find(f => f.id === model.id);
      if (found) {
        this.source.splice(
          this.source.indexOf(found),
          1
        );
      }
    });

  }

  update(model: Player): void {
    this.api.update(model).subscribe();
  }

  approveName(model: Player): void {
    model.approvedName = model.name;
    this.update(model);
  }

  trackById(index: number, model: Player): string {
    return model.id;
  }
}