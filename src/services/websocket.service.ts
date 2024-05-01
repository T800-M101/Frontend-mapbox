import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socketStatus = false;

  constructor(private socket: Socket, private router: Router) {
    this.checkstatus();
   }

// Check server status
  checkstatus() {
    this.socket.on('connect', () => {
      console.log('Connected to server!');
      this.socketStatus = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server!');
      this.socketStatus = false;
    });
  }

  // Emit('event', payload?, callback?)
  emit( event: string, payload?:any, callback?: Function) {
    this.socket.emit( event, payload, callback);
  }


// Listen to server events
   listen(event: string): any {
    return this.socket.fromEvent( event);
  }


}
