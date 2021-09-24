// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface UserReport {
  title: string ;
  timestamp: Date;
  enrolledUserCount: number;
  unenrolledUserCount: number;
}

export interface PlayerReport {
  title: string;
  timestamp: Date;
  stats: PlayerStat[];
}

export interface PlayerStat {
  gameId: string;
  gameName: string;
  playerCount: number;
}

export interface SponsorReport {
  title: string;
  timestamp: Date;
  stats: SponsorStat[];
}

export interface SponsorStat {
  id: string;
  name: string;
  logo: string;
  count: number;
  teamCount: number;
}

export interface GameSponsorReport {
  title: string;
  timestamp: Date;
  stats: GameSponsorStat[];
}

export interface GameSponsorStat {
  gameId: string; 
  gameName: string;
  stats: SponsorStat[];
}

export interface ChallengeReport {
  title: string;
  timestamp: Date;
  stats: ChallengeStat[];
}

export interface ChallengeStat {
  id: string;
  name: string;
  tag: string;
  points: number;
  successCount: number;
  partialCount: number;
  averageTime: string;
  attemptCount: number;
}


