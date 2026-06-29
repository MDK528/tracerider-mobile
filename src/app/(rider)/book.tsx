import { ErrorModal } from "@/components/ErrorModal";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { reverseGeocode, type PlaceSuggestion } from "@/lib/geocoding";
import { estimateFare } from "@/lib/fare";
import { createBooking } from "@/services/bookings";
import type { PaymentMethod } from "@/types/bookings";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { MapPreview } from "@/components/MapPreview";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookRide() {
  const router = useRouter();

  const [locating, setLocating] = useState(true);
  const [pickup, setPickup] = useState<PlaceSuggestion | null>(null);
  const [drop, setDrop] = useState<PlaceSuggestion | null>(null);
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropQuery, setDropQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  async function detectCurrentLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMessage("Location permission is required to set your pickup point.");
        setModalVisible(true);
        return;
      }

      const position = await Location.getCurrentPositionAsync({});
      const place = await reverseGeocode(position.coords.latitude, position.coords.longitude);

      if (place) {
        setPickup(place);
        setPickupQuery(place.address);
      }
    } catch {
      setErrorMessage("Unable to detect your current location.");
      setModalVisible(true);
    } finally {
      setLocating(false);
    }
  }

  const estimate = pickup && drop ? estimateFare(pickup, drop) : null;

  async function handleRequestRide() {
    if (!pickup || !drop) return;

    setSubmitting(true);
    try {
      const booking = await createBooking({
        pickupCity: pickup.city,
        pickupLocation: pickup.address,
        dropLocation: drop.address,
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        dropLat: drop.latitude,
        dropLng: drop.longitude,
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
      <View className="h-72">
        {pickup ? (
          <MapPreview pickup={pickup} drop={drop} />
        ) : (
          <View className="flex-1 items-center justify-center bg-map-bg">
            <ActivityIndicator size="large" color="#16191A" />
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-6 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text variant="heading-md" weight="bold" color="primary" className="mb-4">
          Book a ride
        </Text>

        <View className="gap-3 mb-4">
          <PlaceSearchInput
            label="Pickup"
            placeholder="Enter pickup location"
            value={pickupQuery}
            onChangeText={setPickupQuery}
            onSelect={(place) => {
              setPickup(place);
              setPickupQuery(place.address);
            }}
          />
          <PlaceSearchInput
            label="Drop"
            placeholder="Where to?"
            value={dropQuery}
            onChangeText={setDropQuery}
            onSelect={(place) => {
              setDrop(place);
              setDropQuery(place.address);
            }}
          />
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Button
              label="Pay Driver Directly"
              variant={paymentMethod === "cash" ? "primary" : "outline"}
              size="md"
              onPress={() => setPaymentMethod("cash")}
            />
          </View>
          <View className="flex-1">
            <Button
              label="UPI"
              variant={paymentMethod === "razorpay" ? "primary" : "outline"}
              size="md"
              onPress={() => setPaymentMethod("razorpay")}
            />
          </View>
        </View>

        {estimate && (
          <View className="rounded-3xl bg-dark p-4 mb-6">
            <Text variant="body-sm" color="white" className="mb-1">
              Estimated fare
            </Text>
            <Text variant="heading-md" weight="bold" color="white">
              ₹ {estimate.fareRupees}
            </Text>
            <Text variant="caption" color="white" className="mt-1">
              ~ {estimate.distanceKm.toFixed(1)} km
            </Text>
          </View>
        )}

        <Button
          label="Request ride"
          variant="primary"
          size="lg"
          loading={submitting}
          disabled={!pickup || !drop || locating}
          onPress={handleRequestRide}
        />

        <View className="h-8" />
      </ScrollView>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}