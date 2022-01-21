// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../api/user.service';

@Component({
  selector: 'app-announce',
  templateUrl: './announce.component.html',
  styleUrls: ['./announce.component.scss']
})
export class AnnounceComponent implements OnInit {
  @Input() teamId = '';
  message = '';
  faSend = faPaperPlane;
  errors: any[] = [];

  constructor(
    private api: UserService
  ) { }

  ngOnInit(): void {
  }

  announce(): void {
    if (!this.message) {
      return;
    }

    this.api.announce({
      teamId: this.teamId,
      message: this.message
    }).subscribe(
      () => {},
      (err) => this.errors.push(err)
    );

  }
}
