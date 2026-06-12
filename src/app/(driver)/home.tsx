import { ErrorModal } from "@/components/ErrorModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { acceptRide, cancelRide, completeRide, getAvailableRequests, getMyRides, markArriving, rejectRide } from "@/services/bookings";
import {
  getDriverProfile,
  toggleAvailability,
  updateDriverProfile,
} from "@/services/driver";
import { Booking } from "@/types/bookings";
import type { DriverProfile } from "@/types/driver";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FormState {
  state: string;
  serviceArea: string;
  vehicleModel: string;
  vehicleNo: string;
  licenceNo: string;
}

interface FormErrors {
  state?: string;
  serviceArea?: string;
  vehicleModel?: string;
  vehicleNo?: string;
  licenceNo?: string;
}

export default function DriverHome() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [rideLoading, setRideLoading] = useState(false);
  const [availableRequests, setAvailableRequests] = useState<Booking[]>([]);
  const [activeRides, setActiveRides] = useState<Booking[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState<FormState>({
    state: "",
    serviceArea: "",
    vehicleModel: "",
    vehicleNo: "",
    licenceNo: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchProfile();
    fetchAvailableRequests();
    fetchActiveRides();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await getDriverProfile();
      setProfile(data);
      setForm({
        state: data.state,
        serviceArea: data.serviceArea.join(", "),
        vehicleModel: data.vehicleModel,
        vehicleNo: data.vehicleNo,
        licenceNo: data.licenceNo,
      });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load driver profile.");
      setModalVisible(true);
    } finally {
      setLoading(false);
      // setEditMode(false);
    }
  }

  function validate() {
    const newErrors: FormErrors = {};

    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.serviceArea.trim()) newErrors.serviceArea = "Service area is required";
    if (!form.vehicleModel.trim()) newErrors.vehicleModel = "Vehicle model is required";
    if (!form.vehicleNo.trim()) newErrors.vehicleNo = "Vehicle number is required";
    if (!form.licenceNo.trim()) newErrors.licenceNo = "Licence number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSave() {
    if (!profile || !validate()) return;

    setSaving(true);
    try {
      const updated = await updateDriverProfile({
        state: form.state.trim(),
        serviceArea: form.serviceArea
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        vehicleModel: form.vehicleModel.trim(),
        vehicleNo: form.vehicleNo.trim(),
        licenceNo: form.licenceNo.trim(),
      });

      setProfile((prev) => (prev ? { ...prev, ...updated } : updated as DriverProfile));
      setForm((prev) => ({ ...prev, state: updated.state, serviceArea: updated.serviceArea.join(", ") }));
      // after successful save, switch to read-only mode
      setEditMode(false);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to save profile.");
      setModalVisible(true);
    } finally {
      setSaving(false);
    }
  }

  async function fetchAvailableRequests() {
    setRideLoading(true);
    try {
      const data = await getAvailableRequests();
      setAvailableRequests(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load ride requests.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

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

  async function handleAcceptRide(ride: Booking) {
    setRideLoading(true);
    try {
      await acceptRide(ride.id);
      await fetchAvailableRequests();
      await fetchActiveRides();
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
      await fetchActiveRides();
      await fetchAvailableRequests();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to complete ride.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  async function fetchActiveRides() {
    setRideLoading(true);
    try {
      const data = await getMyRides();
      setActiveRides(data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to load your rides.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
    }
  }

  async function handleCancelRide(rideId: string) {
    setRideLoading(true);
    try {
      await cancelRide(rideId);
      await fetchActiveRides();
      await fetchAvailableRequests();
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? "Unable to cancel ride.");
      setModalVisible(true);
    } finally {
      setRideLoading(false);
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-4">
          <Text variant="heading-md" weight="bold" color="primary" className="mb-2">
            Driver dashboard
          </Text>
          <Text variant="body-md" color="secondary">
            Manage availability, vehicle details, and profile settings.
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
                  thumbColor={profile?.isAvailable ? "#ffffff" : "#ffffff"}
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
                    ₹ {ride.fareAmount / 100}  • {ride.paymentMethod}
                  </Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Button
                        label="Accept"
                        variant="secondary"
                        size="sm"
                        loading={rideLoading}
                        onPress={() => handleAcceptRide(ride)}
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

          <View className="rounded-3xl bg-surface border border-border p-4 gap-4">
            <Text variant="heading-sm" weight="bold">
              Vehicle Details & Service Areas
            </Text>
            {editMode ? (
              <Input
                label="State"
                placeholder="Enter state"
                value={form.state}
                error={errors.state}
                editable={editMode}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, state: value }));
                  if (errors.state) setErrors((prev) => ({ ...prev, state: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">State</Text>
                <Text variant="body-md" weight="semibold">{form.state}</Text>
              </View>
            )}
            {editMode ? (
              <Input
                label="Service area"
                placeholder="City1, City2, City3"
                value={form.serviceArea}
                error={errors.serviceArea}
                editable={editMode}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, serviceArea: value }));
                  if (errors.serviceArea) setErrors((prev) => ({ ...prev, serviceArea: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Service area</Text>
                <Text variant="body-md" weight="semibold">{form.serviceArea}</Text>
              </View>
            )}
            {editMode ? (
              <Input
                label="Vehicle model"
                placeholder="Toyota Prius"
                value={form.vehicleModel}
                error={errors.vehicleModel}
                editable={editMode}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, vehicleModel: value }));
                  if (errors.vehicleModel) setErrors((prev) => ({ ...prev, vehicleModel: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Vehicle model</Text>
                <Text variant="body-md" weight="semibold">{form.vehicleModel}</Text>
              </View>
            )}
            {editMode ? (
              <Input
                label="Vehicle number"
                placeholder="ABC-1234"
                value={form.vehicleNo}
                error={errors.vehicleNo}
                editable={editMode}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, vehicleNo: value }));
                  if (errors.vehicleNo) setErrors((prev) => ({ ...prev, vehicleNo: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Vehicle number</Text>
                <Text variant="body-md" weight="semibold">{form.vehicleNo}</Text>
              </View>
            )}
            {editMode ? (
              <Input

                label="Licence number"
                placeholder="DL-001234567890"
                value={form.licenceNo}
                error={errors.licenceNo}
                editable={editMode}
                onChangeText={(value) => {
                  setForm((prev) => ({ ...prev, licenceNo: value }));
                  if (errors.licenceNo) setErrors((prev) => ({ ...prev, licenceNo: undefined }));
                }}
              />
            ) : (
              <View>
                <Text variant="body-sm" color="secondary" className="mb-1">Licence number</Text>
                <Text variant="body-md" weight="semibold">{form.licenceNo}</Text>
              </View>
            )}

            <Button
              label={editMode ? "Save changes" : "Edit"}
              variant={editMode ? "primary" : "outline"}
              size="lg"
              loading={saving}
              onPress={editMode ? handleSave : () => setEditMode(true)}
            />
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Button label="Logout" variant="outline" size="md" onPress={logout} />
      </View>

      <ErrorModal
        visible={modalVisible}
        message={errorMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
