import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { cancelRide, getBooking, verifyOtp } from "@/services/bookings";
import { getPublicDriverProfile } from "@/services/driver";
import type { Booking } from "@/types/bookings";
import type { PublicDriverProfile } from "@/types/driver";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function RideTracking() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [driver, setDriver] = useState<PublicDriverProfile | null>(null);
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
        } catch {
          // non-fatal: driver profile fetch failure shouldn't block ride status
        }
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

  async function handleVerifyOtp() {
    if (!booking?.otp) return;

    setOtpSubmitting(true);
    try {
      await verifyOtp(booking.id, booking.otp);
      await fetchBooking();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to verify OTP.");
      setModalVisible(true);
    } finally {
      setOtpSubmitting(false);
    }
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
          <Button label="Back to home" variant="outline" size="md" onPress={() => router.replace("/(rider)/home")} />
        </View>
      </SafeAreaView>
    );
  }

  const isCancellable = CANCELLABLE_STATUSES.includes(booking.status);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Your ride
          </Text>
          <Text variant="body-md" color="secondary">
            {STATUS_LABELS[booking.status]}
          </Text>
        </View>

        <View className="px-6 gap-4 mb-6">
          <View className="rounded-3xl bg-surface border border-border p-4 gap-2">
            <Text variant="body-sm" color="secondary">Pickup</Text>
            <Text variant="body-md" weight="semibold">{booking.pickupLocation}</Text>

            <View className="h-px bg-border my-1" />

            <Text variant="body-sm" color="secondary">Drop</Text>
            <Text variant="body-md" weight="semibold">{booking.dropLocation}</Text>
          </View>

          <View className="rounded-3xl bg-dark p-4 flex-row justify-between items-center">
            <View>
              <Text variant="body-sm" color="white" className="mb-1">Fare</Text>
              <Text variant="heading-sm" weight="bold" color="white">
                ₹ {booking.fareAmount / 100}
              </Text>
            </View>
            <Text variant="body-sm" weight="semibold" color="white">
              {booking.paymentMethod === "cash" ? "Cash" : "Razorpay"}
            </Text>
          </View>

          {driver && (
            <View className="rounded-3xl bg-surface border border-border p-4 gap-2">
              <Text variant="heading-sm" weight="bold">Driver</Text>
              <Text variant="body-md" weight="semibold">{driver.fullName}</Text>
              <Text variant="body-sm" color="secondary">
                {driver.vehicleModel} • {driver.vehicleNo}
              </Text>
            </View>
          )}

          {booking.status === "driver_arriving" && booking.otp && (
            <View className="rounded-3xl bg-surface border border-border p-4 gap-3">
              <Text variant="heading-sm" weight="bold">Start ride</Text>
              <Text variant="body-sm" color="secondary">
                Share this OTP with your driver, then confirm to start the ride.
              </Text>
              <View className="rounded-2xl bg-bg border border-border py-3 items-center">
                <Text variant="heading-md" weight="bold" color="primary">
                  {booking.otp}
                </Text>
              </View>
              <Button
                label="Start ride"
                variant="primary"
                size="lg"
                loading={otpSubmitting}
                onPress={handleVerifyOtp}
              />
            </View>
          )}

          {booking.status === "completed" && (
            <View className="rounded-3xl bg-surface border border-border p-4 gap-2">
              <Text variant="heading-sm" weight="bold">Ride completed</Text>
              <Text variant="body-sm" color="secondary">
                Thanks for riding with TraceRider.
              </Text>
              <View className="mt-2">
                <Button label="Back to home" variant="primary" size="lg" onPress={() => router.replace("/(rider)/home")} />
              </View>
            </View>
          )}

          {booking.status === "cancelled" && (
            <View className="rounded-3xl bg-surface border border-border p-4 gap-2">
              <Text variant="heading-sm" weight="bold">Ride cancelled</Text>
              {booking.cancellationReason && (
                <Text variant="body-sm" color="secondary">{booking.cancellationReason}</Text>
              )}
              <View className="mt-2">
                <Button label="Back to home" variant="primary" size="lg" onPress={() => router.replace("/(rider)/home")} />
              </View>
            </View>
          )}

          {isCancellable && (
            <View className="rounded-3xl bg-surface border border-border p-4 gap-3">
              <Text variant="heading-sm" weight="bold">Cancel ride</Text>
              <Input
                label="Reason (optional)"
                placeholder="Let us know why"
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
        </View>
      </ScrollView>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}