import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import { getSocket, SOCKET_URL } from "@/services/socket";
import { cancelRide, getBooking, getShareToken } from "@/services/bookings";
import { getPublicDriverProfile } from "@/services/driver";
import type { Booking } from "@/types/bookings";
import type { PublicDriverProfile } from "@/types/driver";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Share, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const CANCELLABLE_STATUSES: Booking["status"][] = ["requested", "driver_assigned", "driver_arriving"];

const STATUS_LABELS: Record<Booking["status"], string> = {
  requested: "Looking for a driver...",
  driver_assigned: "Driver assigned",
  driver_arriving: "Driver is arriving",
  otp_verified: "OTP verified",
  in_progress: "Ride in progress",
  completed: "Ride completed",
  cancelled: "Ride cancelled",
};

interface LiveLocation {
  latitude: number;
  longitude: number;
}

function LiveMap({ booking, driverLocation }: { booking: Booking; driverLocation: LiveLocation | null }) {
  const webviewRef = useRef<WebView>(null);

  // Inject driver marker update whenever driverLocation changes
  useEffect(() => {
    if (!driverLocation) return;
    webviewRef.current?.injectJavaScript(
      `window.updateDriver(${driverLocation.latitude}, ${driverLocation.longitude}); true;`
    );
  }, [driverLocation]);

  const html = useMemo(() => {
    const driverScript = driverLocation
      ? `
        window.driverMarker = L.marker([${driverLocation.latitude}, ${driverLocation.longitude}], { icon: redIcon }).addTo(map);
        bounds.extend([${driverLocation.latitude}, ${driverLocation.longitude}]);
      `
      : "";

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

    var bounds = L.latLngBounds(
      [${booking.pickupLat}, ${booking.pickupLng}],
      [${booking.dropLat}, ${booking.dropLng}]
    );

    L.marker([${booking.pickupLat}, ${booking.pickupLng}], { icon: blueIcon }).addTo(map).bindPopup('Pickup');
    L.marker([${booking.dropLat}, ${booking.dropLng}], { icon: greenIcon }).addTo(map).bindPopup('Drop');
    L.polyline(
      [[${booking.pickupLat}, ${booking.pickupLng}], [${booking.dropLat}, ${booking.dropLng}]],
      { color: '#16191A', weight: 3 }
    ).addTo(map);

    ${driverScript}

    map.fitBounds(bounds, { padding: [40, 40] });

    window.updateDriver = function(lat, lng) {
      if (!window.driverMarker) {
        window.driverMarker = L.marker([lat, lng], { icon: redIcon }).addTo(map);
      } else {
        window.driverMarker.setLatLng([lat, lng]);
      }
      map.panTo([lat, lng]);
    };
  </script>
</body>
</html>
    `;
  }, [booking.pickupLat, booking.pickupLng, booking.dropLat, booking.dropLng]);

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      source={{ html }}
      style={{ flex: 1 }}
      scrollEnabled={false}
    />
  );
}

export default function RideTracking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [driver, setDriver] = useState<PublicDriverProfile | null>(null);
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getBooking(id);
      setBooking(data);

      if (data.driverId) {
        try {
          const driverData = await getPublicDriverProfile(data.driverId);
          setDriver(driverData);
        } catch {}
      }

      if (data.status === "completed" || data.status === "cancelled") {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load ride details.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Poll booking status every 5s
  useFocusEffect(
    useCallback(() => {
      fetchBooking();
      pollRef.current = setInterval(fetchBooking, 5000);
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [fetchBooking])
  );

  // Live driver location via socket
  useEffect(() => {
    let active = true;

    (async () => {
      const socket = await getSocket();
      if (!active) return;

      socket.on(SOCKET_EVENTS.DRIVER_LOCATION, (payload: { lat: number; lng: number }) => {
        setDriverLocation({ latitude: payload.lat, longitude: payload.lng });
      });
    })();

    return () => {
      active = false;
      getSocket().then((socket) => socket.off(SOCKET_EVENTS.DRIVER_LOCATION));
    };
  }, []);

  async function handleShare() {
    if (!booking) return;

    let trackingLine = "";
    try {
      const token = await getShareToken(booking.id);
      trackingLine = `\n\nTrack live: ${SOCKET_URL}/track/${token}`;
    } catch {}

    try {
      await Share.share({
        message:
          trackingLine,
      });
    } catch {}
  }

  async function handleCancel() {
    if (!booking) return;

    setCancelling(true);
    try {
      await cancelRide(booking.id, cancelReason.trim() || undefined);
      await fetchBooking();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to cancel ride.");
      setModalVisible(true);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color={Colors.dark} />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Text variant="body-md" color="secondary">Ride not found.</Text>
        <View className="mt-4 w-full">
          <Button label="Back to home" variant="outline" size="md" onPress={() => router.replace("/home")} />
        </View>
      </SafeAreaView>
    );
  }

  const isCancellable = CANCELLABLE_STATUSES.includes(booking.status);
  const isTerminal = booking.status === "completed" || booking.status === "cancelled";

  return (
    <View className="flex-1">
      {/* Full-screen map */}
      <View className="flex-1">
        <LiveMap booking={booking} driverLocation={driverLocation} />
      </View>

      {/* Bottom sheet */}
      <View className="bg-surface rounded-t-3xl border-t border-border px-6 pt-4 pb-8 max-h-[55%]">
        {/* Header row */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1 pr-3">
            <Text variant="heading-sm" weight="bold" color="primary">
              {STATUS_LABELS[booking.status]}
            </Text>
          </View>
          {!isTerminal && (
            <Button label="Share" variant="outline" size="sm" fullWidth={false} onPress={handleShare} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Route */}
          <View className="rounded-2xl bg-bg border border-border p-3 mb-3 gap-1">
            <Text variant="body-sm" color="secondary">From</Text>
            <Text variant="body-sm" weight="semibold" numberOfLines={1}>{booking.pickupLocation}</Text>
            <View className="h-px bg-border my-1" />
            <Text variant="body-sm" color="secondary">To</Text>
            <Text variant="body-sm" weight="semibold" numberOfLines={1}>{booking.dropLocation}</Text>
          </View>

          {/* Fare + payment */}
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 rounded-2xl bg-dark p-3">
              <Text variant="caption" color="white" className="mb-1">Fare</Text>
              <Text variant="body-md" weight="bold" color="white">₹ {booking.fareAmount / 100}</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-bg border border-border p-3">
              <Text variant="caption" color="secondary" className="mb-1">Payment</Text>
              <Text variant="body-md" weight="semibold">
                {booking.paymentMethod === "cash" ? "Cash" : "Razorpay"}
              </Text>
            </View>
          </View>

          {/* Driver info */}
          {driver && (
            <View className="rounded-2xl bg-bg border border-border p-3 mb-3">
              <Text variant="heading-md" color="primary" className="mb-1">Driver</Text>
              <Text variant="body-lg" weight="bold">{driver.fullName}</Text>
              <Text variant="body-lg" color="primary">{driver.vehicleModel} • {driver.vehicleNo}</Text>
              {
                (booking.status === "driver_assigned" || booking.status === "driver_arriving" || booking.status === "in_progress") && (
                  <Text variant="body-md" color="primary">{driver.phone}</Text>
                )
              }
            </View>
          )}

          {/* OTP display — passenger shows this to driver */}
          {booking.status === "driver_arriving" && booking.otp && (
            <View className="rounded-2xl bg-dark p-3 mb-3 items-center gap-1">
              <Text variant="body-sm" color="white">Show this OTP to your driver</Text>
              <Text variant="heading-md" weight="bold" color="white">{booking.otp}</Text>
            </View>
          )}

          {/* Terminal states */}
          {booking.status === "completed" && (
            <View className="mb-3">
              <Button label="Back to home" variant="primary" size="lg" onPress={() => router.replace("/home")} />
            </View>
          )}

          {booking.status === "cancelled" && (
            <View className="gap-2 mb-3">
              {booking.cancellationReason && (
                <Text variant="caption" color="secondary">Reason: {booking.cancellationReason}</Text>
              )}
              <Button label="Back to home" variant="primary" size="lg" onPress={() => router.replace("/home")} />
            </View>
          )}

          {/* Cancel */}
          {isCancellable && (
            <View className="gap-2 mb-3">
              <Input
                placeholder="Cancellation reason (optional)"
                value={cancelReason}
                onChangeText={setCancelReason}
              />
              <Button
                label="Cancel ride"
                variant="danger"
                size="lg"
                loading={cancelling}
                onPress={handleCancel}
              />
            </View>
          )}
        </ScrollView>
      </View>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </View>
  );
}