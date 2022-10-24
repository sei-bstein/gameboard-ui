import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { interval } from 'rxjs';
import { ConfigService } from '../../utility/config.service';
import { UnityActiveGame, UnityBoardContext } from '../unity-models';
import { UnityService } from '../unity.service';
import { DOCUMENT } from '@angular/common';
import { LayoutService } from '../../utility/layout.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-unity-board',
  templateUrl: './unity-board.component.html',
  styleUrls: ['./unity-board.component.scss']
})
export class UnityBoardComponent implements OnInit {
  @Input('gameContext') public ctx!: UnityBoardContext;
  @ViewChild('iframe') private iframe: HTMLIFrameElement | null = null;
  @Output() public gameOver = new EventEmitter();
  @Output() public error = new EventEmitter<string>();

  unityHost: string | null = null;
  unityClientLink: SafeResourceUrl | null = null;
  unityActiveGame: UnityActiveGame | null = null;
  isError = false;
  isGamespaceProvisioned = false;

  constructor (
    @Inject(DOCUMENT) private document: Document,
    private config: ConfigService,
    private sanitizer: DomSanitizer,
    public unityService: UnityService,
    public layoutService: LayoutService) { }

  ngOnDestroy(): void {
    this.layoutService.stickyMenu$.next(true);
  }

  ngOnInit(): void {
    if (!this.config.settings.unityclienthost) {
      console.log("Unity host error", this.config.settings);

      const errorMessage = `Unity host is not set: ${this.config.settings.unityclienthost}`;
      this.handleError(errorMessage);
    }

    this.unityService.error$.subscribe(err => this.handleError(err));
    this.layoutService.stickyMenu$.next(false);
    this.unityHost = this.config.settings.unityclienthost || null;
    this.unityClientLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.unityHost!);
    this.unityService.activeGame$.subscribe(game => this.unityActiveGame = game);
    this.unityService.startGame(this.ctx);

    interval(2000).pipe(
      takeUntil(this.unityService.gameOver$)
    ).subscribe(s => alert("Game's over. now what?"));
  }

  onHasGame() {
    this.isGamespaceProvisioned = true;
  }

  private handleError(error: string) {
    this.isError = true;
    this.error.emit(error);
  }
}
