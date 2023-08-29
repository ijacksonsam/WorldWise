import styles from "./Map.module.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useCities } from "../contexts/CitiesContext";
import { flagemojiToPNG } from "../utils";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import Button from "./Button";
import { useUrlPosition } from "../hooks/useUrlPosition";

function findCenterOfCities(cities) {
  if (cities.length === 0) return [40, 0];
  const sumArr = [0.0, 0.0];
  for (const city of cities) {
    sumArr[0] += parseFloat(city.position.lat);
    sumArr[1] += parseFloat(city.position.lng);
  }
  return [sumArr[0] / cities.length, sumArr[1] / cities.length];
}

function Map() {
  const { cities } = useCities();
  const [mapLat, mapLng] = useUrlPosition();
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const {
    isLoading: isLoadingPosition,
    position: geoLocationPosition,
    getPosition,
  } = useGeolocation();

  useEffect(
    function () {
      setMapPosition(findCenterOfCities(cities));
    },
    [cities]
  );

  useEffect(
    function () {
      if (mapLat && mapLng) {
        setMapPosition([mapLat, mapLng]);
      }
    },
    [mapLat, mapLng, cities]
  );

  useEffect(
    function () {
      if (geoLocationPosition) {
        setMapPosition([geoLocationPosition.lat, geoLocationPosition.lng]);
      }
    },
    [geoLocationPosition]
  );

  return (
    <div className={styles.mapContainer}>
      {!geoLocationPosition && (
        <Button type={"position"} onClick={getPosition}>
          {!isLoadingPosition ? "use your position" : "loading..."}
        </Button>
      )}
      <MapContainer
        center={mapPosition}
        zoom={5}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{flagemojiToPNG(city.emoji)}</span> {city.cityName}
            </Popup>
          </Marker>
        ))}
        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}

function ChangeCenter({ position }) {
  const map = useMap();
  useEffect(
    function () {
      map.setView(position);
    },
    [map, position]
  );
  return null;
}

function DetectClick() {
  const navigate = useNavigate();
  useMapEvents({
    click: (e) => {
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}

export default Map;
