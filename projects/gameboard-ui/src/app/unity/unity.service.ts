import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from '../utility/config.service';
import { UnityActiveGame, UnityDeployContext, UnityDeployResult, UnityUndeployContext } from '../unity/unity-models';
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

    const currentGameJson = await this.getCurrentGame(ctx).toPromise();
    console.log("The type of the current game thing is", typeof currentGameJson);
    const currentGame = (JSON.parse(currentGameJson)) as UnityActiveGame;
    if (currentGame.gamespaceId) {
      this.log("GamespaceId is", currentGame.gamespaceId, "- valid game");
      this.log("A game already exists for context", ctx);

      this.log("Starting up existing game.", currentGame);
      this.startupExistingGame(currentGame);
    }
    else {
      this.log("This context doesn't have an active game, because gamespaceId:", currentGame?.gamespaceId);
      this.log("Their active game is:", currentGame);
      this.log("Starting one now...");
      this.launchGame(ctx);
    }
  }

  public undeployGame(ctx: UnityUndeployContext): Observable<string> {
    this.log("Undeploying game...");
    this.log(`... ${this.API_ROOT}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}...`);
    return this.http.get<string>(`${this.API_ROOT}/undeployunityspace/${ctx.teamId}?gid=${ctx.gameId}`);
  }

  private createLocalStorageKeys(game: UnityActiveGame) {
    this.storage.add(StorageKey.UnityGameLink, game.headlessUrl);

    if (game.vms?.length) {
      for (let i = 0; i < game.vms.length; i++) {
        this.storage.addArbitrary(`VM${i}`, game.vms[i].Url);
      }
    }
  }

  private clearLocalStorageKeys() {
    this.storage.remove(false, StorageKey.UnityOidcLink, StorageKey.UnityGameLink);
    this.storage.removeIf((key, value) => /VM\d+/i.test(key));
  }

  private launchGame(ctx: UnityDeployContext) {
    this.http.post<UnityDeployResult>(`${this.API_ROOT}/deployunityspace/${ctx.gameId}/${ctx.teamId}`, {}).subscribe(deployResult => {
      this.log("Deployed this ->", deployResult);

      const activeGame = {
        gamespaceId: deployResult.gamespaceId,
        headlessUrl: deployResult.headlessUrl,
        vms: deployResult.vms,
        gameId: ctx.gameId,
        teamId: ctx.teamId,
        sessionExpirationTime: ctx.sessionExpirationTime
      };

      this.startupExistingGame(activeGame);
    });
  }

  private startupExistingGame(ctx: UnityActiveGame) {
    try {
      this.log("Starting pre-launch validation. The active game to run in the client is ->", ctx);

      // validation - did we make it?
      if (!this.isValidGame(ctx)) {
        this.reportError(`Couldn't resolve the deploy result for team ${ctx.teamId}. No gamespaces available. Context: ${ctx}`);
      }

      // add necessary items to local storage
      this.createLocalStorageKeys(ctx);
    }
    catch (err: any) {
      this.reportError(err);
      this.endGame(ctx);
      return;
    }

    // emit the result
    this.log("Game is active!", ctx);
    this.activeGame$.next(ctx);
    this.log("Booting unity client!");
  }

  private getCurrentGame<UnityActiveGame>(ctx: UnityDeployContext): Observable<UnityActiveGame> {
    return this.http.get<UnityActiveGame>(`${this.API_ROOT}/getGamespace/${ctx.gameId}/${ctx.teamId}`);
  }

  // TODO: this should check every field, but i don't know why stuff isn't working
  private isValidGame = (game: UnityActiveGame) => game.gamespaceId;

  private log(...messages: (string | any)[]) {
    console.log("[UnityService]:", ...messages);
  }

  private reportError(error: string) {
    this.clearLocalStorageKeys();
    this.error$.next(error);
    throw new Error(error);
  }
}
