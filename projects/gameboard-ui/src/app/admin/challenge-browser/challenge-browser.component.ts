// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { faArrowLeft, faEllipsisV, faInfoCircle, faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
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
  search: Search = { term: '', take: 100};
  selected!: ChallengeSummary;
  // audited$: Observable<any>;
  // auditing$ = new Subject<ChallengeSummary>();
  selectedAudit!: any;
  errors: any[] = [];

  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faDetail = faEllipsisV;
  faInfo = faInfoCircle;
  faSync = faSyncAlt;

  constructor(
    private api: BoardService
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

    // this.audited$ = this.auditing$.pipe(
    //   debounceTime(500),
    //   distinctUntilChanged(),
    //   switchMap(c => api.audit(c.id)),
    //   tap(r => this.selectedAudit = r)
    // );

  }

  ngOnInit(): void {
  }

  select(c: ChallengeSummary): void {
    this.selected = c;
    this.selectedAudit = [];
    // todo: fetch challenge events / submissions
  }

  audit(c: ChallengeSummary): void {
    this.api.audit(c.id).subscribe(
      r => this.selectedAudit = r,
      (err) => this.errors.push(err)
    );
  }

  regrade(c: ChallengeSummary): void {
    this.api.regrade(c.id).subscribe(
      r => this.selectedAudit = r,
      (err) => this.errors.push(err)
    );
  }

  trackById(index: number, model: ChallengeSummary): string {
    return model.id;
  }
}
