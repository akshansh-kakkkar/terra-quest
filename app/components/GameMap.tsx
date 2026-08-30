"use client";

import { LatLng, LatLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMapEvents } from "react-leaflet";
type GameMapProps = {
    onLocationSelect : (location: LatLng)=>void;
    selectedLocation : LatLng | null;
    actualLocation : LatLng | null;
}

function MapClickHandler({onLocationSelect,} : {onLocationSelect : (location : LatLng)=>void} ){
    useMapEvents({
        click(event){
            onLocationSelect(event.latlng);
        },
    });
    return null;
}

export default function GameMap({onLocationSelect, selectedLocation, actualLocation} : GameMapProps){
    const worldBounds = new LatLngBounds(
        [-85, -180],
        [85, 180]
    )
    return(
        <MapContainer
        center={[20,0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        maxBounds={worldBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full">
            <TileLayer 
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={onLocationSelect} />
            {selectedLocation && (
                <CircleMarker center={selectedLocation} radius={8} pathOptions={{
                    color : "white",
                    fillColor : "red",
                    fillOpacity : 1,
                }} />
            )}
            {actualLocation && (
                <CircleMarker
                center={actualLocation}
                radius={8} 
                pathOptions={{
                    color : "white",
                    fillColor : "lime",
                    fillOpacity : 1,
                }}/>
            )}
            {
                selectedLocation && actualLocation && (
                    <Polyline
                        positions={[selectedLocation, actualLocation]}
                        pathOptions={{
                            color : "black",
                            weight : 3,
                        }}
                    />
                )
            }
        </MapContainer>
    )
}