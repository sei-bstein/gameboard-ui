// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { faTrash, faList, faSearch, faFilter, faCheck, faTintSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { ReportService } from '../../api/report.service';
import { GameSponsorReport, SponsorReport, SponsorStat, } from '../../api/report-models';
import { environment } from '../../../environments/environment';
import { debug } from 'console';

@Component({
  selector: 'player-sponsor-user-report',
  templateUrl: './player-sponsor-report.component.html',
  styleUrls: ['./player-sponsor-report.component.scss']
})
export class PlayerSponsorReportComponent implements OnInit {
  gameSponsorReport?: GameSponsorReport;
  sponsors?: SponsorReport;
  sponsorStats?: SponsorStat[];
  url = '';

  faArrowLeft = faArrowLeft;

  constructor(
    private api: ReportService,
    private platform: PlatformLocation
  ) {
    this.url = environment.settings.apphost;

    this.api.gameSponsorReport().subscribe(
      r => {
        this.gameSponsorReport = r;
      }
    );

    this.api.sponsorReport().subscribe(
      r => {
        this.sponsors = r;
        this.sponsorStats = r.stats;
      }
    );
  }

  ngOnInit(): void {
  }
}
