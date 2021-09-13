// Copyright 2021 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ConfigService } from '../utility/config.service';
import { Announcement, ApiUser, ChangedUser, NewUser, TreeNode } from './user-models';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = '';

  constructor(
    private http: HttpClient,
    private config: ConfigService
  ) {
    this.url = config.apphost + 'api';
  }

  public list(filter: any): Observable<ApiUser[]> {
    return this.http.get<ApiUser[]>(this.url + '/users', {params: filter}).pipe(
      map(r => {
        r.forEach(u => this.transform(u));
        return r;
      })
    );
  }
  public retrieve(id: string): Observable<ApiUser> {
    return this.http.get<ApiUser>(`${this.url}/user/${id}`).pipe(
      map(r => this.transform(r))
    );
  }
  public create(model: NewUser): Observable<ApiUser> {
    return this.http.post<ApiUser>(`${this.url}/user`, model).pipe(
      map(r => this.transform(r))
    );
  }
  public update(model: ChangedUser): Observable<any> {
    return this.http.put<any>(`${this.url}/user`, model).pipe(
      map(() => this.transform(model as ApiUser))
    );
  }
  public delete(id: string): Observable<any> {
    return this.http.delete<any>(`${this.url}/user/${id}`);
  }
  public register(model: NewUser, authorization: string): Observable<ApiUser> {
    model.id = model.sub;
    return this.http.post<ApiUser>(`${this.url}/user`, model, {headers: {authorization}} ).pipe(
      map(r => this.transform(r))
    );
  }
  public logout(): Observable<any> {
    return this.http.post<any>(`${this.url}/user/logout`, null);
  }
  public ticket(): Observable<any> {
    return this.http.post<any>(`${this.url}/user/ticket`, null);
  }

  public getDocs(): Observable<TreeNode> {
    return this.http.get<string[]>(`${this.url}/docs`).pipe(
      map(r => this.mapToTree(r))
    );
  }

  public announce(model: Announcement): Observable<any> {
    return this.http.post<any>(`${this.url}/announce`, model);
  }

  private mapToTree(list: string[]): TreeNode {
    const root: TreeNode = {name: '', path: `${this.config.apphost}doc`, folders: [], files: []};
    list.forEach(f => {
      let path = f.split('/');
      path.shift();
      this.toNode(root, path);
    });
    return root;
  }
  private toNode(node: TreeNode, path: string[]): void {
    console.log(path.join('/'));

    if (path.length === 1) {
      node.files.push(path[0]);
      return;
    }
    const name = path.shift() || '';
    let folder = node.folders.find(n => n.name === name);
    if (!folder) {
      folder = {name, path: `${node.path}/${name}`, folders: [], files: []};
      node.folders.push(folder);
    }

    this.toNode(folder, path);
  }

  private transform(user: ApiUser): ApiUser {
    user.sponsorLogo = user.sponsor
      ? `${this.config.imagehost}/${user.sponsor}`
      : `${this.config.basehref}assets/sponsor.svg`
    ;

    if (!user.nameStatus && user.approvedName !== user.name) {
      user.nameStatus = 'pending';
    }

    user.pendingName = user.approvedName !== user.name
      ? user.name + (!!user.nameStatus ? `...${user.nameStatus}` : '...pending')
      : ''
    ;

    user.roleTag = user.role.split(', ')
      .map(a => a.substring(0, 1).toUpperCase() + (a.startsWith('d') ? a.substring(1, 2) : ''))
      .join('')
    ;
    return user;
  }
}
