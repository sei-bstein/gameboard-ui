// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { faOpenid } from '@fortawesome/free-brands-svg-icons';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../../auth.service';
import { ConfigService } from '../../config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  authority: string | undefined;
  faOpenid = faOpenid;
  working = false;

  constructor(
    private auth: AuthService,
  ) {
    this.authority = auth.authority;
  }

  ngOnInit(): void {
  }

  login(): void {
    this.working = true;
    this.auth.externalLogin(this.auth.redirectUrl);
  }

}
