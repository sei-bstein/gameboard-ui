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

  unityHost: string | null = null;
  unityClientLink: SafeResourceUrl | null = null;
  unityActiveGame: UnityActiveGame | null = null;

  constructor(
    private config: ConfigService,
    private sanitizer: DomSanitizer,
    private unityService: UnityService) { }

  ngOnInit(): void {
    if (!this.config.settings.unityclienthost) {
      console.log("Unity host error", this.config.settings);

      const errorMessage = `Unity host is not set: ${this.config.settings.unityclienthost}`;
      this.error.emit(errorMessage);
      throw new Error(errorMessage)
    }

    this.unityHost = this.config.settings.unityclienthost || null;
    this.unityClientLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.unityHost!);
    this.unityService.activeGame$.subscribe(game => this.unityActiveGame = game);
    this.unityService.error$.subscribe(err => this.error.emit(err));
    this.unityService.startGame(this.ctx);

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
