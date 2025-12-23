import 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map from 'react-map-gl';
import CustomMarker from '../components/customMaker';

export default function MapaPrincipal({ mainMapView, setMainMapView, markers, setPopupInfo, TOKEN, onMarkerClick }) {
  return (
    <Map
      {...mainMapView}
      onMove={(evt) => setMainMapView(evt.viewState)}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/sergio116/cme6j20dn00z501s7ed5lbeyu"
      mapboxAccessToken={TOKEN}
      projection="globe"
    >
      {markers.map((marker) => (
        <CustomMarker
          key={marker.id}
          longitude={marker.longitude}
          latitude={marker.latitude}
          color={marker.color}
          imgSrc={marker.imgSrc}
          onClick={() => {
            if (onMarkerClick) {
              onMarkerClick(marker);
            } else {
              setPopupInfo(marker);
            }
          }}
        />
      ))}
    </Map>
  );
}
