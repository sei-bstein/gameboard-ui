// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { Challenge } from './board-models';
import { UserReport, PlayerReport, SponsorReport, GameSponsorReport, ChallengeReport, ChallengeDetailReport } from './report-models';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public userReport(): Observable<UserReport> {
    return this.http.get<UserReport>(`${this.url}/report/userstats`);
  }

  public playerReport(): Observable<PlayerReport> {
    return this.http.get<PlayerReport>(`${this.url}/report/playerstats`);
  }

  public sponsorReport(): Observable<SponsorReport> {
    return this.http.get<SponsorReport>(`${this.url}/report/sponsorstats`);
  }

  public gameSponsorReport(id: string): Observable<GameSponsorReport> {
    return this.http.get<GameSponsorReport>(`${this.url}/report/gamesponsorstats/${id}`);
  }

  public challengeReport(id: string): Observable<ChallengeReport> {
    return this.http.get<ChallengeReport>(`${this.url}/report/challengestats/${id}`);
  }

  public challengeDetails(id: string): Observable<ChallengeDetailReport> {
    return this.http.get<ChallengeDetailReport>(`${this.url}/report/challengedetails/${id}`);
  }

  public getSponsorLogoUrl(logo: string): string {
    const logoUrl = logo
      ? `${this.config.imagehost}/${logo}`
      : `${this.config.basehref}assets/sponsor.svg`
      ;
    return logoUrl;
  }
}
