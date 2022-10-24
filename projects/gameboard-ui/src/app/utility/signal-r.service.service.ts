import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState } from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRServiceService {
  private _hubUrl: string | null = null;
  private _hubConnection: HubConnection | null = null;

  constructor () { }

  public create(identifier: string) {
    this._hubUrl = `/hubs/${identifier}`;
    this._hubConnection = this.buildConnection();
  }

  private buildConnection(): HubConnection {
    const connection = new HubConnectionBuilder()
      .withUrl(this._hubUrl!, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .configureLogging(LogLevel.Information)
      .build();

    connection.onclose(err => {
      if (err) {
        console.log("SignalR error", err);
      }
    });

    return connection;
  }
}
