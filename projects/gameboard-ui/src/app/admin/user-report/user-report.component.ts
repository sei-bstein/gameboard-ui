// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { faTrash, faList, faSearch, faFilter, faCheck, faTintSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, interval, merge, Observable } from 'rxjs';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { Search } from '../../api/models';
import { ReportService } from '../../api/report.service';
import { UserReport, PlayerReport } from '../../api/report-models';
import { environment } from '../../../environments/environment';
import { debug } from 'console';

@Component({
  selector: 'app-user-report',
  templateUrl: './user-report.component.html',
  styleUrls: ['./user-report.component.scss']
})
export class UserReportComponent implements OnInit {
  users?: UserReport;
  players?: PlayerReport;
  totalUserCount = 0;
  errorMessage = "";
  url = '';

  faArrowLeft = faArrowLeft;

  constructor(
    private api: ReportService,
    private platform: PlatformLocation
  ) {
    this.url = environment.settings.apphost;

    this.api.userReport().subscribe(
      r => {
        this.users = r;
        this.totalUserCount = r.enrolledUserCount + r.unenrolledUserCount;
      }
    );

    this.api.playerReport().subscribe(
      r => {
        this.players = r;
      }
    );
  }

  ngOnInit(): void {
  }

  downloadUserDetailsReport() {
    this.api.exportUserStats();
  }

  downloadPlayerDetailsReport() {
    this.api.exportPlayerStats();
  }
}
