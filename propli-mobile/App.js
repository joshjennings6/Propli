import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import ShiftTracker from './screens/ShiftTracker';
import InvoiceList from './screens/InvoiceList';
import ClientsScreen from './screens/ClientsScreen';
import { AuthProvider } from './utils/auth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tabs accessible after login
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Shifts" component={ShiftTracker} />
      <Tab.Screen name="Invoices" component={InvoiceList} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
