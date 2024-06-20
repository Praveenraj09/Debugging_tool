import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { makeStyles } from '@mui/styles';
import L from 'leaflet';
import { Grid, Card, CardContent, CardHeader } from '@mui/material';
import Navbar from './Navbar';
import { Polygon,Circle } from 'react-leaflet';
const useStyles = makeStyles({
  map: {
    height: '100vh',
    width: '100%',
  },
});const MapView = () => {
  const classes = useStyles();
  const [mapLayers, setMapLayers] = useState([]);
  useEffect(() => {
    const locations = [
      { type: 'marker', latitude: 51.505, longitude: -0.09, label: 'Location 1' },
      { type: 'marker', latitude: 51.51, longitude: -0.1, label: 'Location 2' },
      { type: 'marker', latitude: 51.49, longitude: -0.08, label: 'Location 3' },
      { type: 'marker', latitude: 51.49, longitude: -0.18, label: 'Location 4' },
      {
        type: 'circle',
        center: { lat: 51.5, lng: -0.15 },
        radius: 500, // in meters
      },
      {
        type: 'polygon',
        points: [
         
          { lat: 51.505, lng: -0.19 },
          { lat: 51.49, lng: -0.18 },
          { lat: 51.49, lng: -0.28 },
          { lat: 51.51, lng: -0.2 },
        ],
      },
    ];
  
    const mapLayers = locations.map((location, index) => {
      if (location.type === 'marker') {
        return (
          <Marker
            key={index}
            position={[location.latitude, location.longitude]}
            icon={defaultIcon}
          >
            <Popup>{location.label}</Popup>
          </Marker>
        );
      } else if (location.type === 'circle') {
        return (
          <Circle
            key={index}
            center={[location.center.lat, location.center.lng]}
            radius={location.radius}
          />
        );
      } else if (location.type === 'polygon') {
        return (
          <Polygon
            key={index}
            positions={location.points.map(({ lat, lng }) => [lat, lng])}
            color="blue"
            fillColor="blue"
            fillOpacity={0.4}
          />
        );
      }
      return null;
    });
  
    setMapLayers(mapLayers);
  }, []);
  

  const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <Grid>
      <Navbar />
      <Card>
        <CardHeader />
        <CardContent>
          <MapContainer center={[51.505, -0.09]} zoom={13} className={classes.map}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution=""
            />
            {mapLayers}
          </MapContainer>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default MapView;
