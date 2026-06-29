import { ErrorModal } from "@/components/ErrorModal";
import { PlaceSearchInput } from "@/components/PlaceSearchInput";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { reverseGeocode, type PlaceSuggestion } from "@/lib/geocoding";
import { estimateFare } from "@/lib/fare";
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

  function handleSeePrice() {
    if (!pickup || !drop) return;
    const estimate = estimateFare(pickup, drop);

    router.push({
      pathname: "/confirm-ride",
      params: {
        pickupCity: pickup.city,
        pickupLocation: pickup.address,
        dropLocation: drop.address,
        pickupLat: String(pickup.latitude),
        pickupLng: String(pickup.longitude),
        dropLat: String(drop.latitude),
        dropLng: String(drop.longitude),
        fareRupees: String(estimate.fareRupees),
        distanceKm: String(estimate.distanceKm.toFixed(1)),
      },
    });
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

        <View className="gap-3 mb-6">
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

        <Button
          label="See Price"
          variant="primary"
          size="lg"
          disabled={!pickup || !drop || locating}
          onPress={handleSeePrice}
        />

        <View className="h-8" />
      </ScrollView>

      <ErrorModal visible={modalVisible} message={errorMessage} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}