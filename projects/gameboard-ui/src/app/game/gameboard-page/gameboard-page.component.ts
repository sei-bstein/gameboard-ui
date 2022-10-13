// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { faArrowLeft, faBolt, faExclamationTriangle, faTrash, faTv } from '@fortawesome/free-solid-svg-icons';
import { asyncScheduler, combineLatest, interval, merge, Observable, of, scheduled, Subject, Subscription, timer } from 'rxjs';
import { catchError, combineAll, concatMap, debounceTime, filter, map, mergeAll, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { BoardPlayer, BoardSpec, Challenge, GameStarterData, NewChallenge, VmState } from '../../api/board-models';
import { BoardService } from '../../api/board.service';
import { ApiUser } from '../../api/user-models';
import { ConfigService } from '../../utility/config.service';
import { HubState, NotificationService } from '../../utility/notification.service';
import { UserService } from '../../utility/user.service';

@Component({
  selector: 'app-gameboard-page',
  templateUrl: './gameboard-page.component.html',
  styleUrls: ['./gameboard-page.component.scss']
})
export class GameboardPageComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('mapbox') mapboxRef!: ElementRef;
  // @ViewChild('callout') calloutRef!: ElementRef;
  // mapbox!: HTMLDivElement;
  // callout!: HTMLDivElement;
  refresh$ = new Subject<string>();
  ctx$: Observable<BoardPlayer>;
  ctx!: BoardPlayer;
  hoveredItem: BoardSpec | null = null;
  selected!: BoardSpec;
  selecting$ = new Subject<BoardSpec>();
  launching$ = new Subject<BoardSpec>();
  gameOver$ = new Subject<boolean>();
  specs$: Observable<BoardSpec>;
  //#region GAMEBRAIN VARIABLES
  // Game Link
  unityGameLink!: string;
  unityGameLinkSubject$ = new Subject<string[]>();
  unityGameLink$: Observable<GameStarterData>;
  origS: string[] = [];
  // Initial info structure
  /*
  unityGameInfo!: GameStarterData;
  unityGameInfoSubject$ = new Subject<GameStarterData>();
  unityGameInfo$: Observable<GameStarterData>;
  */
  //#endregion
  etd$!: Observable<number>;
  errors: any[] = [];
  faTv = faTv;
  faTrash = faTrash;
  faBolt = faBolt;
  faExclamationTriangle = faExclamationTriangle;
  faArrowLeft = faArrowLeft;
  deploying = false;
  variant = 0;
  user$: Observable<ApiUser | null>;
  hubstate$: Observable<HubState>;
  hubsub: Subscription;

  // TODO: Retrieve/set the link to the Unity instance
  unityLink = this.config.unityclienthost;
  unityClientLink: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.unityLink);

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private api: BoardService,
    private renderer: Renderer2,
    private config: ConfigService,
    private hub: NotificationService,
    usersvc: UserService,
    private sanitizer: DomSanitizer
  ) {

    this.user$ = usersvc.user$;

    this.hubstate$ = hub.state$;

    this.hubsub = hub.challengeEvents.subscribe(ev => this.syncOne(ev.model as Challenge));

    const fetch$ = merge(
      route.params.pipe(map(p => p.id)),
      this.refresh$
    ).pipe(
      filter(id => !!id),
      debounceTime(100),
      switchMap(id => api.load(id).pipe(
        catchError(err => of({} as BoardPlayer))
      )),
      tap(b => this.startHub(b)),
      tap(b => this.reselect())
    );

    // pull data
    this.ctx$ = combineLatest([
      fetch$,
      interval(1000).pipe(
        takeUntil(this.gameOver$)
      )
    ]).pipe(
        map(([b, i]) => api.setTimeWindow(b)),
        tap(b => this.ctx = b),
        tap(b => {if (b.session.isAfter) {this.gameOver$.next(true); }}),
        // After context is established, if this is a Unity game and we don't have a link yet, try to get one
        tap(b => {
          if (b.game.mode == 'unity') {
            window.localStorage.setItem("oidcLink", `oidc.user:${config.settings.oidc.authority}:${config.settings.oidc.client_id}`);
            if (this.unityGameLink == null && window.localStorage.getItem("oidcLink") != null && window.localStorage.getItem(`oidc.user:${config.settings.oidc.authority}:${config.settings.oidc.client_id}`) != null) {
              this.unityGameLinkSubject$.next([b.teamId, b.gameId]);
            }
          }
        })
    );

    const launched$ = this.launching$.pipe(
      switchMap(s => api.launch({playerId: this.ctx.id, specId: s.id, variant: this.variant})),
      catchError(err => {
        this.errors.push(err);
        return of(null as unknown as Challenge)
      }),
      tap(c => this.deploying = false),
      filter(c => !!c),
      map(c => this.syncOne(c))
    );

    const selected$ = this.selecting$.pipe(
      // If s.instance does not exist, fetch; otherwise, preview
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
      ),
      tap(s => this.selected = s)
    );

    //#region GAMEBRAIN ITEMS
    this.unityGameLink$ = this.unityGameLinkSubject$.pipe(
      tap(s => this.origS = s),
      switchMap(s => api.retrieveGameServerIP(s[0]).pipe(
        tap(st => console.log("st = " + st)),
        // This will not get pushed if the server does not exist
        catchError(err => {
          this.errors.push(err);
          return of(null as unknown as string)
        })
      )),
      tap(link => this.unityGameLink = link),
      // Set the link to the Unity game server here
      tap(link => window.localStorage.setItem("gameServerLink", link)),
      concatMap(s => api.retrieveGameInfo(this.origS[1], this.origS[0]).pipe(
        tap(s => console.log("info = " + s)),
        tap(s => console.log("origS = " + this.origS[0] + ", " + this.origS[1])),
        catchError(err => {
          this.errors.push(err);
          return of(null as unknown as GameStarterData)
        })
      )),
      tap(data => {
        if (data == null) {
          console.log("data is null; should not happen.");
        }
        else {
          for (let i = 0; i < data.vms.length; i++) {
            window.localStorage.setItem("VM" + i, data.vms[i]);
          }
        }
      })
    );

    /*this.unityGameLinkSubject$.pipe(
      switchMap(s => api.retrieveGameInfo(s[1], s[0]).pipe(
        tap(st2 => console.log("st2 = " + st2)),
        catchError(err => {
          this.errors.push(err);
          return of(null as unknown as string)
        })
      )),
      tap(st => console.log("ye: " + st))
    );*/
    //#endregion

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

  ngOnDestroy(): void {
    if (!this.hubsub.closed) {
      this.hubsub.unsubscribe();
    }
  }

  startHub(b: BoardPlayer): void {
    if (b.session.isDuring) {
      this.hub.init(b.id);
    }
  }
  syncOne = (c: Challenge): BoardSpec => {
    this.deploying = false;
    const s = this.ctx.game.specs.find(i => i.id === c.specId);
    if (!!s) {
      s.instance = c;
      this.api.checkPrereq(s, this.ctx)
      this.api.setColor(s);
      // TODO: revisit this temp solution for auto-grading sync
      this.refresh$.next(this.ctx.id);
    }
    return s || {} as BoardSpec;
  }

  select(spec: BoardSpec): void {
    if (this.ctx.game.mode == 'unity') {
      // retrieveGameServerIP
      // retrieveGameInfo
    }
    else if (!spec.disabled && !spec.locked) {
      this.selecting$.next(spec);
    }
  }

  reselect(): void {
    if (!this.selected) { return; }
    const spec = this.ctx.game.specs.find(s => s.id === this.selected.id);
    if (!!spec) {
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
    this.api.start(model.instance).pipe(
      catchError(e => {
        this.errors.push(e);
        return of({} as Challenge);
      })
    ).subscribe(
      c => this.syncOne(c)
    );
  }

  graded(): void {
    this.refresh$.next(this.ctx.id);
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
