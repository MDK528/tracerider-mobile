import { View, Image, StatusBar } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";

export default function Welcome() {
  return (
    <SafeAreaView className="flex-1 bg-bg">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Illustration */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-64 h-64 bg-accent-bg rounded-lg items-center justify-center mb-8">
          <Text variant="heading-lg">🚗</Text>
        </View>

        <Text variant="heading-md" weight="bold" color="primary" className="text-center mb-3">
          Your ride,{"\n"}on your terms
        </Text>

        <Text variant="body-md" color="secondary" className="text-center leading-6">
          Fast, safe and affordable rides{"\n"}wherever you need to go
        </Text>
      </View>

      {/* Bottom Actions */}
      <View className="px-6 pb-8 gap-3">
        <Button
          label="Get Started"
          variant="primary"
          size="lg"
          onPress={() => router.push("/(auth)/register")}
        />
        <Button
          label="I already have an account"
          variant="ghost"
          size="lg"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </SafeAreaView>
  );
}