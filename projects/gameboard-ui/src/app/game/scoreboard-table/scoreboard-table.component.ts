import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { BehaviorSubject, combineLatest, interval, merge, Observable, Subject, timer } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { PlayerSearch, Standing, TimeWindow } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';

@Component({
  selector: 'app-scoreboard-table',
  templateUrl: './scoreboard-table.component.html',
  styleUrls: ['./scoreboard-table.component.scss']
})
export class ScoreboardTableComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() id = '';
  @Input() live = false;

  refresh$ = new Subject<PlayerSearch>();
  scores$: Observable<Standing[]>;
  scores: Standing[] = [];

  constructor(
    api: PlayerService
  ) {
    const fetch$ = combineLatest([
      this.refresh$.pipe(debounceTime(500)),
      timer(2000, 60000)
    ]).pipe(
      map(([s, i]) => s),
      switchMap(s => api.scores(s)),
      tap(r => this.scores = r)
    );

    const update$ = interval(1000).pipe(
      map(() => this.scores)
    );

    this.scores$ = merge(
      fetch$,
      update$
    ).pipe(
      tap(r => r.forEach(s => s.session = new TimeWindow(s.sessionBegin, s.sessionEnd)))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.id) {
      this.refresh$.next({gid: changes.id.currentValue});
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // timer(0).subscribe(() =>
      this.refresh$.next({gid: this.id});
    // );
  }

  trackById(index: number, s: Standing): string {
    return s.teamId;
  }
}
