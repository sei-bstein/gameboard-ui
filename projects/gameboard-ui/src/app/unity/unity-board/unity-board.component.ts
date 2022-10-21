import { Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output, ViewChild, } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { combineLatest, interval } from 'rxjs';
import { ConfigService } from '../../utility/config.service';
import { UnityActiveGame, UnityBoardContext } from '../unity-models';
import { UnityService } from '../unity.service';
import { environment } from 'projects/gameboard-ui/src/environments/environment';
import { DOCUMENT } from '@angular/common';
import { LayoutService } from '../../utility/layout.service';

@Component({
  selector: 'app-unity-board',
  templateUrl: './unity-board.component.html',
  styleUrls: ['./unity-board.component.scss']
})
export class UnityBoardComponent implements OnInit, OnDestroy {
  @Input('gameContext') public ctx!: UnityBoardContext;
  @ViewChild('iframe') private iframe: HTMLIFrameElement | null = null;
  @Output() public gameOver = new EventEmitter();
  @Output() public error = new EventEmitter<string>();

  unityHost: string | null = null;
  unityClientLink: SafeResourceUrl | null = null;
  unityActiveGame: UnityActiveGame | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private config: ConfigService,
    private sanitizer: DomSanitizer,
    private layoutService: LayoutService,
    private unityService: UnityService) { }

  ngOnDestroy(): void {
    this.layoutService.stickyMenu$.next(true);
  }

  ngOnInit(): void {
    if (!this.config.settings.unityclienthost) {
      console.log("Unity host error", this.config.settings);

      const errorMessage = `Unity host is not set: ${this.config.settings.unityclienthost}`;
      this.error.emit(errorMessage);
      throw new Error(errorMessage)
    }

    this.layoutService.stickyMenu$.next(false);
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

  @HostListener("window:scroll", ["$event"])
  private onWindowScroll($event: any) {
    const reveals = this.document.querySelectorAll(".reveal");
    const window = this.document.defaultView;

    if (!window) {
      console.error("Couldn't manipulate the height of the window");
      return;
    }

    for (var i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = reveals[i].getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add("active");
      } else {
        reveals[i].classList.remove("active");
      }
    }
  }
}
