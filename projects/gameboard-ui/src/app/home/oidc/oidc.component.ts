// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'oidc-client';
import { asyncScheduler, from, scheduled, timer } from 'rxjs';
import { concatAll, delay, filter, map, switchMap, tap, zipAll } from 'rxjs/operators';
import { AuthService, AuthTokenState } from '../../utility/auth.service';

@Component({
  selector: 'app-oidc',
  templateUrl: './oidc.component.html',
  styleUrls: ['./oidc.component.scss']
})
export class OidcComponent implements OnInit {
  message = '';

  constructor(
    auth: AuthService,
    router: Router
  ) {

    auth.externalLoginCallback().then(
      (user) => {
        timer(500).subscribe(() => {
          router.navigateByUrl(user.state || '/');
        });
      },
      (err) => {
        console.log(err);
        this.message = (err.error || err).message;
      }
    );
  }

  ngOnInit(): void {
  }

}
