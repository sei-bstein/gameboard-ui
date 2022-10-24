import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EventEmitter } from 'stream';
import { GameService } from '../../api/game.service';
import { SignalRServiceService } from '../../utility/signal-r.service.service';
import { UnityBoardContext, UnityDeployContext } from '../unity-models';
import { UnityService } from '../unity.service';

@Component({
  selector: 'app-unity-team-leader-waiting-room',
  templateUrl: './unity-team-leader-waiting-room.component.html',
  styleUrls: ['./unity-team-leader-waiting-room.component.scss']
})
export class UnityTeamLeaderWaitingRoomComponent implements OnInit {
  @Input() deployContext: UnityDeployContext | null = null;
  hasGame = new EventEmitter()

  constructor (
    private signalR: SignalRServiceService,
    private unityService: UnityService
  ) { }

  ngOnInit(): void {
    // this.signalR.create("unity-team-leader-waiting-room");

    // in the long run, i'll do this with signal r... short run?
    if (!this.deployContext) {
      throw new Error("Unity deploy context unset.");
    }

    interval(4000).pipe(
      takeUntil(
        this.unityService.hasGame$(this.deployContext)
      )
    ).subscribe(hasGame => this.hasGame.emit("true"));
  }
}
