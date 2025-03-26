Let’s create a React Native app for your expense tracker that integrates with the backend we’ve built. The app will include a home screen listing monthly expenses, a details screen for past and current months (with add/update/delete functionality for the current month), and authentication screens (sign-up/login) using Auth0. I’ll also suggest a UI design that’s clean, intuitive, and user-friendly.
Project Overview
Tech Stack: React Native (Expo), TypeScript, Auth0 for authentication, Axios for API calls, React Navigation for routing.

Features:
Home: List of monthly expenses.

Details: Show expenses for a selected month (editable if current month).

Auth: Sign-up and login pages.

UI Design: Modern, minimalistic, with a focus on usability.

Step 1: Setup React Native with Expo
Install Expo CLI:
bash

npm install -g expo-cli

Create the Project:
bash

expo init expense-tracker-mobile --template blank-typescript
cd expense-tracker-mobile
pnpm install

Install Dependencies:
bash

pnpm add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs expo-auth-session axios zod react-native-safe-area-context react-native-screens @expo/vector-icons
pnpm add -D @types/react-native-vector-icons

Step 2: Project Structure

expense-tracker-mobile/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── MonthDetailsScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SignUpScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── components/
│       ├── MonthlyExpenseCard.tsx
│       └── ExpenseItem.tsx
├── App.tsx
└── package.json

Step 3: Types (Sync with Backend)
Create src/types/index.ts to match the backend’s @expense-tracker/common:
ts

import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  auth0Id: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime().optional(),
});

export const monthlyExpenseSchema = z.object({
  id: z.string().uuid().optional(),
  month: z.string(),
  budgetGoal: z.number().positive(),
  userId: z.string().uuid(),
});

export const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string(),
  amount: z.number().positive(),
  date: z.string().datetime(),
  monthlyExpenseId: z.string().uuid(),
});

export const monthlyExpenseWithCashOnHandSchema = monthlyExpenseSchema.extend({
  expenses: z.array(expenseSchema).optional(),
  cashOnHand: z.number(),
});

export type User = z.infer<typeof userSchema>;
export type MonthlyExpense = z.infer<typeof monthlyExpenseSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type MonthlyExpenseWithCashOnHand = z.infer<typeof monthlyExpenseWithCashOnHandSchema>;

Step 4: API Service
Create src/services/api.ts to interact with your backend:
ts

import axios from "axios";
import { MonthlyExpense, Expense, MonthlyExpenseWithCashOnHand } from "../types";

const API_URL = "http://your-backend-url/api"; // Replace with Render/Fly.io URL

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const getMonthlyExpenses = async (): Promise<MonthlyExpense[]> => {
  const response = await api.get("/monthly-expenses");
  return response.data;
};

export const getMonthDetails = async (id: string): Promise<MonthlyExpenseWithCashOnHand> => {
  const response = await api.get(`/monthly-expenses/${id}`);
  return response.data;
};

export const createExpense = async (data: Expense): Promise<Expense> => {
  const response = await api.post("/expenses", data);
  return response.data;
};

export const updateExpense = async (id: string, data: Partial<Expense>): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await api.delete(`/expenses/${id}`);
};

Step 5: Authentication with Auth0
Configure Auth0:
In your Auth0 dashboard, create a Native application.

Set Allowed Callback URLs: yourapp://auth0.

Note the Client ID and Domain.

Update .env (create if not exists):
bash

AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=https://expense-tracker-api

Install expo-dotenv:
bash

pnpm add expo-constants

App.tsx:
ts

import { NavigationContainer } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import Constants from "expo-constants";
import { setAuthToken } from "./src/services/api";
import AppNavigator from "./src/navigation/AppNavigator";

const auth0Domain = Constants.expoConfig?.extra?.AUTH0_DOMAIN;
const auth0ClientId = Constants.expoConfig?.extra?.AUTH0_CLIENT_ID;
const auth0Audience = Constants.expoConfig?.extra?.AUTH0_AUDIENCE;

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
        setAccessToken(tokenResult.accessToken);
        setAuthToken(tokenResult.accessToken);
      })();
    }
  }, [response]);

  return (
    <NavigationContainer>
      <AppNavigator
        isAuthenticated={!!accessToken}
        login={() => promptAsync()}
        logout={() => setAccessToken(null)}
      />
    </NavigationContainer>
  );
}

