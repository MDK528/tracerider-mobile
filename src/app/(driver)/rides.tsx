import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import {
  acceptRide,
  cancelRide,
  completeRide,
  getAvailableRequests,
  getMyRides,
  markArriving,
  rejectRide,
} from "@/services/bookings";
import type { Booking } from "@/types/bookings";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DriverRides() {
  const [rideLoading, setRideLoading] = useState(false);
  const [availableRequests, setAvailableRequests] = useState<Booking[]>([]);
  const [activeRides, setActiveRides] = useState<Booking[]>([]);
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

  const fetchActiveRides = useCallback(async () => {
    try {
      const data = await getMyRides();
      setActiveRides(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load your rides.");
      setModalVisible(true);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setRideLoading(true);
    await Promise.all([fetchAvailableRequests(), fetchActiveRides()]);
    setRideLoading(false);
  }, [fetchAvailableRequests, fetchActiveRides]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

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

  async function handleMarkArriving(rideId: string) {
    setRideLoading(true);
    try {
      await markArriving(rideId);
      await fetchActiveRides();
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
              Active rides
            </Text>
            {rideLoading ? (
              <ActivityIndicator size="small" color={Colors.dark} />
            ) : activeRides.length ? (
              activeRides.map((ride) => (
                <View key={ride.id} className="rounded-2xl bg-dark p-4">
                  <Text variant="body-sm" color="white" className="mb-1">
                    {ride.pickupCity} → {ride.dropLocation}
                  </Text>
                  <Text variant="body-md" weight="semibold" color="white" className="mb-2">
                    Status: {ride.status}
                  </Text>
                  <View className="flex-row gap-2 flex-wrap">
                    <Button
                      label="Arriving"
                      variant="secondary"
                      size="sm"
                      loading={rideLoading}
                      onPress={() => handleMarkArriving(ride.id)}
                    />
                    <Button
                      label="Complete"
                      variant="primary"
                      size="sm"
                      loading={rideLoading}
                      onPress={() => handleCompleteRide(ride.id)}
                    />
                    <Button
                      label="Cancel"
                      variant="danger"
                      size="sm"
                      loading={rideLoading}
                      onPress={() => handleCancelRide(ride.id)}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text variant="body-sm" color="secondary">
                No active rides currently.
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