import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnityBoardComponent } from './unity-board/unity-board.component';
import { UtilityModule } from '../utility/utility.module';
import { UnityTeamLeaderWaitingRoomComponent } from './unity-team-leader-waiting-room/unity-team-leader-waiting-room.component';



@NgModule({
  declarations: [
    UnityBoardComponent,
    UnityTeamLeaderWaitingRoomComponent
  ],
  imports: [CommonModule, UtilityModule],
  exports: [UnityBoardComponent]
})
export class UnityModule { }
