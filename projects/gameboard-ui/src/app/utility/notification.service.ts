// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';
import { BehaviorSubject, combineLatest, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { AuthService, AuthTokenState } from './auth.service';
import { UserService } from '../api/user.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private connection: HubConnection;
  private hubState: HubState = { id: '', initialized: false, connected: false, joined: false, actors: []};
  private playerId$ = new Subject<string>();

  state$ = new BehaviorSubject<HubState>(this.hubState);
  announcements = new Subject<HubEvent>();
  presenceEvents = new Subject<HubEvent>();
  teamEvents = new Subject<HubEvent>();
  challengeEvents = new Subject<HubEvent>();

  constructor(
    private config: ConfigService,
    private auth: AuthService,
    private apiUserSvc: UserService
  ) {

    this.connection = this.getConnection(`${config.apphost}hub`);

    // refresh connection on token refresh
    const authtoken$ = this.auth.tokenState$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
    );

    combineLatest([authtoken$, this.playerId$]).pipe(
      map(([token, id]) => ({token, id}))
    ).subscribe(ctx => {
      this.hubState.id = ctx.id;
      this.disconnect();
      if (!!ctx.id && ctx.token === AuthTokenState.valid) {
        this.connect();
      }
    });

  }

  init(id: string): void {
    this.playerId$.next(id);
  }

  private async joinChannel(id: string): Promise<void> {

    // prevent race if trying to join channel before connection is fully up
    if (this.connection.state !== HubConnectionState.Connected) {
      timer(1000).subscribe(() => this.joinChannel(id));
      return;
    }

    try {
      await this.leaveChannel();
      if (!!id) {
        await this.connection.invoke('Listen', id);
        this.hubState.id = id;
        this.hubState.joined = true;
        this.postState();
      }
    } catch (e) {
      console.log(e);
    }
  }

  private async leaveChannel(): Promise<void> {
    if (!!this.hubState.id && this.connection.state === HubConnectionState.Connected) {
      await this.connection.invoke('Leave');
      this.hubState.id = '';
      this.hubState.joined = false;
      this.hubState.actors = [];
      this.postState();
    }
  }

  private getConnection(url: string): HubConnection {

    const connection = new HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => this.getTicket(),
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
      } as IHttpConnectionOptions)
      .withAutomaticReconnect([1000, 2000, 3000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000])
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose(err => this.setDiconnected());
    connection.onreconnecting(err => this.setDiconnected());
    connection.onreconnected(cid => this.setConnected());

    connection.on('presenceEvent', (event: HubEvent) => {
      if (event.action === HubEventAction.arrived) {
          connection.invoke('Greet');
      }
      this.presenceEvents.next(event);
      this.updatePresence(event);
    });

    connection.on('teamEvent', (e: HubEvent) => this.teamEvents.next(e));
    connection.on('challengeEvent', (e: HubEvent) => this.challengeEvents.next(e));
    connection.on('announcement', (e: HubEvent) => this.announcements.next(e));

    return connection;
  }

  private async getTicket(): Promise<string> {
    return this.apiUserSvc.ticket().pipe(
      map(result => result.ticket)
    ).toPromise();
  }

  private async connect(): Promise<void> {
    try {
      await this.connection.start();
      await this.setConnected();
    } catch (e) {
      timer(5000).subscribe(() => this.connect());
    }
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.connection?.state === HubConnectionState.Connected) {
        await this.connection.stop();
        this.setDiconnected();
      }
    } finally {}
  }

  private async setConnected(): Promise<void> {
    this.hubState.connected = true;
    this.hubState.initialized = true;
    this.postState();
    if (this.hubState.id){
      await this.joinChannel(this.hubState.id); // rejoin if was previously joined
    }
  }

  private setDiconnected(): void {
    this.hubState.connected = false;
    this.hubState.joined = false;
    this.hubState.actors = [];
    this.postState();
  }

  private updatePresence(event: HubEvent): void {

    const actor = this.hubState.actors.find(a => a.id === event.model.id)
      ?? {...event.model} as Actor
    ;

    actor.online = (
      event.action === HubEventAction.arrived ||
      event.action === HubEventAction.greeted
    );

    actor.sponsorLogo = actor.sponsor
      ? `${this.config.imagehost}/${actor.sponsor}`
      : `${this.config.basehref}assets/sponsor.svg`
    ;

    const i = this.hubState.actors.indexOf(actor);

    if (
      i < 0 &&
      event.action !== HubEventAction.departed &&
      event.action !== HubEventAction.deleted
    ) {
      this.hubState.actors.push(actor);
    }

    if (i >= 0 && event.action === HubEventAction.deleted) {
      this.hubState.actors.splice(i, 1);
    }

    this.postState();
  }

  private postState(): void {
    this.state$.next(this.hubState);
  }

}

export interface HubState {
  id: string;
  initialized: boolean;
  connected: boolean;
  joined: boolean;
  actors: Actor[];
}

export interface HubEvent {
  action: HubEventAction;
  model?: any;
}

export interface Actor {
  id: string;
  userName: string;
  userApprovedName: string;
  sponsor: string;
  sponsorLogo: string;
  online?: boolean;
}

export enum HubEventAction
    {
      arrived = 0, //'Arrived',
      greeted = 1, //'Greeted',
      departed =2, // 'Departed',
      created = 3, //'Created',
      updated = 4, //'Updated',
      deleted = 5, //'Deleted',
    }
