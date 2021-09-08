// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { ReportService } from '../../api/report.service';
import { TeamReport } from '../../api/report-models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'team-report',
  templateUrl: './team-report.component.html',
  styleUrls: ['./team-report.component.scss']
})
export class TeamReportComponent implements OnInit {
  teamReport?: TeamReport;
  url = '';
  faArrowLeft = faArrowLeft;

  constructor(
    private api: ReportService,
    private platform: PlatformLocation
  ) {
    this.url = environment.settings.apphost;

    this.api.teamReport().subscribe(
      r => {
        this.teamReport = r;
      }
    );
  }

  ngOnInit(): void {
  }
}
