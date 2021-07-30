// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { ChangedPlayer, NewPlayer, Player, PlayerEnlistment, Standing, TeamInvitation, TimeWindow } from './player-models';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  url = '';

  constructor(
    private http: HttpClient,
    config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(search: any): Observable<Player[]> {
    return this.http.get<Player[]>(this.url + '/players', {params: search});
  }
  public retrieve(id: string): Observable<Player> {
    return this.http.get<Player>(`${this.url}/player/${id}`);
  }
  public create(model: NewPlayer): Observable<Player> {
    return this.http.post<Player>(`${this.url}/player`, model);
  }
  public update(model: ChangedPlayer): Observable<any> {
    return this.http.put<any>(`${this.url}/player`, model);
  }
  public start(model: ChangedPlayer): Observable<Player> {
    return this.http.put<Player>(`${this.url}/player/start`, model);
  }
  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/player/${id}`);
  }
  public invite(id: string): Observable<TeamInvitation> {
    return this.http.post<TeamInvitation>(`${this.url}/player/${id}/invite`, null);
  }
  public enlist(model: PlayerEnlistment): Observable<Player> {
    return this.http.post<Player>(`${this.url}/player/enlist`, model);
  }
  public scores(search: any): Observable<Standing[]> {
    return this.http.get<Standing[]>(this.url + '/scores', {params: search});
  }
}
