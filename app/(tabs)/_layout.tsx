import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToggleTheme } from '@/hooks/use-toggle-theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const toggleTheme = useToggleTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    // Example: listen for login event (replace with your actual login logic)
    const handleLoginSuccess = () => {
      setIsAuthenticated(true);
      router.replace('/(tabs)');
    };
    window.addEventListener('loginSuccess', handleLoginSuccess);
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [router]);

  return (
    <Tabs
      initialRouteName="login"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
  tabBarButton: HapticTab, // Removed to use default tab bar button for icons
        // Use default tabBarButton to display icons from icon-symbol.tsx
        headerRight: () => (
          <Pressable
            onPress={toggleTheme}
            style={{ marginRight: 15 }}
          >
            <IconSymbol
              name={colorScheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </Pressable>
        ),
        tabBarStyle: !isAuthenticated ? { display: 'none' } : {},
      }}>
      {isAuthenticated ? (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="payments"
            options={{
              title: 'Payments',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="payment.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="issues"
            options={{
              title: 'Issues',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="note.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
          />
        </>
      ) : (
        <Tabs.Screen
          name="login"
          options={{
            title: 'Login',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
