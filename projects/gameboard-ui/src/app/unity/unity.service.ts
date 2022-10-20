import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { UnityActiveGame, UnityBoardContext, UnityDeployContext } from '../unity/unity-models';
import { LocalStorageService, StorageKey } from '../utility/local-storage.service';

@Injectable({ providedIn: 'root' })
export class UnityService {
  private API_ROOT = `${this.config.apphost}api`;
  private activeGame: UnityBoardContext | null = null;

  activeGame$ = new Subject<UnityActiveGame>();
  gameOver$ = new Observable();
  error$ = new Subject<any>();

  constructor(
    private config: ConfigService,
    private http: HttpClient,
    private storage: LocalStorageService) { }

  public endGame(ctx: UnityDeployContext): void {
    this.clearLocalStorageKeys();
    this.activeGame$.complete();
    this.undeployGame(ctx).subscribe(m => this.log("Undeploy result:", m))
  }

  public async startGame(ctx: UnityBoardContext) {
    this.log("Starting unity game...", ctx);

    if (!ctx.sessionExpirationTime) {
      this.reportError("Can't start the game - no session expiration time.");
    }

    const storageKey = `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`;
    this.log(`Retrieving storage key: ${storageKey}`);
    const oidcUserToken = this.storage.getArbitrary(storageKey);

    if (oidcUserToken == null) {
      this.reportError("Can't start a Unity game if the user doesn't have an OIDC token.");
    }

    this.storage.add(StorageKey.UnityOidcLink, `oidc.user:${this.config.settings.oidc.authority}:${this.config.settings.oidc.client_id}`);
    this.log("User OIDC resolved.");

    this.log("Starting unity game...");
    this.launchGame({ gameId: ctx.gameId, teamId: ctx.teamId })
  }

  public retrieveHeadlessUrl(ctx: UnityDeployContext): Observable<string> {
    this.log("Getting headlessUrl with context...", ctx)
    return this.http.get<string>(`${this.API_ROOT}/game/headless/${ctx.teamId}?gid=${ctx.gameId}`);
  }

  public undeployGame(ctx: UnityDeployContext): Observable<string> {
    this.log("Undeploying game...");
    this.log(`... @ ${this.http}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}...`)
    return this.http.get<string>(`${this.http}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}`);
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

  private launchGame(ctx: UnityDeployContext) {
    this.http.get<any>(`${this.API_ROOT}/deployunityspace/${ctx.gameId}/${ctx.teamId}`).subscribe(deployed => {
      this.log("Deployed this ->", deployed);
      forkJoin([
        of({
          gamespaceId: deployed.gamespaceId,
          headlessUrl: deployed.headless_url,
          teamId: ctx.teamId,
          gameId: ctx.gameId,
          vms: deployed.vms
        } as UnityActiveGame),
        this.retrieveHeadlessUrl(ctx)
      ]).subscribe(([game, headlessUrl]) => {
        this.log("Launching game", game, "with headlessUrl", headlessUrl);
        game.headlessUrl = headlessUrl;

        try {
          // validation - did we make it?
          if (!game.headlessUrl) {
            this.reportError(`Couldn't resolve the headless url for the context: ${JSON.stringify(game)}`)
          }

          if (!game.vms?.length) {
            this.reportError(`Couldn't resolve VMs for the game: ${JSON.stringify(game)}`);
          }

          // add necessary items to local storage
          this.createLocalStorageKeys(game);
        }
        catch {
          this.endGame(ctx)
        }

        // emit the result
        this.log("Game is active!", game);
        this.activeGame$.next(game);
      });
    });
  }

  private log(...messages: (string | any)[]) {
    console.log("[UnityService]:", ...messages);
  }

  private reportError(error: string) {
    this.error$.next(error);
    throw new Error(error);
  }
}
