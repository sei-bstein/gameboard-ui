// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { faEdit, faMapMarker, faPlus, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { NewSpec, Spec } from '../../api/spec-models';
import { SpecService } from '../../api/spec.service';
import { ConfigService } from '../../utility/config.service';

@Component({
  selector: 'app-game-mapper',
  templateUrl: './game-mapper.component.html',
  styleUrls: ['./game-mapper.component.scss']
})
export class GameMapperComponent implements OnInit, AfterViewInit {
  @Input() game!: Game;
  @ViewChild('mapbox') mapboxRef!: ElementRef;
  @ViewChild('callout') calloutRef!: ElementRef;
  mapbox!: HTMLDivElement;
  callout!: HTMLDivElement;
  specDrag: Spec | null = null;
  specHover: Spec | null = null;
  altkey = false;
  showGrid = false;
  showCallout = false;

  refresh$ = new Subject<string>();
  updating$ = new Subject<Spec>();
  deleting$ = new Subject<Spec>();
  updated$: Observable<Spec>;
  created$: Observable<Spec>;
  deleted$: Observable<any>;
  list$: Observable<Spec[]>;
  list: Spec[] = [];
  faSearch = faSearch;
  faTrash = faTrash;
  faEdit = faEdit;
  faMapMarker = faMapMarker;
  faPlus = faPlus;

  show = false;
  viewing = 'edit';
  addedCount = 0;

  constructor(
    api: SpecService,
    private gameSvc: GameService,
    private renderer: Renderer2,
    private config: ConfigService
  ) {

    this.list$ = this.refresh$.pipe(
      debounceTime(500),
      switchMap(id => gameSvc.retrieveSpecs(id)),
      tap(r => this.list = r)
    );

    this.created$ = api.selected$.pipe(
      // tap(s => console.log(s)),
      filter(s => !this.list.find(i => i.externalId === s.externalId)),
      map(s => ({ ...s, gameId: this.game.id, points: 0, x: .5, y: .5, r: .015 } as NewSpec)),
      switchMap(s => api.create(s)),
      tap(r => this.list.push(r)),
      tap(r => this.addedCount += 1)
    );

    this.updated$ = this.updating$.pipe(
      debounceTime(500),
      filter(s => s.points === 0 || s.points > 0),
      switchMap(s => api.update(s))
    );

    this.deleted$ = this.deleting$.pipe(
      switchMap(s => api.delete(s.id)),
      tap(() => this.refresh$.next(this.game.id))
    );
  }

  ngOnInit(): void {
    this.game.mapUrl = this.game.background
        ? `${this.config.imagehost}/${this.game.background}`
        : `${this.config.basehref}assets/map.png`
      ;
  }

  ngAfterViewInit(): void {
    this.refresh();
    this.mapbox = this.mapboxRef.nativeElement as HTMLDivElement;
    this.callout = this.calloutRef.nativeElement as HTMLDivElement;
  }

  refresh(): void {
    this.refresh$.next(this.game.id);
  }

  view(v: string): void {
    this.viewing = v;
    if (v === 'edit') {
      this.addedCount = 0;
    }
  }

  upload(files: File[]): void {
    this.gameSvc.uploadImage(this.game.id, 'map', files[0]).subscribe(
      r => {
        this.game.background = r.filename;
        this.game.mapUrl = `${this.config.imagehost}/${r.filename}`;
      }
    );
  }
  clearImage(): void {
    this.gameSvc.deleteImage(this.game.id, 'map').subscribe(
      r => {
        this.game.background = r.filename;
        this.game.mapUrl = `${this.config.basehref}assets/map.png`;
      }
    );
  }

  trackById(index: number, g: Spec): string {
    return g.id;
  }

  mousemove(e: MouseEvent) {
    // console.log(`${e.offsetX}x${e.offsetY}`);

    if (!this.specDrag) { return; }

    if (this.altkey) {
      // resize radius as percentage of mapbox/svg
      const centerx = this.specDrag.x * this.mapbox.clientWidth;
      const centery = this.specDrag.y * this.mapbox.clientHeight;
      const deltaX = e.offsetX - centerx;
      const deltaY = e.offsetY - centery;
      const r = Math.sqrt(
        Math.pow(Math.abs(deltaX), 2) +
        Math.pow(Math.abs(deltaY), 2)
      );
      this.specDrag.r  = Math.max(.01, r / this.mapbox.clientWidth);
    } else {
      // set location as percentage of mapbox/svg
      this.specDrag.x = e.offsetX / this.mapbox.clientWidth;
      this.specDrag.y = e.offsetY / this.mapbox.clientHeight;
    }

    this.updating$.next(this.specDrag);
  }

  mousedrag(e: MouseEvent, spec: Spec) {
    if (this.showCallout) { return; }
    this.specDrag = e.type === 'mousedown'
      ? spec
      : null
    ;
  }

