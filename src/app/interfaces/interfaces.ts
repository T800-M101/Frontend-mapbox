export interface Place {
    id: string;
    name: string;
    lng: number;
    lat: number
    color: string;
}

export interface MarkersResponse {
     [key: string]: Place 
}