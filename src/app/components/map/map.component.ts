import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MarkersResponse, Place } from '../../interfaces/interfaces';
import { HttpClient } from '@angular/common/http';
import { WebsocketService } from '../../../services/websocket.service';



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit {

  map!: mapboxgl.Map;

  places: MarkersResponse = {};

  mapboxMarkers: { [id:string]: mapboxgl.Marker} = {};

  constructor(private http: HttpClient, private wsService: WebsocketService) { }


  ngOnInit(): void {
    this.http.get<MarkersResponse>('http://localhost:5000/api/map').subscribe((places: MarkersResponse) => {
      this.places = places;
      this.createMap();
      for (const [key, marker] of Object.entries(this.places)) {
        this.addMarker(marker);
      }
    });
    this.listenSockets();

  }

  listenSockets(): void {
    // new markers
    this.wsService.listen('new-marker').subscribe((marker: Place) => {
      this.addMarker(marker);
    });

    // move-marker
    this.wsService.listen('move-marker').subscribe((marker: Place) => {
      this.mapboxMarkers[marker.id].setLngLat([marker.lng, marker.lat]);
    });

    //remove-marker
    this.wsService.listen('remove-marker').subscribe((id: string) => {
      this.mapboxMarkers[id].remove();
      delete this.mapboxMarkers[id];
    });
  }

  createMap(): void {
    this.map = new mapboxgl.Map({
      accessToken: 'pk.eyJ1IjoibWVtb21vcmFuIiwiYSI6ImNsdm56ZG13cDBpbDAyam1zemI3bnptcmcifQ.rB5yeUWSFaPtSjfxPRCGqA',
      container: 'map', // the container id in html
      style: 'mapbox://style/mapbox/streets-v11',
      center: [-75.75512993582937, 45.349977429009954], // lng, lat
      zoom: 15.8
    });
  }

  addMarker(markerData: Place): void {
    // Create div for new marker
    const div = document.createElement('div');

    // Create h2 for new marker
    const h2 = document.createElement('h2');
    h2.innerHTML = markerData.name;

    // Create button erase for new marker
    const btnErase = document.createElement('button');
    btnErase.innerHTML = 'Erase';
    // Add event listener to button
    btnErase.addEventListener('click', () => {
      marker.remove();
      // TO DO: Remove marker by socket
      this.wsService.emit('remove-marker', markerData.id);   
    });
    
    // Append all HTML elements
    div.append(h2, btnErase);
    
    const customPopup = new mapboxgl.Popup({
      offset: 25,
      closeOnClick: false
    }).setDOMContent(div);
    
    const marker = new mapboxgl.Marker({
      draggable: true,
      color: markerData.color,
    }).setPopup(customPopup)
    .setLngLat([markerData.lng, markerData.lat])
      .addTo(this.map);
      
    // Get referneces of markers
    this.mapboxMarkers[markerData.id] = marker; 

    marker.on('drag', () => {
      const lngLat = marker.getLngLat();
      marker.setLngLat(lngLat);
      const newMarker = {
        id: markerData.id,
        ...lngLat
      }
     // TO DO: Emmit coordinates with socket
      this.wsService.emit('move-marker', newMarker );   
    });
  }


  createMarker(): void {
    const customMarket: Place = {
      id: new Date().toISOString(),
      name: 'unknown',
      lng: -75.75512993582937,
      lat: 45.34794635758547,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    }

    this.addMarker(customMarket);

    // Emit marker
    this.wsService.emit('new-marker', customMarket);
  }
}
