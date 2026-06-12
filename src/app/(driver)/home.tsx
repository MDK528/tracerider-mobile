import { ErrorModal } from "@/components/ErrorModal";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { getDriverProfile, toggleAvailability } from "@/services/driver";
import type { DriverProfile } from "@/types/driver";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DriverDashboard() {
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDriverProfile();
      setProfile(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load driver profile.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  async function handleToggleAvailability() {
    if (!profile) return;

    setToggleLoading(true);
    try {
      const updated = await toggleAvailability(!profile.isAvailable);
      setProfile((prev) => (prev ? { ...prev, isAvailable: updated.isAvailable } : prev));
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to update availability.");
      setModalVisible(true);
    } finally {
      setToggleLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color={Colors.dark} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Driver dashboard
          </Text>
          <Text variant="body-md" color="secondary">
            Manage your availability and view your stats.
          </Text>
        </View>

        <View className="px-6 gap-4 mb-6">
          <View className="rounded-3xl bg-surface border border-border p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text variant="body-sm" color="secondary">
                  Availability status
                </Text>
                <Text
                  variant="heading-sm"
                  weight="bold"
                  color={profile?.isAvailable ? "success" : "danger"}
                >
                  {profile?.isAvailable ? "Online" : "Offline"}
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <Text variant="body-sm" weight="semibold" color="primary">
                  {profile?.isAvailable ? "Online" : "Offline"}
                </Text>
                <Switch
                  value={profile?.isAvailable ?? false}
                  onValueChange={handleToggleAvailability}
                  disabled={toggleLoading}
                  trackColor={{ false: "#E5E7EB", true: "#6FCF97" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            <View className="rounded-2xl bg-dark p-4">
              <Text variant="body-sm" color="white" className="mb-1">
                Total trips
              </Text>
              <Text variant="heading-sm" weight="bold" color="white">
                {profile?.totalTrips}
              </Text>
            </View>
          </View>

          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <Text variant="heading-sm" weight="bold">
              Driver details
            </Text>
            <View>
              <Text variant="body-sm" color="secondary">
                {profile?.fullName}
              </Text>
              <Text variant="caption" color="secondary">
                {profile?.phone}
              </Text>
            </View>
            <View>
              <Text variant="body-sm" color="secondary">
                Verification
              </Text>
              <Text
                variant="body-sm"
                weight="semibold"
                color={profile?.isVerified ? "success" : "danger"}
              >
                {profile?.isVerified ? "Verified" : "Not verified"}
              </Text>
            </View>
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