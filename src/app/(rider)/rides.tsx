import { ErrorModal } from "@/components/ErrorModal";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { getMyRides } from "@/services/bookings";
import type { Booking } from "@/types/bookings";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_LABELS: Record<Booking["status"], string> = {
  requested: "Waiting for a driver",
  driver_assigned: "Driver assigned",
  driver_arriving: "Driver arriving",
  otp_verified: "OTP verified",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<Booking["status"], "secondary" | "success" | "danger" | "primary"> = {
  requested: "secondary",
  driver_assigned: "primary",
  driver_arriving: "primary",
  otp_verified: "primary",
  in_progress: "primary",
  completed: "success",
  cancelled: "danger",
};

export default function RiderRides() {
  const router = useRouter();

  const [rides, setRides] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyRides();
      // Most recent first
      setRides([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load your rides.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRides();
    }, [fetchRides])
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Your rides
          </Text>
          <Text variant="body-md" color="secondary">
            Tap a ride to view details or track it live.
          </Text>
        </View>

        <View className="px-6 gap-3 mb-6">
          {loading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={Colors.dark} />
            </View>
          ) : rides.length ? (
            rides.map((ride) => (
              <TouchableOpacity
                key={ride.id}
                className="rounded-3xl bg-surface border border-border p-4 gap-2"
                onPress={() => router.push({ pathname: "/ride/[id]", params: { id: ride.id } })}
              >
                <View className="flex-row items-center justify-between">
                  <Text variant="body-sm" weight="semibold" color={STATUS_COLORS[ride.status]}>
                    {STATUS_LABELS[ride.status]}
                  </Text>
                  <Text variant="body-sm" color="secondary">
                    {new Date(ride.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text variant="body-md" weight="semibold">
                  {ride.pickupCity}
                </Text>
                <Text variant="body-sm" color="secondary">
                  {ride.pickupLocation} → {ride.dropLocation}
                </Text>
                <Text variant="body-sm" weight="semibold">
                  ₹ {ride.fareAmount / 100} • {ride.paymentMethod === "cash" ? "Cash" : "Razorpay"}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="rounded-3xl bg-surface border border-border p-4">
              <Text variant="body-sm" color="secondary">
                You haven&apos;t taken any rides yet.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}