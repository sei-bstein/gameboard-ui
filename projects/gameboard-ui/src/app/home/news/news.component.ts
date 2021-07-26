// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { TreeNode } from '../../api/user-models';
import { UserService } from '../../api/user.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  node!: TreeNode;
  stack: TreeNode[] = [];
  current!: TreeNode;
  currentFile = '';

  faFolder = faFolder;
  faFile = faFile;

  constructor(
    usersvc: UserService
  ) {
    usersvc.getDocs().subscribe(
      n => {
        this.node = n;
        this.current = n;
      }
    );
  }

  push(n: TreeNode): void {
    this.stack.push(this.current);
    this.current = n;
    this.currentFile = '';
  }

  pop(): void {
    this.current = this.stack.pop()!;
    this.currentFile = '';
  }

  show(f: string): void {
    this.currentFile = f;
  }

  ngOnInit(): void {
  }

}
