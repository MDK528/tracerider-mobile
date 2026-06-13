import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import { getSocket } from "@/services/socket";
import {
  acceptRide,
  cancelRide,
  completeRide,
  getAvailableRequests,
  getMyActiveRide,
  markArriving,
  rejectRide,
  verifyOtp,
} from "@/services/bookings";
import type { Booking } from "@/types/bookings";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DriverRides() {
  const [rideLoading, setRideLoading] = useState(false);
  const [availableRequests, setAvailableRequests] = useState<Booking[]>([]);
  const [activeRide, setActiveRide] = useState<Booking | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAvailableRequests = useCallback(async () => {
    try {
      const data = await getAvailableRequests();
      setAvailableRequests(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load ride requests.");
      setModalVisible(true);
    }
  }, []);

  const fetchActiveRide = useCallback(async () => {
    try {
      const data = await getMyActiveRide();
      setActiveRide(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load your active ride.");
      setModalVisible(true);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setRideLoading(true);
    await Promise.all([fetchAvailableRequests(), fetchActiveRide()]);
    setRideLoading(false);
  }, [fetchAvailableRequests, fetchActiveRide]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  // Emit live location every ~3s while there's an active ride
  useEffect(() => {
    const trackableStatuses: Booking["status"][] = ["driver_assigned", "driver_arriving", "in_progress"];
    if (!activeRide || !trackableStatuses.includes(activeRide.status)) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;

      const socket = await getSocket();
      if (cancelled) return;

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          socket.emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATE, {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            rideId: activeRide.id,
          });
        }
      );
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [activeRide?.id, activeRide?.status]);

  async function handleAcceptRide(rideId: string) {
    setRideLoading(true);
    try {
      await acceptRide(rideId);
      await fetchAll();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to accept ride.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  async function handleRejectRide(rideId: string) {
    setRideLoading(true);
    try {
      await rejectRide(rideId);
      await fetchAvailableRequests();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to reject ride.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!activeRide || otpValue.length !== 4) return;

    setOtpSubmitting(true);
    try {
      await verifyOtp(activeRide.id, otpValue.trim());
      setOtpValue("");
      await fetchAll();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Invalid OTP.");
      setModalVisible(true);
    } finally {
      setOtpSubmitting(false);
    }
  }

  async function handleMarkArriving(rideId: string) {
    setRideLoading(true);
    try {
      await markArriving(rideId);
      await fetchActiveRide();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to mark arriving.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  async function handleCompleteRide(rideId: string) {
    setRideLoading(true);
    try {
      await completeRide(rideId);
      await fetchAll();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to complete ride.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  async function handleCancelRide(rideId: string) {
    setRideLoading(true);
    try {
      await cancelRide(rideId);
      await fetchAll();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to cancel ride.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Rides
          </Text>
          <Text variant="body-md" color="secondary">
            Accept new requests and manage your active trips.
          </Text>
        </View>

        <View className="px-6 gap-4 mb-6">
          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <Text variant="heading-sm" weight="bold">
              Available ride requests
            </Text>
            {rideLoading ? (
              <ActivityIndicator size="small" color={Colors.dark} />
            ) : availableRequests.length ? (
              availableRequests.map((ride) => (
                <View key={ride.id} className="rounded-2xl bg-dark p-4">
                  <Text variant="body-sm" color="white" className="mb-1">
                    {ride.pickupCity} → {ride.dropLocation}
                  </Text>
                  <Text variant="body-md" weight="semibold" color="white" className="mb-3">
                    ₹ {ride.fareAmount / 100} • {ride.paymentMethod}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Button
                        label="Accept"
                        variant="secondary"
                        size="sm"
                        loading={rideLoading}
                        onPress={() => handleAcceptRide(ride.id)}
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        label="Reject"
                        variant="danger"
                        size="sm"
                        loading={rideLoading}
                        onPress={() => handleRejectRide(ride.id)}
                      />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text variant="body-sm" color="secondary">
                No available ride requests at the moment.
              </Text>
            )}
          </View>

          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <Text variant="heading-sm" weight="bold">
              Active ride
            </Text>
            {rideLoading ? (
              <ActivityIndicator size="small" color={Colors.dark} />
            ) : activeRide ? (
              <View className="rounded-2xl bg-dark p-4">
                <Text variant="body-sm" color="white" className="mb-1">
                  {activeRide.pickupCity} → {activeRide.dropLocation}
                </Text>
                <Text variant="body-md" weight="semibold" color="white" className="mb-2">
                  Status: {activeRide.status}
                </Text>
                {activeRide.status === "driver_arriving" && (
                  <View className="gap-2 mb-3">
                    <Input
                      placeholder="Enter passenger OTP"
                      value={otpValue}
                      onChangeText={setOtpValue}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Button
                      label="Verify OTP & start ride"
                      variant="secondary"
                      size="sm"
                      loading={otpSubmitting}
                      disabled={otpValue.length !== 4}
                      onPress={handleVerifyOtp}
                    />
                  </View>
                )}
                <View className="flex-row gap-2 flex-wrap">
                  {activeRide.status === "driver_assigned" && (
                    <Button
                      label="Arriving"
                      variant="secondary"
                      size="sm"
                      loading={rideLoading}
                      onPress={() => handleMarkArriving(activeRide.id)}
                    />
                  )}
                  {activeRide.status === "in_progress" && (
                    <Button
                      label="Complete"
                      variant="primary"
                      size="sm"
                      loading={rideLoading}
                      onPress={() => handleCompleteRide(activeRide.id)}
                    />
                  )}
                  {(activeRide.status === "driver_assigned" || activeRide.status === "driver_arriving") && (
                    <Button
                      label="Cancel"
                      variant="danger"
                      size="sm"
                      loading={rideLoading}
                      onPress={() => handleCancelRide(activeRide.id)}
                    />
                  )}
                </View>
              </View>
            ) : (
              <Text variant="body-sm" color="secondary">
                No active ride currently.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <ErrorModal
        visible={modalVisible}
        message={errorMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}