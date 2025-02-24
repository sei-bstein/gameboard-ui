// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings, User, WebStorageStateStore, Log } from 'oidc-client';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ConfigService, Settings } from './config.service';

export enum AuthTokenState {
  unknown = 'unknown' as any,
  valid = 'valid' as any,
  invalid = 'invalid' as any,
  expiring = 'expiring' as any,
  expired = 'expired' as any
}

@Injectable({providedIn: 'root'})
export class AuthService {

    mgr!: UserManager;
    authority = '';
    redirectUrl = '';
    lastCall = 0;
    oidcUser!: (User | null);
    public tokenState$: BehaviorSubject<AuthTokenState> = new BehaviorSubject<AuthTokenState>(AuthTokenState.unknown);

    constructor(
        private config: ConfigService
    ) {
        // Log.level = Log.DEBUG;
        // Log.logger = console;

        config.settings$.pipe(
          filter(s => !!s.oidc.authority)
        ).subscribe((s: Settings) => {

          this.authority = s.oidc?.authority?.
            replace(/https?:\/\//, '').split('/').reverse().pop() || 'Identity Provider';

          if (s.oidc.useLocalStorage) {
              (s.oidc.userStore as any) = new WebStorageStateStore({});
          }
          this.mgr = new UserManager(s.oidc || {} as UserManagerSettings);
          this.mgr.events.addUserLoaded(user => this.onTokenLoaded(user));
          this.mgr.events.addUserUnloaded(() => this.onTokenUnloaded());
          this.mgr.events.addAccessTokenExpiring(e => this.onTokenExpiring());
          this.mgr.events.addAccessTokenExpired(e => this.onTokenExpired());
          this.mgr.events.addUserSessionChanged(() => this.onSessionChanged());
          this.mgr.events.addSilentRenewError(e => this.onRenewError(e));
          this.mgr.getUser().then(user => this.onTokenLoaded(user));
        });

    }

    isAuthenticated(): Promise<boolean> {
        const state = this.tokenState$.getValue();
        return Promise.resolve(state === AuthTokenState.valid || state === AuthTokenState.expiring);
    }

    access_token(): string {
        return ((this.oidcUser)
            ? this.oidcUser.access_token
            : 'no_token');
    }

    auth_header(): string {
        this.markAction();
        return ((this.oidcUser)
            ? this.oidcUser.token_type + ' ' + this.oidcUser.access_token
            : 'no_token');
    }

    markAction(): void {
        this.lastCall = Date.now();
    }

    private onTokenLoaded(user: (User | null)): void {
        this.oidcUser = user;
        this.tokenState$.next(!!user ? AuthTokenState.valid : AuthTokenState.invalid);
    }

    private onTokenUnloaded(): void {
        this.oidcUser = null;
        this.tokenState$.next(AuthTokenState.invalid);
    }

    private onTokenExpiring(): void {
        if (this.lastCall && Date.now() - this.lastCall < 300000) {
            this.silentLogin();
        } else {
            if (!this.mgr.settings.automaticSilentRenew) {
                this.tokenState$.next(AuthTokenState.expiring);
            }
        }
    }

    private onTokenExpired(): void {
        this.tokenState$.next(AuthTokenState.expired);

        // give any clean process 5 seconds or so.
        setTimeout(() => {
            this.expireToken();
        }, 5000);
    }

    private onSessionChanged(): void {
        console.log('sessionChanged');
    }

    private onRenewError(err: Error): void {
        this.expireToken();
    }

    externalLogin(url: string): void {
      const currentUrl = this.config.currentPath
      .replace(/login$/, '')
      .replace(/forbidden$/, '');

      this.mgr.signinRedirect({ state: this.redirectUrl || currentUrl })
          .then(() => {})
          .catch(err => {
              console.log(err);
          });
    }

    externalLoginCallback(url?: string): Promise<User> {
        return this.mgr.signinRedirectCallback(url);
    }

    logout(): void {
        if (this.oidcUser) {
            this.mgr.signoutRedirect()
            .then(() => {})
            .catch(err => {
                console.log(err.text());
            });
        }
    }

    silentLogin(): void {
        this.mgr.signinSilent();
        // .catch(err => this.expireToken());
    }

    silentLoginCallback(): void {
        this.mgr.signinSilentCallback();
    }

    clearStaleState(): void {
        this.mgr.clearStaleState();
    }

    expireToken(): void {
        this.mgr.removeUser();
    }

}
