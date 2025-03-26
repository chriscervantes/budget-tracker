Creating a generic context in React Native (with TypeScript) is a great way to manage state and pass values (like authentication tokens or user data) across your app in a reusable and type-safe manner. We’ll implement a generic ContextProvider and a custom hook to use it, then integrate it into your expense tracker app to pass the Auth0 accessToken and related functions (e.g., login, logout).
Step 1: Create the Generic Context
Let’s create a src/context directory and define a reusable context setup.
Create src/context/AppContext.tsx:

ts

import { createContext, useContext, ReactNode, useState, useMemo } from "react";

// Generic context type
type ContextType<T> = {
  value: T;
  setValue: (value: T) => void;
};

// Generic context creator
function createGenericContext<T>() {
  const GenericContext = createContext<ContextType<T> | undefined>(undefined);

  // Provider component
  const Provider = ({ initialValue, children }: { initialValue: T; children: ReactNode }) => {
    const [value, setValue] = useState<T>(initialValue);

    const contextValue = useMemo(() => ({ value, setValue }), [value]);

    return <GenericContext.Provider value={contextValue}>{children}</GenericContext.Provider>;
  };

  // Hook to use the context
  const useGenericContext = () => {
    const context = useContext(GenericContext);
    if (!context) {
      throw new Error("useGenericContext must be used within its Provider");
    }
    return context;
  };

  return { Provider, useGenericContext };
}

// Auth-specific context
type AuthContextValue = {
  accessToken: string | null;
  login: () => void;
  logout: () => void;
};

export const { Provider: AuthProvider, useGenericContext: useAuth } =
  createGenericContext<AuthContextValue>();

This setup:
Defines a generic ContextType<T> with a value and setValue function.

Provides a createGenericContext utility to create reusable contexts.

Creates an AuthProvider and useAuth hook specifically for authentication state.

Step 2: Update App.tsx to Use the Context
Replace the accessToken state management in App.tsx with the new AuthProvider.
ts

import { NavigationContainer } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import Constants from "expo-constants";
import { AuthProvider } from "./src/context/AppContext";
import { setAuthToken } from "./src/services/api";
import AppNavigator from "./src/navigation/AppNavigator";

const auth0Domain = Constants.expoConfig?.extra?.AUTH0_DOMAIN;
const auth0ClientId = Constants.expoConfig?.extra?.AUTH0_CLIENT_ID;
const auth0Audience = Constants.expoConfig?.extra?.AUTH0_AUDIENCE;

export default function App() {
  const discovery = AuthSession.useAutoDiscovery(`https://${auth0Domain}`);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: auth0ClientId,
      scopes: ["openid", "profile", "email", "offline_access"],
      redirectUri: AuthSession.makeRedirectUri({ scheme: "yourapp" }),
      audience: auth0Audience,
    },
    discovery,
  );

  const initialAuthValue: AuthContextValue = {
    accessToken: null,
    login: () => promptAsync(),
    logout: () => {},
  };

  return (
    <AuthProvider initialValue={initialAuthValue}>
      <AppWithAuth />
    </AuthProvider>
  );
}

function AppWithAuth() {
  const { value: auth, setValue: setAuth } = useAuth();

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      (async () => {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            code,
            clientId: auth0ClientId,
            redirectUri: AuthSession.makeRedirectUri({ scheme: "yourapp" }),
          },
          AuthSession.useAutoDiscovery(`https://${auth0Domain}`),
        );
        setAuth({
          ...auth,
          accessToken: tokenResult.accessToken,
          logout: () => setAuth({ ...auth, accessToken: null }),
        });
        setAuthToken(tokenResult.accessToken);
      })();
    }
  }, [response]);

  return (
    <NavigationContainer>
      <AppNavigator
        isAuthenticated={!!auth.accessToken}
        login={auth.login}
        logout={auth.logout}
      />
    </NavigationContainer>
  );
}

Step 3: Update AppNavigator.tsx
Adjust AppNavigator to use the context instead of props:
ts

import { createStackNavigator } from "@react-navigation/stack";
import { Button } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MonthDetailsScreen from "../screens/MonthDetailsScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import { useAuth } from "../context/AppContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { value: auth } = useAuth();

  return (
    <Stack.Navigator>
      {auth.accessToken ? (
        <>
          <Stack.Screen
            name="Home"
            options={{ headerRight: () => <Button title="Logout" onPress={auth.logout} /> }}
          >
            {() => <HomeScreen />}
          </Stack.Screen>
          <Stack.Screen name="MonthDetails" component={MonthDetailsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {() => <LoginScreen />}
          </Stack.Screen>
          <Stack.Screen name="SignUp">
            {() => <SignUpScreen />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}

Step 4: Update Screens to Use Context
Login Screen (src/screens/LoginScreen.tsx):

ts

import { StyleSheet, Text, View, Button } from "react-native";
import { useAuth } from "../context/AppContext";

export default function LoginScreen() {
  const { value: auth } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Button title="Login" onPress={auth.login} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});

SignUp Screen (src/screens/SignUpScreen.tsx):

ts

import { StyleSheet, Text, View, Button } from "react-native";
import { useAuth } from "../context/AppContext";

export default function SignUpScreen() {
  const { value: auth } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Button title="Sign Up" onPress={auth.login} /> {/* Auth0 handles sign-up */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});

Home Screen (src/screens/HomeScreen.tsx):
No changes needed beyond what’s already there, as it doesn’t directly use the auth context yet.

Month Details Screen (src/screens/MonthDetailsScreen.tsx):
No changes needed for now, but you could use useAuth to access the token if needed for additional API calls.

Step 5: Test the App
Run the App:
bash

pnpm start

Use Expo Go or an emulator to test.

Verify:
Login/Sign-up should work via Auth0.

The accessToken should persist across screens.

Logout should clear the token and return to the login screen.

Benefits of This Approach
Reusability: The createGenericContext function can be used for other contexts (e.g., ThemeContext, UserContext) by passing different types.

Type Safety: TypeScript ensures the context value matches the expected shape.

Simplicity: The useAuth hook provides easy access to the auth state anywhere in the app.

Optional Enhancements
Add More Context Values: Extend AuthContextValue to include user data:
ts

type AuthContextValue = {
  accessToken: string | null;
  user: { email: string; auth0Id: string } | null;
  login: () => void;
  logout: () => void;
};

Persist State: Use AsyncStorage to save the token between app restarts:
bash

pnpm add @react-native-async-storage/async-storage

This generic context setup is now integrated into your React Native app. Let me know if you want to expand it further or run into any issues!

