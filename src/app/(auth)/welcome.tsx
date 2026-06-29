import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface AuthScreenProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onSignup }) => {
  const handleLogin = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    router.push('/(auth)/login');
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
      return;
    }

    router.push('/(auth)/register');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0E1F1C' }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingVertical: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Logo/Header Section */}
        <View
          style={{
            marginBottom: 60,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              // backgroundColor: '#1a3a36',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
             <Image
              source={require('../../../assets/images/splash-screen.png')}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: '#F4F4F3',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            TraceRider
          </Text>
        </View>

        {/* Button Section */}
        <View style={{ width: '100%', gap: 16 }}>
          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignup}
            style={{
              backgroundColor: '#0E1F1C',
              borderWidth: 2,
              borderColor: '#F4F4F3',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#F4F4F3',
              }}
            >
              Create New Account
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#F4F4F3',
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#0E1F1C',
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View
          style={{
            marginTop: 60,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: '#7a7a78',
              textAlign: 'center',
            }}
          >
            By continuing, you agree to our{' '}
            <Text style={{ color: '#F4F4F3', fontWeight: '600' }}>
              Terms & Conditions
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default AuthScreen;
