import { Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest, interval } from 'rxjs';
import { ConfigService } from '../../utility/config.service';
import { UnityActiveGame, UnityBoardContext } from '../unity-models';
import { UnityService } from '../unity.service';
import { environment } from 'projects/gameboard-ui/src/environments/environment';

@Component({
  selector: 'app-unity-board',
  templateUrl: './unity-board.component.html',
  styleUrls: ['./unity-board.component.scss']
})
export class UnityBoardComponent implements OnInit {
  @Input('gameContext') public ctx!: UnityBoardContext;
  @Output() public gameOver = new EventEmitter();
  @Output() public error = new EventEmitter<string>();

  // unityHost = this.config.unityHost;
  unityHost = environment.settings.unityhost;
  unityClientLink: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(environment.settings.unityhost);
  unityActiveGame: UnityActiveGame | null = null;

  constructor(
    private config: ConfigService,
    private sanitizer: DomSanitizer,
    private unityService: UnityService) { }

  ngOnInit(): void {
    this.unityService.activeGame$.subscribe(game => this.unityActiveGame);
    this.unityService.error$.subscribe(err => this.error.emit(err));
    this.unityService.startGame(this.ctx);

    console.log('config is', this.config.unityHost);
    console.log('env is', environment.settings.unityhost);

    combineLatest([
      interval(1000),
      this.unityService.gameOver$,
    ]).subscribe(([tick, isGameOver]) => {
      if (isGameOver) {
        alert("The game's over! What's supposed to happen now?");
      }
    });
  }
}
