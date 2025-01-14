// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../utility/config.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {

  appname = '';

  constructor(
    config: ConfigService
  ) {
    this.appname = config.settings.appname || 'Gameboard';
  }

  ngOnInit(): void {
  }

}