Update app.json:
json

{
  "expo": {
    "name": "Expense Tracker",
    "slug": "expense-tracker-mobile",
    "scheme": "yourapp",
    "extra": {
      "AUTH0_DOMAIN": "your-auth0-domain.auth0.com",
      "AUTH0_CLIENT_ID": "your-client-id",
      "AUTH0_AUDIENCE": "https://expense-tracker-api"
    }
  }
}

Step 6: Navigation
Create src/navigation/AppNavigator.tsx:
ts

import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import MonthDetailsScreen from "../screens/MonthDetailsScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createStackNavigator();

type Props = {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
};

export default function AppNavigator({ isAuthenticated, login, logout }: Props) {
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" options={{ headerRight: () => <Button title="Logout" onPress={logout} /> }}>
            {() => <HomeScreen />}
          </Stack.Screen>
          <Stack.Screen name="MonthDetails" component={MonthDetailsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login">
            {() => <LoginScreen login={login} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp">
            {() => <SignUpScreen login={login} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}

Step 7: Screens
Home Screen (src/screens/HomeScreen.tsx):
ts

import { FlatList, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { getMonthlyExpenses } from "../services/api";
import MonthlyExpenseCard from "../components/MonthlyExpenseCard";
import { MonthlyExpense } from "../types";

export default function HomeScreen({ navigation }: any) {
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getMonthlyExpenses();
      setMonthlyExpenses(data);
    })();
  }, []);

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

Month Details Screen (src/screens/MonthDetailsScreen.tsx):
ts

import { FlatList, StyleSheet, Text, View, TextInput, Button } from "react-native";
import { useEffect, useState } from "react";
import { getMonthDetails, createExpense, updateExpense, deleteExpense } from "../services/api";
import ExpenseItem from "../components/ExpenseItem";
import { MonthlyExpenseWithCashOnHand, Expense } from "../types";

export default function MonthDetailsScreen({ route }: any) {
  const { id } = route.params;
  const [monthData, setMonthData] = useState<MonthlyExpenseWithCashOnHand | null>(null);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
  const isCurrentMonth = monthData?.month === new Date().toISOString().slice(0, 7);

  useEffect(() => {
    (async () => {
      const data = await getMonthDetails(id);
      setMonthData(data);
    })();
  }, [id]);

  const handleAddExpense = async () => {
    if (!isCurrentMonth) return;
    const expense: Expense = {
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString(),
      monthlyExpenseId: id,
    };
    const created = await createExpense(expense);
    setMonthData({
      ...monthData!,
      expenses: [...(monthData?.expenses || []), created],
      cashOnHand: monthData!.cashOnHand - created.amount,
    });
    setNewExpense({ description: "", amount: "" });
  };

  const handleUpdateExpense = async (expenseId: string, updates: Partial<Expense>) => {
    if (!isCurrentMonth) return;
    const updated = await updateExpense(expenseId, updates);
    setMonthData({
      ...monthData!,
      expenses: monthData!.expenses!.map((e) => (e.id === expenseId ? updated : e)),
    });
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!isCurrentMonth) return;
    await deleteExpense(expenseId);
    setMonthData({
      ...monthData!,
      expenses: monthData!.expenses!.filter((e) => e.id !== expenseId),
    });
  };

  return (
    <View style={styles.container}>
      {monthData && (
        <>
          <Text style={styles.title}>{monthData.month}</Text>
          <Text>Budget: ${monthData.budgetGoal}</Text>
          <Text>Cash on Hand: ${monthData.cashOnHand.toFixed(2)}</Text>
          <FlatList
            data={monthData.expenses}
            keyExtractor={(item) => item.id!}
            renderItem={({ item }) => (
              <ExpenseItem
                item={item}
                isEditable={isCurrentMonth}
                onUpdate={handleUpdateExpense}
                onDelete={handleDeleteExpense}
              />
            )}
          />
          {isCurrentMonth && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                keyboardType="numeric"
              />
              <Button title="Add Expense" onPress={handleAddExpense} />
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  inputContainer: { marginTop: 16 },
  input: { borderWidth: 1, padding: 8, marginBottom: 8, borderRadius: 4 },
});

Login Screen (src/screens/LoginScreen.tsx):
ts

import { StyleSheet, Text, View, Button } from "react-native";

export default function LoginScreen({ login }: { login: () => void }) {
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

export default function SignUpScreen({ login }: { login: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Button title="Sign Up" onPress={login} /> {/* Auth0 handles sign-up */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});

Step 8: Components
Monthly Expense Card (src/components/MonthlyExpenseCard.tsx):
ts

import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { MonthlyExpense } from "../types";

export default function MonthlyExpenseCard({ item, onPress }: { item: MonthlyExpense; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.month}>{item.month}</Text>
      <Text>Budget: ${item.budgetGoal}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8, elevation: 2 },
  month: { fontSize: 18, fontWeight: "bold" },
});

Expense Item (src/components/ExpenseItem.tsx):
ts

import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { useState } from "react";
import { Expense } from "../types";

export default function ExpenseItem({
  item,
  isEditable,
  onUpdate,
  onDelete,
}: {
  item: Expense;
  isEditable: boolean;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
  onDelete: (id: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [description, setDescription] = useState(item.description);
  const [amount, setAmount] = useState(item.amount.toString());

  const handleSave = () => {
    onUpdate(item.id!, { description, amount: parseFloat(amount) });
    setEditMode(false);
  };

  return (
    <View style={styles.item}>
      {editMode && isEditable ? (
        <>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Button title="Save" onPress={handleSave} />
          <Button title="Cancel" onPress={() => setEditMode(false)} />
        </>
      ) : (
        <>
          <Text>{item.description}</Text>
          <Text>${item.amount.toFixed(2)}</Text>
          {isEditable && (
            <>
              <Button title="Edit" onPress={() => setEditMode(true)} />
              <Button title="Delete" onPress={() => onDelete(item.id!)} />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { padding: 8, backgroundColor: "#fff", borderRadius: 4, marginBottom: 8, elevation: 1 },
  input: { borderWidth: 1, padding: 4, marginBottom: 4, borderRadius: 4 },
});

Step 9: UI Design Suggestions
Here’s a modern, user-friendly UI design for your app:
Home Screen:
Background: Light gray (#f5f5f5) for a clean look.

Monthly Cards: White cards with subtle shadows (elevation: 2), rounded corners (borderRadius: 8), and bold month titles. Use a gradient or color (e.g., #4CAF50 for positive cash flow, #F44336 for negative) to indicate status.

Header: Bold title (“Monthly Expenses”) with a logout button on the right (icon: sign-out from @expo/vector-icons).

Month Details Screen:
Header: Month name in bold, with budget and cash-on-hand stats below in a card-like section.

Expense List: FlatList with swipeable items (use react-native-gesture-handler for swipe-to-delete). Past months are read-only, current month shows edit/delete buttons.

Add Expense: Sticky bottom section with inputs and a green “Add” button (#4CAF50).

Colors: Green for positive cash-on-hand, red for negative.

Auth Screens:
Background: Gradient (e.g., #4CAF50 to #2196F3) for a welcoming feel.

Buttons: Rounded, bold, with a white background and colored text (#4CAF50 for sign-up, #2196F3 for login).

Logo: Add a simple icon (e.g., piggy bank from @expo/vector-icons) above the title.

Typography:
Use a clean font like “Roboto” or “Inter” (available via Expo’s font support).

Titles: 24px bold, body text: 16px regular.

Navigation:
Stack navigation for simplicity, but consider a bottom tab bar (Home, Profile) later.

Step 10: Run the App
Start Expo:
bash

pnpm start

Scan the QR code with the Expo Go app on your phone or use an emulator.

Test:
Login/Sign-up via Auth0.

View monthly expenses on Home.

Add/edit/delete expenses for the current month.

This React Native app meets your requirements and integrates with your backend. The UI design is minimal yet functional, with room to enhance (e.g., charts with react-native-chart-kit). Let me know if you want to refine any part!

