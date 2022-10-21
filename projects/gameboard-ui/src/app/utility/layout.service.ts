import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  public stickyMenu$ = new Subject<boolean>();
}
