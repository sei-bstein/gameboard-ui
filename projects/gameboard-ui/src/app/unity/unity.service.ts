import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { UnityActiveGame, UnityDeployContext, UnityUndeployContext } from '../unity/unity-models';
import { LocalStorageService, StorageKey } from '../utility/local-storage.service';

@Injectable({ providedIn: 'root' })
export class UnityService {
  private API_ROOT = `${this.config.apphost}api`;

  activeGame$ = new Subject<UnityActiveGame>();
  gameOver$ = new Observable();
  error$ = new Subject<any>();

  constructor (
    private config: ConfigService,
    private http: HttpClient,
    private storage: LocalStorageService) { }

  public endGame(ctx: UnityDeployContext): void {
    this.clearLocalStorageKeys();
    this.activeGame$.complete();
    this.undeployGame(ctx).subscribe(m => this.log("Undeploy result:", m))
  }

  public async startGame(ctx: UnityDeployContext) {
    this.log("Validating context for the game...", ctx);
    
    if (!ctx.sessionExpirationTime) {
      this.reportError("Can't start the game - no session expiration time was specified.");
    }

    if (!ctx.gameId) {
      this.reportError("Can't start the game - no gameId was specified.");
    }

    if (!ctx.teamId) {
      this.reportError("Can't start the game - no teamId was specified.");
    }

    // this.log("Cleaning up any existing keys from prior runs...");
    // this.clearLocalStorageKeys();

    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    this.log(`Retrieving storage key: ${storageKey}`);
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    if (oidcUserToken == null) {
      this.reportError("You don't seem to have an OIDC token. (If this is a playtest, try relogging. Sorry.");
    }

    this.storage.add(StorageKey.UnityOidcLink, `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`);
    this.log("User OIDC resolved.");

    this.log("Starting unity game with context ...", ctx);
    this.launchGame(ctx)
  }

  public undeployGame(ctx: UnityUndeployContext): Observable<string> {
    this.log("Undeploying game...");
    this.log(`... ${this.API_ROOT}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}...`);
    return this.http.get<string>(`${this.API_ROOT}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}`);
  }

  private createLocalStorageKeys(game: UnityActiveGame) {
    this.storage.add(StorageKey.UnityGameLink, game.headlessUrl);

    for (let i = 0; i < game.vms.length; i++) {
      this.storage.addArbitrary(`VM${i}`, game.vms[i].Url);
    }
  }

  private clearLocalStorageKeys() {
    this.storage.remove(false, StorageKey.UnityOidcLink, StorageKey.UnityGameLink);
    this.storage.removeIf((key, value) => key.startsWith("VM"));
  }

  private launchGame(ctx: UnityDeployContext) {
    this.http.get<any>(`${this.API_ROOT}/deployunityspace/${ctx.gameId}/${ctx.teamId}`).subscribe(deployResult => {

      try {
        this.log("Starting pre-launch validation. This was deployed ->", deployResult);

        // validation - did we make it?
        if (!deployResult.headlessUrl || !deployResult.gamespaceId || !deployResult.vms || !deployResult.vms.length) {
          this.reportError(`Couldn't resolve the deploy result for team ${ctx.teamId}. No gamespaces available.`);
        }

        // add necessary items to local storage
        this.createLocalStorageKeys(deployResult);
      }
      catch (err: any) {
        this.reportError(err);
        this.endGame(ctx);
        return;
      }

      // emit the result
      const UnityActiveGame = {
        gamespaceId: deployResult.gamespaceId,
        headlessUrl: deployResult.headlessUrl,
        vms: deployResult.vms,
        gameId: ctx.gameId,
        teamId: ctx.teamId,
        sessionExpirationTime: ctx.sessionExpirationTime
      };

      this.log("Game is active!", deployResult);
      this.activeGame$.next(deployResult);
      this.log("Booting unity client!");
    });
  }

  private log(...messages: (string | any)[]) {
    console.log("[UnityService]:", ...messages);
  }

  private reportError(error: string) {
    this.clearLocalStorageKeys();
    this.error$.next(error);
    throw new Error(error);
  }
}
