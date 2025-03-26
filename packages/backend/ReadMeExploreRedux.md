Let’s explore using Redux for state management in your React Native expense tracker app as an alternative to the generic context we just implemented. Redux offers a centralized store, predictable state updates, and powerful debugging tools, which can be beneficial as your app grows in complexity. We’ll replace the AuthProvider context with Redux, managing the authentication state (accessToken, login, logout) and potentially other app-wide state (e.g., monthly expenses).
Why Redux?
Centralized State: All app state lives in one store, making it easier to manage and debug.

Predictability: State updates via pure reducers ensure consistent behavior.

DevTools: Redux DevTools allow time-travel debugging and state inspection.

Scalability: Ideal for larger apps with multiple screens and complex state interactions.

Step 1: Install Redux Dependencies
We’ll use @reduxjs/toolkit (modern Redux) and react-redux for integration with React Native.
bash

cd expense-tracker-mobile
pnpm add @reduxjs/toolkit react-redux
pnpm add -D @types/react-redux

Step 2: Setup Redux Store
Create a src/redux directory to organize Redux-related files.
Create src/redux/authSlice.ts:
This slice will manage authentication state.
ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearAccessToken: (state) => {
      state.accessToken = null;
    },
  },
});

export const { setAccessToken, clearAccessToken } = authSlice.actions;
export default authSlice.reducer;

Create src/redux/store.ts:
Configure the Redux store with the auth slice.
ts

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

Step 3: Update App.tsx with Redux
Wrap the app with the Redux Provider and integrate Auth0 logic with Redux actions.
ts

import { NavigationContainer } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";
import { Provider } from "react-redux";
import Constants from "expo-constants";
import { store } from "./src/redux/store";
import { setAuthToken } from "./src/services/api";
import AppNavigator from "./src/navigation/AppNavigator";
import { useDispatch, useSelector } from "react-redux";
import { setAccessToken, clearAccessToken, RootState } from "./src/redux/authSlice";

const auth0Domain = Constants.expoConfig?.extra?.AUTH0_DOMAIN;
const auth0ClientId = Constants.expoConfig?.extra?.AUTH0_CLIENT_ID;
const auth0Audience = Constants.expoConfig?.extra?.AUTH0_AUDIENCE;

export default function App() {
  return (
    <Provider store={store}>
      <AppWithAuth />
    </Provider>
  );
}

function AppWithAuth() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

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
          discovery,
        );
        dispatch(setAccessToken(tokenResult.accessToken));
        setAuthToken(tokenResult.accessToken);
      })();
    }
  }, [response]);

  return (
    <NavigationContainer>
      <AppNavigator
        isAuthenticated={!!accessToken}
        login={() => promptAsync()}
        logout={() => dispatch(clearAccessToken())}
      />
    </NavigationContainer>
  );
}

Step 4: Update AppNavigator.tsx
Use Redux state instead of props:
ts

import { createStackNavigator } from "@react-navigation/stack";
import { Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState, clearAccessToken } from "../redux/authSlice";
import HomeScreen from "../screens/HomeScreen";
import MonthDetailsScreen from "../screens/MonthDetailsScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createStackNavigator();

export default function AppNavigator({ login }: { login: () => void }) {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  return (
    <Stack.Navigator>
      {accessToken ? (
        <>
          <Stack.Screen
            name="Home"
            options={{ headerRight: () => <Button title="Logout" onPress={() => dispatch(clearAccessToken())} /> }}
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

Step 5: Update Screens to Use Redux
Login Screen (src/screens/LoginScreen.tsx):

ts

import { StyleSheet, Text, View, Button } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/authSlice";

export default function LoginScreen({ login }: { login: () => void }) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  if (accessToken) return null; // Redirect handled by navigator

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Button title="Login" onPress={login} />
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
import { useSelector } from "react-redux";
import { RootState } from "../redux/authSlice";

export default function SignUpScreen({ login }: { login: () => void }) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  if (accessToken) return null; // Redirect handled by navigator

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Button title="Sign Up" onPress={login} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});

Home Screen (src/screens/HomeScreen.tsx):
No changes needed yet, but you could add Redux to manage monthlyExpenses state later.

Month Details Screen (src/screens/MonthDetailsScreen.tsx):
No immediate changes, but Redux could manage monthData if desired.

Step 6: Optional: Add More State
To manage monthly expenses in Redux, create a new slice:
Create src/redux/expenseSlice.ts:

ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MonthlyExpense } from "../types";

interface ExpenseState {
  monthlyExpenses: MonthlyExpense[];
}

const initialState: ExpenseState = {
  monthlyExpenses: [],
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setMonthlyExpenses: (state, action: PayloadAction<MonthlyExpense[]>) => {
      state.monthlyExpenses = action.payload;
    },
  },
});

export const { setMonthlyExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;

Update src/redux/store.ts:

ts

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import expenseReducer from "./expenseSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expenseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

Update HomeScreen.tsx:

ts

import { FlatList, StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMonthlyExpenses } from "../services/api";
import MonthlyExpenseCard from "../components/MonthlyExpenseCard";
import { setMonthlyExpenses, RootState } from "../redux/expenseSlice";

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const monthlyExpenses = useSelector((state: RootState) => state.expenses.monthlyExpenses);

  useEffect(() => {
    (async () => {
      const data = await getMonthlyExpenses();
      dispatch(setMonthlyExpenses(data));
    })();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Expenses</Text>
      <FlatList
        data={monthlyExpenses}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <MonthlyExpenseCard
            item={item}
            onPress={() => navigation.navigate("MonthDetails", { id: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});

Step 7: Test the App
Run the App:
bash

pnpm start

Verify:
Login sets the accessToken in the Redux store.

Logout clears it.

Home screen fetches and displays monthly expenses from the store (if you added the expense slice).

Redux vs. Context
Context: Simpler for small apps, direct state passing, no extra dependencies. Best for your current app size.

Redux: More powerful for complex state (e.g., caching API data, undo/redo), but adds overhead. Better if you plan to expand significantly.

For your app, Redux might be overkill unless you anticipate adding features like offline support or complex state interactions. I’d stick with the generic context unless you need Redux’s advanced capabilities.
Let me know if you want to fully transition to Redux or refine this further!

