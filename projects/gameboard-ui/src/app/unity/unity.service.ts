import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { UnityActiveGame, UnityBoardContext, UnityDeployContext } from '../unity/unity-models';
import { LocalStorageService, StorageKey } from '../utility/local-storage.service';

@Injectable({ providedIn: 'root' })
export class UnityService {
  private API_ROOT = `${this.config.apphost}api`;
  activeGame$ = new Subject<UnityActiveGame>();
  gameOver$ = new Observable();

  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private storage: LocalStorageService) { }

  public endGame(ctx: UnityBoardContext): void {
    this.clearLocalStorageKeys();
    this.activeGame$.complete();
    this.undeployGame(ctx).subscribe(m => this.log("Undeploy result:", m))
  }

  public async startGame(ctx: UnityBoardContext) {
    if (!ctx.sessionExpirationTime) {
      this.logError("Can't start the game - no session expiration time.");
    }

    this.log("Starting unity game...");
    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    this.log(`Retrieving storage key ${storageKey}`);
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    this.storage.add(StorageKey.UnityOidcLink, `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`);
    this.log("Stuff is set.");

    if (oidcUserToken == null) {
      console.error("Can't start a Unity game if the user doesn't have an OIDC token.");
    }

    this.log("Starting unity game...");
    this.http.get<any>(`${this.API_ROOT}/deployunityspace/${ctx.gameId}/${ctx.teamId}`).subscribe(deployed => {
      this.log("Deployed this ->", deployed);
      forkJoin([
        of({
          gamespaceId: deployed.gamespaceId,
          headlessUrl: deployed.headless_url,
          vms: deployed.vms
        } as UnityActiveGame),
        this.retrieveHeadlessUrl(ctx)
      ]).subscribe(([game, headlessUrl]) => this.launchGame(game, headlessUrl));
    });
  }

  public retrieveHeadlessUrl(ctx: UnityBoardContext): Observable<string> {
    this.log("Getting headlessUrl...")
    return this.http.get<string>(`${this.API_ROOT}/game/headless/${ctx.teamId}?gid=${ctx.gameId}`);
  }

  public undeployGame(ctx: UnityDeployContext): Observable<string> {
    this.log("Undeploying game...");
    this.log(`... @ ${this.http}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}...`)
    return this.http.get<string>(`${this.http}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}`);
  }

  public hasActiveGame() {
    return this.storage.get(StorageKey.UnityGameLink) && this.storage.get(StorageKey.UnityOidcLink);
  }

  private createLocalStorageKeys(game: UnityActiveGame) {
    this.storage.add(StorageKey.UnityGameLink, game.headlessUrl);

    for (let i = 0; i < game.vms.length; i++) {
      this.storage.addArbitrary(`VM${i}`, game.vms[i].Url);
    }
  }

  private clearLocalStorageKeys() {
    this.storage.remove(false, StorageKey.UnityGameLink, StorageKey.UnityOidcLink);
    this.storage.removeIf((key, value) => key.startsWith("VM"));
  }

  private launchGame(game: UnityActiveGame, headlessUrl: string) {
    this.log("Launching game", game, "with headlessUrl", headlessUrl);
    game.headlessUrl = headlessUrl;

    // validation - did we make it?
    if (!game.headlessUrl) {
      throw new Error(`Couldn't resolve the headless url for the game: ${game}`)
    }

    if (!game.vms?.length) {
      this.logError(`Couldn't resolve VMs for the game: ${game}`);
    }

    // add necessary items to local storage
    this.createLocalStorageKeys(game);

    // emit the result
    this.log("Game is active!", game);
    this.activeGame$.next(game);
  }

  private logError(...messages: (string | any)[]) {
    console.error("[UnityService]:", ...messages);
  }

  private log(...messages: (string | any)[]) {
    console.log("[UnityService]:", ...messages);
  }
}
