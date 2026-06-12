import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function RiderHome() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text variant="heading-sm" weight="bold" color="primary">
          Welcome, {user?.fullName} 👋
        </Text>
        <Text variant="body-md" color="secondary">
          Rider home — coming soon
        </Text>
        <Button
          label="Logout"
          variant="outline"
          size="md"
          fullWidth={false}
          onPress={logout}
        />
      </View>
    </SafeAreaView>
  );
}