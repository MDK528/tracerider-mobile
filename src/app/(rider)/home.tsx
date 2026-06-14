import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { getPassengerActiveRide } from "@/services/bookings";
import type { Booking } from "@/types/bookings";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_LABELS: Record<Booking["status"], string> = {
  requested: "Waiting for a driver",
  driver_assigned: "Driver assigned",
  driver_arriving: "Driver arriving",
  otp_verified: "OTP verified",
  in_progress: "Ride in progress",
  completed: "Ride completed",
  cancelled: "Ride cancelled",
};

export default function RiderHome() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeRide, setActiveRide] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchActiveRide = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPassengerActiveRide();
      setActiveRide(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load your active ride.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchActiveRide();
    }, [fetchActiveRide])
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Hi, {user?.fullName}
          </Text>
          <Text variant="body-md" color="secondary">
            Book a ride, track your active trip, and manage your bookings.
          </Text>
        </View>

        <View className="px-6 gap-4 mb-6">
          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <View>
              <Text variant="heading-sm" weight="bold">
                Ride actions
              </Text>
              <Text variant="body-sm" color="secondary">
                Request a new ride whenever you need one.
              </Text>
            </View>

            <Button
              label="Book a ride"
              variant="primary"
              size="lg"
              disabled={!!activeRide}
              onPress={() => router.push("/book")}
            />

            {!!activeRide && (
              <Text variant="caption" color="secondary">
                You have an active ride — finish or cancel it before booking another.
              </Text>
            )}
          </View>

          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <Text variant="heading-sm" weight="bold">
              Current ride
            </Text>

            {loading ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color={Colors.dark} />
              </View>
            ) : activeRide ? (
              <View className="rounded-3xl bg-dark p-4 gap-3">
                <Text variant="body-sm" color="white">
                  {STATUS_LABELS[activeRide.status]}
                </Text>
                <Text variant="body-md" weight="semibold" color="white">
                  {activeRide.pickupLocation}
                </Text>
                <Text variant="body-sm" color="white">
                  {activeRide.dropLocation}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text variant="body-sm" color="white">
                    ₹ {activeRide.fareAmount / 100}
                  </Text>
                  
                </View>

                <Button
                    label="View ride"
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      router.push({ pathname: "/ride/[id]", params: { id: activeRide.id } })
                    }
                  />
              </View>
            ) : (
              <View className="rounded-3xl bg-bg border border-border p-4">
                <Text variant="body-sm" color="secondary">
                  No active ride currently. Request a ride to get started.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* <View className="px-6 pb-6">
        <Button label="Logout" variant="outline" size="md" onPress={logout} />
      </View> */}

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}