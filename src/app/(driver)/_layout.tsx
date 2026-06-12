import { Tabs } from "expo-router";
import { LayoutDashboard, Car, User } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function DriverLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.dark,
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}