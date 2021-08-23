// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Team } from '../../api/player-models';
import { PlayerService } from '../../api/player.service';

@Component({
  selector: 'app-player-session',
  templateUrl: './player-session.component.html',
  styleUrls: ['./player-session.component.scss']
})
export class PlayerSessionComponent implements OnInit {
  @Input() id = '';
  team$!: Observable<Team>;

  constructor(
    private api: PlayerService
  ) { }

  ngOnInit(): void {
    this.team$ = this.api.getTeam(this.id);
  }

}
