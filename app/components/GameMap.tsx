"use client";
import {motion} from "framer-motion"
import { LatLng, LatLngBounds } from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import { Coordinates } from '../game/types';
type GameMapProps = {
    onLocationSelect : (location: LatLng)=>void;
    selectedLocation : Coordinates | null;
    actualLocation : Coordinates | null;
    resultShown : boolean;
    distance : number | null;

}

function MapClickHandler({onLocationSelect, resultShown} : {onLocationSelect : (location : LatLng)=>void; resultShown : boolean} ){
    useMapEvents({
        click(event){
           if(resultShown) return;
            onLocationSelect(event.latlng);
        },
    });
    return null;
}

export default function GameMap({onLocationSelect, selectedLocation, actualLocation, resultShown, distance} : GameMapProps){
    const worldBounds = new LatLngBounds(
        [-60, -180],
        [85, 180]
    )
    return(
        <MapContainer
        center={[20,0]}
        zoom={4}
        minZoom={3}
        maxZoom={25}
        maxBounds={worldBounds}
        worldCopyJump={false}
        maxBoundsViscosity={1.0}
        className="h-full w-full">
            <TileLayer 
            noWrap={true}
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler resultShown={resultShown} onLocationSelect={onLocationSelect} />
            {selectedLocation && (
                <CircleMarker 
                center={selectedLocation} 
                radius={8} 
                pathOptions={{
                    color : "white",
                    fillColor : "#FFB4AB",
                    fillOpacity : 1,
                    weight : 3,

                }}>
                    <Tooltip permanent direction="top">
                        Your Guess
                    </Tooltip>
                </CircleMarker>
            )}
            {actualLocation && (
                <CircleMarker
                center={actualLocation}
                radius={10} 
                pathOptions={{
                    color : "white",
                    fillColor : "#00E639",
                    fillOpacity : 1,
                    weight : 3,
                    className:"actual-location-marker"
                }}>
                    <Tooltip permanent direction="top">
                        Actual Location
                    </Tooltip>
                </CircleMarker>
            )}
            {
                selectedLocation && actualLocation && distance !== null && (
                    <Polyline
                        positions={[selectedLocation, actualLocation]}
                        pathOptions={{
                            color : "black",
                            weight : 3,
                            dashArray : "8 8",
                            opacity : 0.8
                        }}>
                            <Tooltip permanent>
                                {distance.toFixed(1)}km
                            </Tooltip>
                        </Polyline>
                )
            }
        </MapContainer>
    )
}