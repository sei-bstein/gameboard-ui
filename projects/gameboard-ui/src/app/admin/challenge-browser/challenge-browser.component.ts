// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faEllipsisV, faSearch } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, filter, switchMap, tap } from 'rxjs/operators';
import { Challenge, ChallengeSummary } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { Search } from '../../api/models';

@Component({
  selector: 'app-challenge-browser',
  templateUrl: './challenge-browser.component.html',
  styleUrls: ['./challenge-browser.component.scss']
})
export class ChallengeBrowserComponent implements OnInit {
  refresh$ = new BehaviorSubject<boolean>(true);
  source$: Observable<ChallengeSummary[]>;
  source: ChallengeSummary[] = [];
  search: Search = { term: '', take: 50};

  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faDetail = faEllipsisV;

  constructor(
    api: BoardService
  ) {
    this.source$ = merge(
      this.refresh$,
      interval(60000).pipe(
        filter(i => !this.search.term)
      )
    ).pipe(
      debounceTime(500),
      switchMap(() => api.list(this.search)),
      tap(r => this.source = r)
    );
  }

  ngOnInit(): void {
  }

  select(c: ChallengeSummary): void {
    // todo: fetch challenge events / submissions
  }

  trackById(index: number, model: ChallengeSummary): string {
    return model.id;
  }
}
