// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, scheduled } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { BoardGame, BoardPlayer, BoardSpec, Challenge, ChallengeResult, ChallengeView, ChangedChallenge, GameState, NewChallenge, SectionSubmission, VmConsole } from './board-models';
import { TimeWindow } from './player-models';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public load(id: string): Observable<BoardPlayer> {
    return this.http.get<BoardPlayer>(`${this.url}/board/${id}`).pipe(
      map(b => this.transform(b))
    );
  }
  public retrieve(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.url}/challenge/${id}`);
  }
  public preview(model: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.url}/challenge/preview`, model);
  }
  public launch(model: NewChallenge): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.url}/challenge`, model);
  }
  public grade(model: SectionSubmission): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.url}/challenge/grade`, model);
  }
  public start(model: ChangedChallenge): Observable<Challenge> {
    return this.http.put<Challenge>(`${this.url}/challenge/start`, model);
  }
  public stop(model: ChangedChallenge): Observable<Challenge> {
      return this.http.put<Challenge>(`${this.url}/challenge/stop`, model);
  }
  public console(model: VmConsole): Observable<VmConsole> {
      return this.http.put<VmConsole>(`${this.url}/challenge/console`, model);
  }
  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/challenge/${id}`);
  }

  private transform(b: BoardPlayer): BoardPlayer {
    b.game.mapUrl = b.game.background
      ? `${this.config.imagehost}/${b.game.background}`
      : `${this.config.basehref}assets/map.png`
    ;

    b.game.cardUrl = b.game.logo
      ? `${this.config.imagehost}/${b.game.logo}`
      : `${this.config.basehref}assets/card.png`
    ;

    b.game.specs.forEach(s => {
      s.instance = b.challenges.find(c => c.specId == s.id);
      this.setColor(s);
    });

    this.setTimeWindow(b);

    return b;
  }

  setTimeWindow(b: BoardPlayer): BoardPlayer {
    b.session = new TimeWindow(b.sessionBegin, b.sessionEnd);
    return b;
  }

  setColor(s: BoardSpec): void {
    s.c = !!s.instance?.state.id
        ? s.instance.state.endTime.match(/^0001/) ? 'white' : 'black'
        : s.disabled ? 'black' : 'blue'
    ;
    if (!!s.instance){
      if (s.instance.result === 'success') { s.c = 'lime'; }
      if (s.instance.result === 'partial') { s.c = 'yellow'; }
    }
  }
}