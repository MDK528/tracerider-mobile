console.log("RIDER LAYOUT LOADED");
import "@/global.css";
import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Inter_100Thin,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// SplashScreen.preventAutoHideAsync();

// ─── Inner layout (needs AuthContext) ────────────────────────────────────────

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

  console.log("NAVIGATION START");

  if (!isAuthenticated) {
    console.log("GOING AUTH");
    router.replace("/(auth)/welcome");
    return;
  }

  if (user?.role === "driver") {
    console.log("GOING DRIVER");
    router.replace("/(driver)/home");
  } else {
    console.log("GOING RIDER");
    router.replace("/(rider)/home");
  }
  }, [isAuthenticated, isLoading, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(rider)" />
      <Stack.Screen name="(driver)" />
    </Stack>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_100Thin,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  console.log("RootLayout mounted");

  // useEffect(() => {
  //    console.log("fontsLoaded:", fontsLoaded);
  //   console.log("fontError:", fontError);
  //   if (fontsLoaded || fontError) {
  //     console.log("Calling hideAsync");
  //     SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" backgroundColor="#F8FAFC" />
          <RootLayoutNav />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
