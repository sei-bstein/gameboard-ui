// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, ViewChild } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { faTrash, faList, faSearch, faFilter, faCheck, faTintSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { ReportService } from '../../api/report.service';
import { environment } from '../../../environments/environment';
import { debug } from 'console';
import { FormGroup, NgForm } from '@angular/forms';
import { Game } from '../../api/game-models';
import { GameService } from '../../api/game.service';
import { ChallengeReport, ChallengeDetailReportView } from '../../api/report-models';

@Component({
  selector: 'app-challenge-report',
  templateUrl: './challenge-report.component.html',
  styleUrls: ['./challenge-report.component.scss']
})
export class ChallengeReportComponent implements OnInit {
  @ViewChild(NgForm) form!: FormGroup;
  games?: Game[];
  currentGame?: Game;
  challengeReport?: ChallengeReport;
  search: Search = { term: '' };
  url = '';
  faArrowLeft = faArrowLeft;
  faList = faList;
  challengeDetailReports: { [id: string]: ChallengeDetailReportView } = {};

  constructor(
    private api: ReportService,
    private gameService: GameService,
    private platform: PlatformLocation
  ) {
    this.url = environment.settings.apphost;

    this.gameService.list(this.search).subscribe(
      r => {
        this.games = r;
        if (this.games.length > 0) {
          this.currentGame = this.games[0];

          this.api.challengeReport(this.currentGame.id).subscribe(
            r => {
              this.challengeReport = r;
            }
          );
        }
      }
    );
  }

  ngOnInit(): void {
  }

  view(id: string): void {
    if (!this.challengeDetailReports[id]) {
      this.api.challengeDetails(id).subscribe(r => {          
          this.challengeDetailReports[r.challengeId] = r as ChallengeDetailReportView;
          this.challengeDetailReports[r.challengeId].visible = true;          
      });
    }
    else {
      this.challengeDetailReports[id].visible = !this.challengeDetailReports[id].visible;
    }
  }

  updateGame(id: string) {
    if (this.games) {
      this.currentGame = this.games.find(g => g.id === id);

      if (this.currentGame) {
        this.api.challengeReport(this.currentGame.id).subscribe(
          r => {
            this.challengeReport = r;
          }
        );
      }
    }
  }
}
