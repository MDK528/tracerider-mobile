import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";

interface Point {
  latitude: number;
  longitude: number;
}

interface Props {
  pickup: Point;
  drop?: Point | null;
}

export interface MapPreviewRef {
  updateDriverLocation: (point: Point) => void;
}

export const MapPreview = forwardRef<MapPreviewRef, Props>(({ pickup, drop }, ref) => {
  const webviewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    updateDriverLocation: (point: Point) => {
      webviewRef.current?.injectJavaScript(
        `window.updateDriverMarker(${point.latitude}, ${point.longitude}); true;`
      );
    },
  }));

  const html = useMemo(() => {
    const dropScript = drop
      ? `
        L.marker([${drop.latitude}, ${drop.longitude}], { icon: greenIcon }).addTo(map);
        L.polyline(
          [[${pickup.latitude}, ${pickup.longitude}], [${drop.latitude}, ${drop.longitude}]],
          { color: '#16191A', weight: 3 }
        ).addTo(map);
        bounds.extend([${drop.latitude}, ${drop.longitude}]);
        map.fitBounds(bounds, { padding: [40, 40] });
      `
      : `map.setView([${pickup.latitude}, ${pickup.longitude}], 14);`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var blueIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41]
    });
    var greenIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41]
    });
    var redIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.6.0/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41]
    });

    var bounds = L.latLngBounds([${pickup.latitude}, ${pickup.longitude}], [${pickup.latitude}, ${pickup.longitude}]);
    L.marker([${pickup.latitude}, ${pickup.longitude}], { icon: blueIcon }).addTo(map);
    ${dropScript}

    var driverMarker = null;
    window.updateDriverMarker = function(lat, lng) {
      if (!driverMarker) {
        driverMarker = L.marker([lat, lng], { icon: redIcon }).addTo(map);
      } else {
        driverMarker.setLatLng([lat, lng]);
      }
    };
  </script>
</body>
</html>
    `;
  }, [pickup.latitude, pickup.longitude, drop?.latitude, drop?.longitude]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webviewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
      />
    </View>
  );
});