// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faBolt, faTrash, faTv } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, combineLatest, interval, Observable, of, scheduled, Subject, timer } from 'rxjs';
import { catchError, combineAll, filter, map, mergeAll, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { BoardPlayer, BoardSpec, Challenge, NewChallenge, VmState } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { ApiUser } from '../../api/user-models';
import { ConfigService } from '../../utility/config.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-gameboard-page',
  templateUrl: './gameboard-page.component.html',
  styleUrls: ['./gameboard-page.component.scss']
})
export class GameboardPageComponent implements OnInit, AfterViewInit {
  // @ViewChild('mapbox') mapboxRef!: ElementRef;
  // @ViewChild('callout') calloutRef!: ElementRef;
  // mapbox!: HTMLDivElement;
  // callout!: HTMLDivElement;
  ctx$: Observable<BoardPlayer>;
  ctx!: BoardPlayer;
  hoveredItem: BoardSpec | null = null;
  selected!: BoardSpec;
  selecting$ = new Subject<BoardSpec>();
  launching$ = new Subject<BoardSpec>();
  gameOver$ = new Subject<boolean>();
  specs$: Observable<BoardSpec>;
  etd$!: Observable<number>;
  errors: any[] = [];
  faTv = faTv;
  faTrash = faTrash;
  faBolt = faBolt;
  faArrowLeft = faArrowLeft;
  deploying = false;
  variant = 0;
  user$: Observable<ApiUser | null>;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private api: BoardService,
    private renderer: Renderer2,
    private config: ConfigService,
    usersvc: UserService
  ) {

    this.user$ = usersvc.user$;

    // pull data
    this.ctx$ = combineLatest([
      route.params.pipe(
        switchMap(p => api.load(p.id).pipe(
          catchError(err => of({} as BoardPlayer))
        ))
      ),
      interval(1000).pipe(
        takeUntil(this.gameOver$)
      )
    ]).pipe(
        map(([b, i]) => api.setTimeWindow(b)),
        tap(b => this.ctx = b),
        tap(b => {if (b.session.isAfter) {this.gameOver$.next(true); }})
    );

    const launched$ = this.launching$.pipe(
      switchMap(s => api.launch({playerId: this.ctx.id, specId: s.id, variant: this.variant})),
      catchError(err => {
        this.errors.push(err);
        return of(null as unknown as Challenge)
      }),
      filter(c => !!c),
      map(c => this.syncOne(c))
    );

    const selected$ = this.selecting$.pipe(
      switchMap(s => !!s.instance && !!s.instance.state
        ? of(s)
        : (!!s.instance
          ? api.retrieve(s.instance.id)
          : api.preview({playerId: this.ctx.id, specId: s.id} as NewChallenge)
          ).pipe(
            catchError(err => {
              this.errors.push(err);
              return of(null as unknown as Challenge)
            }),
            filter(c => !!c),
            map(c => this.syncOne({...c, specId: s.id }))
          )
      )
    );

    // main feed
    this.specs$ = scheduled(
      [ selected$, launched$],
      asyncScheduler).pipe(
      mergeAll(),
      // tap(a => console.log(a))
    );

  }

  validate(b: BoardPlayer): void {
    if (!b.game) {
      console.log(b);
      this.router.navigateByUrl('/');
    } else {
      this.ctx = b;
    }

  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // this.mapbox = this.mapboxRef.nativeElement as HTMLDivElement;
    // this.callout = this.calloutRef.nativeElement as HTMLDivElement;
  }

  syncOne = (c: Challenge): BoardSpec => {
    this.deploying = false;
    const s = this.ctx.game.specs.find(i => i.id === c.specId);
    if (!!s) {
      s.instance = c;
      this.api.setColor(s);
    }
    return s || {} as BoardSpec;
  }

  select(spec: BoardSpec): void {
    if (!spec.disabled) {
      this.selecting$.next(spec);
    }
  }

  launch(spec: BoardSpec): void {
    this.deploying = true;
    this.etd$ = timer(0, 1000).pipe(
      map(i => spec.averageDeploySeconds - i)
    );
    this.launching$.next(spec);
  }

  stop(model: BoardSpec): void {
    // stop gamespace
    this.deploying = true;
    if (!model.instance) { return; }
    this.api.stop(model.instance).subscribe(
      c => this.syncOne(c)
    );
  }

  start(model: BoardSpec): void {
    // start gamespace
    this.deploying = true;
    if (!model.instance) { return; }
    this.api.start(model.instance).subscribe(
      c => this.syncOne(c)
    );
  }

  console(vm: VmState): void {
    this.config.openConsole(`?f=1&s=${vm.isolationId}&v=${vm.name}`)
  }

  mouseenter(e: MouseEvent, spec: BoardSpec) {
    this.hoveredItem = spec;
    spec.c = 'purple';

      // const middle = this.mapbox.clientWidth / 2;
      // const centerr = spec.r * this.mapbox.clientWidth;
      // const centerx = spec.x * this.mapbox.clientWidth + centerr;
      // const centery = spec.y * this.mapbox.clientHeight + centerr;
      // const deltaX = middle - centerx;
      // const deltaY = middle - centery;
      // const vectorX = deltaX / Math.abs(deltaX);
      // const vectorY = deltaY / Math.abs(deltaY);
      // let left=0, top=0, right=0, bottom=0;
      // if (vectorX > 0) {
      //   left = centerx + centerr;
      //   if (vectorY > 0) {
      //     top = centery + centerr;
      //   } else {
      //     bottom = middle*2 - centery + (2* centerr);
      //   }
      // } else {
      //   right = middle*2 - centerx + (2*centerr);
      //   if (vectorY > 0) {
      //     top = centery + centerr;
      //   } else {
      //     bottom = middle*2 - centery + (2* centerr);
      //   }
      // }

      // // console.log(`delta: ${deltaX}x${deltaY} r: ${centerr}`);

      // if (!!left) {
      //   this.renderer.setStyle(this.callout, 'left', left+'px');
      // } else {
      //   this.renderer.removeStyle(this.callout, 'left');
      // }
      // if (!!top) {
      //   this.renderer.setStyle(this.callout, 'top', top+'px');
      // } else {
      //   this.renderer.removeStyle(this.callout, 'top');
      // }
      // if (!!right) {
      //   this.renderer.setStyle(this.callout, 'right', right+'px');
      // } else {
      //   this.renderer.removeStyle(this.callout, 'right');
      // }
      // if (!!bottom) {
      //   this.renderer.setStyle(this.callout, 'bottom', bottom+'px');
      // } else {
      //   this.renderer.removeStyle(this.callout, 'bottom');
      // }

      // console.log(`middle: ${middle} pos: ${top} ${right} ${bottom} ${left}`);

  }
  mouseleave(e: MouseEvent, spec: BoardSpec) {
    this.hoveredItem = null;
    this.api.setColor(spec);
  }

  mousedown(e:MouseEvent, spec: BoardSpec) {
    this.select(spec);
  }
}