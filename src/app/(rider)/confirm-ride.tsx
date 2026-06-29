import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { createBooking } from "@/services/bookings";
import type { PaymentMethod } from "@/types/bookings";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Navigation } from "lucide-react-native";

export default function ConfirmRide() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    pickupCity: string;
    pickupLocation: string;
    dropLocation: string;
    pickupLat: string;
    pickupLng: string;
    dropLat: string;
    dropLng: string;
    fareRupees: string;
    distanceKm: string;
  }>();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const booking = await createBooking({
        pickupCity: params.pickupCity,
        pickupLocation: params.pickupLocation,
        dropLocation: params.dropLocation,
        pickupLat: parseFloat(params.pickupLat),
        pickupLng: parseFloat(params.pickupLng),
        dropLat: parseFloat(params.dropLat),
        dropLng: parseFloat(params.dropLng),
        paymentMethod,
      });

      router.replace({ pathname: "/ride/[id]", params: { id: booking.id } });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to request ride.");
      setModalVisible(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1 px-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text variant="heading-md" weight="bold" color="primary" className="mb-6">
          Confirm ride
        </Text>

        {/* Route card */}
        <View className="bg-dark rounded-3xl p-5 mb-4">
          <View className="flex-row items-start gap-3 mb-4">
            <View className="mt-1">
              <Navigation size={16} color="#0CE897" />
            </View>
            <View className="flex-1">
              <Text variant="caption" color="secondary" className="mb-0.5">Pickup</Text>
              <Text variant="body-sm" color="white" weight="medium" numberOfLines={2}>
                {params.pickupLocation}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="ml-7 border-l border-dashed border-neutral-600 h-4 mb-4" />

          <View className="flex-row items-start gap-3">
            <View className="mt-1">
              <MapPin size={16} color="#FF4D4D" />
            </View>
            <View className="flex-1">
              <Text variant="caption" color="secondary" className="mb-0.5">Drop</Text>
              <Text variant="body-sm" color="white" weight="medium" numberOfLines={2}>
                {params.dropLocation}
              </Text>
            </View>
          </View>
        </View>

        {/* Fare card */}
        <View className="bg-dark rounded-3xl p-5 mb-4 flex-row items-center justify-between">
          <View>
            <Text variant="caption" color="secondary" className="mb-1">Estimated fare</Text>
            <Text variant="heading-lg" weight="bold" color="white">
              ₹ {params.fareRupees}
            </Text>
          </View>
          <View className="items-end">
            <Text variant="caption" color="secondary" className="mb-1">Distance</Text>
            <Text variant="body-sm" color="white" weight="medium">
              ~{params.distanceKm} km
            </Text>
          </View>
        </View>

        {/* Payment method */}
        <View className="mb-8">
          <Text variant="body-md" weight="medium" color="primary" className="mb-3">
            Payment method
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-2xl items-center border ${
                paymentMethod === "cash" ? "bg-accent-dark border-accent-dark": "bg-surface border-border"
              }`}
              onPress={() => setPaymentMethod("cash")}
            >
              <Text
                variant="body-sm"
                weight="semibold"
                color={paymentMethod === "cash" ? "secondary" : "primary"}
              >
                Pay driver
              </Text>
              <Text
                variant="caption"
                color={paymentMethod === "cash" ? "secondary" : "primary"}
              >
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2 rounded-2xl items-center border ${
                paymentMethod === "razorpay" ? "bg-accent-dark border-accent-dark": "bg-surface border-border"
              }`}
              onPress={() => setPaymentMethod("razorpay")}
            >
              <Text
                variant="body-sm"
                weight="semibold"
                color={paymentMethod === "razorpay" ? "secondary" : "primary"}
              >
                UPI
              </Text>
              <Text
                variant="caption"
                color={paymentMethod === "razorpay" ? "secondary" : "primary"}
              >
                Razorpay
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          label="Confirm booking"
          variant="primary"
          size="lg"
          loading={submitting}
          onPress={handleConfirm}
        />

        <View className="h-8" />
      </ScrollView>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}