  mouseenter(e: MouseEvent, spec: Spec) {
    this.specHover = spec;
    spec.c = 'purple';

    if (this.showCallout) {

      // const middle = this.mapbox.clientWidth / 2;
      // const centerr = spec.r * this.mapbox.clientWidth;
      // const centerx = spec.x * this.mapbox.clientWidth + centerr;
      // const centery = spec.y * this.mapbox.clientHeight + centerr;
      // const deltaX = middle - centerx;
      // const deltaY = middle - centery;
      // const vectorX = deltaX / Math.abs(deltaX);
      // const vectorY = deltaY / Math.abs(deltaY);
      // const th = Math.atan(deltaY / deltaX);
      // const offsetX = deltaX + (centerr *2);
      // const thetaY = Math.tan(th) * (centerr * 2);
      // const offsetY = deltaY + thetaY;
      // // const xx = deltaX + centerx;
      // // const yy = centery + (offsetY * 1);
      // // const xx = centerx + ((centerr + 12) * vectorX);
      // // const yy = centery + ((centerr + 12) * vectorY);
      // const left = offsetX > 0 ?  middle - offsetX + (centerr * 2) : 0;
      // const right = offsetX < 0 ? middle + offsetX - (centerr * 2) : 0;
      // const top = deltaY > 0 ?  middle - deltaY + (vectorX*thetaY) + centerr : 0;
      // const bottom = deltaY < 0 ? middle + deltaY - (vectorX*thetaY) - centerr : 0;
      // console.log(`delta: ${deltaX}x${deltaY} r: ${centerr}`);
      // console.log(`th:${th} offset:${offsetX}x${offsetY} thetaY${thetaY}`);
      const middle = this.mapbox.clientWidth / 2;
      const centerr = spec.r * this.mapbox.clientWidth;
      const centerx = spec.x * this.mapbox.clientWidth + centerr;
      const centery = spec.y * this.mapbox.clientHeight + centerr;
      const deltaX = middle - centerx;
      const deltaY = middle - centery;
      const vectorX = deltaX / Math.abs(deltaX);
      const vectorY = deltaY / Math.abs(deltaY);
      let left=0, top=0, right=0, bottom=0;
      if (vectorX > 0) {
        left = centerx + centerr;
        if (vectorY > 0) {
          top = centery + centerr;
        } else {
          bottom = middle*2 - centery + (2* centerr);
        }
      } else {
        right = middle*2 - centerx + (2*centerr);
        if (vectorY > 0) {
          top = centery + centerr;
        } else {
          bottom = middle*2 - centery + (2* centerr);
        }
      }

      // console.log(`delta: ${deltaX}x${deltaY} r: ${centerr}`);

      // set callout location
      // const middle = this.mapbox.clientWidth / 2;
      // const centerr = spec.r * this.mapbox.clientWidth;
      // const centerx = spec.x * this.mapbox.clientWidth + centerr;
      // const centery = spec.y * this.mapbox.clientHeight + centerr;
      // const deltaX = middle - centerx + centerr;
      // const deltaY = middle - centery + centerr;
      // const vectorX = deltaX / Math.abs(deltaX);
      // const vectorY = deltaY / Math.abs(deltaY);
      // const th = Math.atan(deltaY / deltaX);
      // const offsetX = centerr * 2;
      // const offsetY = Math.tan(th) * offsetX
      // const xx = centerx + (offsetX * 1);
      // const yy = centery + (offsetY * 1);
      // // const xx = centerx + ((centerr + 12) * vectorX);
      // // const yy = centery + ((centerr + 12) * vectorY);
      // const left = vectorX > 0 ?  xx : 0;
      // const right = vectorX < 0 ? xx : 0;
      // const top = vectorY > 0 ?  yy : 0;
      // const bottom = vectorY < 0 ? yy : 0;
      // console.log(`delta: ${deltaX}x${deltaY} r: ${centerr}`);
      // console.log(`th:${th} offset:${offsetX}x${offsetY} corner:${xx}x${yy}`);

      if (!!left) {
        this.renderer.setStyle(this.callout, 'left', left+'px');
      } else {
        this.renderer.removeStyle(this.callout, 'left');
      }
      if (!!top) {
        this.renderer.setStyle(this.callout, 'top', top+'px');
      } else {
        this.renderer.removeStyle(this.callout, 'top');
      }
      if (!!right) {
        this.renderer.setStyle(this.callout, 'right', right+'px');
      } else {
        this.renderer.removeStyle(this.callout, 'right');
      }
      if (!!bottom) {
        this.renderer.setStyle(this.callout, 'bottom', bottom+'px');
      } else {
        this.renderer.removeStyle(this.callout, 'bottom');
      }

      // console.log(`middle: ${middle} pos: ${top} ${right} ${bottom} ${left}`);

    }

  }
  mouseleave(e: MouseEvent, spec: Spec) {
    this.specHover = null;
    spec.c = 'blue';
  }

  @HostListener('document:keydown', ['$event'])
  @HostListener('document:keyup', ['$event'])
  onKeydown(ev: KeyboardEvent) {
    this.altkey = ev.altKey;
  }
}
