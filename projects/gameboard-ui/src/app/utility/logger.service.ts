import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService<T> {
  public logInfo(info: any)
  {
    let logMessage = info
    if (typeof(info) === "object") {
      
    }
  }
}
