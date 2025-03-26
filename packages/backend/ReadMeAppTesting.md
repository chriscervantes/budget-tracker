Let’s create tests for your React Native expense tracker app to ensure its functionality works as expected. We’ll focus on unit and integration tests for key components and screens (e.g., HomeScreen, MonthDetailsScreen, ExpenseItem) using Jest (included with React Native) and React Testing Library. Since your app uses Redux for state management and integrates with an API, we’ll mock the Redux store and API calls to isolate the tests.
Step 1: Set Up Testing Environment
Install Testing Libraries:
Your project likely already has Jest (from Expo’s default setup), but we’ll add React Testing Library and mocks:
bash

cd expense-tracker-mobile
pnpm add -D @testing-library/react-native @testing-library/jest-native @types/jest
pnpm add -D @reduxjs/toolkit react-redux

Update package.json:
Add a test script and configure Jest:
json

{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo",
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
    ],
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]
  }
}

Create jest.setup.ts:
In the root directory (expense-tracker-mobile/), add setup for React Testing Library:
ts

import "@testing-library/jest-native/extend-expect";

Step 2: Mock Dependencies
Since your app uses Redux and API calls, we’ll mock them.
Mock Redux Store (__mocks__/reduxMock.ts):
ts

import { configureStore } from "@reduxjs/toolkit";
import { RootState } from "../src/redux/store";

export const mockStore = (initialState: Partial<RootState>) =>
  configureStore({
    reducer: {
      auth: (state = initialState.auth || { accessToken: null }) => state,
      expenses: (state = initialState.expenses || { monthlyExpenses: [] }) => state,
    },
  });

Mock API (__mocks__/api.ts):
Create a mock version of src/services/api.ts:
ts

export const setAuthToken = jest.fn();
export const getMonthlyExpenses = jest.fn(() => Promise.resolve([]));
export const getMonthDetails = jest.fn(() => Promise.resolve({}));
export const createExpense = jest.fn(() => Promise.resolve({}));
export const updateExpense = jest.fn(() => Promise.resolve({}));
export const deleteExpense = jest.fn(() => Promise.resolve());

Place Mocks:
Create a __mocks__ folder in expense-tracker-mobile/.

Add reduxMock.ts and api.ts there.

Step 3: Write Tests
Create a tests folder in expense-tracker-mobile/ to organize test files.
Test HomeScreen (tests/HomeScreen.test.tsx):
ts

import { render, screen, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import HomeScreen from "../src/screens/HomeScreen";
import { mockStore } from "../__mocks__/reduxMock";
import * as api from "../src/services/api";

jest.mock("../src/services/api");

const mockNavigation = { navigate: jest.fn() };

describe("HomeScreen", () => {
  it("renders monthly expenses list", async () => {
    const mockExpenses = [
      { id: "1", month: "2025-03", budgetGoal: 1000, userId: "user1" },
    ];
    (api.getMonthlyExpenses as jest.Mock).mockResolvedValue(mockExpenses);

    render(
      <Provider store={mockStore({ auth: { accessToken: "token" }, expenses: { monthlyExpenses: mockExpenses } })}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Monthly Expenses")).toBeTruthy();
      expect(screen.getByText("2025-03")).toBeTruthy();
    });
  });

  it("navigates to MonthDetails on card press", async () => {
    const mockExpenses = [
      { id: "1", month: "2025-03", budgetGoal: 1000, userId: "user1" },
    ];
    (api.getMonthlyExpenses as jest.Mock).mockResolvedValue(mockExpenses);

    render(
      <Provider store={mockStore({ auth: { accessToken: "token" }, expenses: { monthlyExpenses: mockExpenses } })}>
        <HomeScreen navigation={mockNavigation} />
      </Provider>,
    );

    await waitFor(() => {
      screen.getByText("2025-03").props.onPress();
      expect(mockNavigation.navigate).toHaveBeenCalledWith("MonthDetails", { id: "1" });
    });
  });
});

Test MonthDetailsScreen (tests/MonthDetailsScreen.test.tsx):
ts

import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import MonthDetailsScreen from "../src/screens/MonthDetailsScreen";
import { mockStore } from "../__mocks__/reduxMock";
import * as api from "../src/services/api";

jest.mock("../src/services/api");

const mockRoute = { params: { id: "1" } };

describe("MonthDetailsScreen", () => {
  it("displays month details and allows adding expense for current month", async () => {
    const mockMonthData = {
      id: "1",
      month: new Date().toISOString().slice(0, 7), // Current month
      budgetGoal: 1000,
      cashOnHand: 800,
      expenses: [{ id: "e1", description: "Test", amount: 200, category: "GROCERY", monthlyExpenseId: "1" }],
    };
    (api.getMonthDetails as jest.Mock).mockResolvedValue(mockMonthData);
    (api.createExpense as jest.Mock).mockResolvedValue({
      id: "e2",
      description: "New",
      amount: 100,
      category: "TRANSPORTATION",
      monthlyExpenseId: "1",
    });

    render(
      <Provider store={mockStore({ auth: { accessToken: "token" } })}>
        <MonthDetailsScreen route={mockRoute} />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(mockMonthData.month)).toBeTruthy();
      expect(screen.getByText("Budget: $1000")).toBeTruthy();
      expect(screen.getByText("Cash on Hand: $800.00")).toBeTruthy();
      expect(screen.getByText("Test")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText("Description"), "New");
    fireEvent.changeText(screen.getByPlaceholderText("Amount"), "100");
    fireEvent.press(screen.getByText("Add Expense"));

    await waitFor(() => {
      expect(api.createExpense).toHaveBeenCalledWith(
        expect.objectContaining({ description: "New", amount: 100, category: "TRANSPORTATION" }),
      );
      expect(screen.getByText("New")).toBeTruthy();
    });
  });

  it("disables editing for past months", async () => {
    const mockMonthData = {
      id: "1",
      month: "2024-12", // Past month
      budgetGoal: 1000,
      cashOnHand: 800,
      expenses: [{ id: "e1", description: "Test", amount: 200, category: "GROCERY", monthlyExpenseId: "1" }],
    };
    (api.getMonthDetails as jest.Mock).mockResolvedValue(mockMonthData);

    render(
      <Provider store={mockStore({ auth: { accessToken: "token" } })}>
        <MonthDetailsScreen route={mockRoute} />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.queryByText("Add Expense")).toBeNull();
    });
  });
});

Test ExpenseItem (tests/ExpenseItem.test.tsx):
ts

import { render, screen, fireEvent } from "@testing-library/react-native";
import ExpenseItem from "../src/components/ExpenseItem";

describe("ExpenseItem", () => {
  const mockItem = {
    id: "e1",
    description: "Test",
    amount: 200,
    category: "GROCERY",
    monthlyExpenseId: "1",
  };
  const onUpdate = jest.fn();
  const onDelete = jest.fn();

  it("renders expense details", () => {
    render(<ExpenseItem item={mockItem} isEditable={false} onUpdate={onUpdate} onDelete={onDelete} />);
    expect(screen.getByText("Test")).toBeTruthy();
    expect(screen.getByText("$200.00")).toBeTruthy();
    expect(screen.getByText("Category: GROCERY")).toBeTruthy();
    expect(screen.queryByText("Edit")).toBeNull();
  });

  it("allows editing when isEditable is true", async () => {
    render(<ExpenseItem item={mockItem} isEditable={true} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.press(screen.getByText("Edit"));

    fireEvent.changeText(screen.getAllByRole("text")[0], "Updated");
    fireEvent.changeText(screen.getAllByRole("text")[1], "300");
    fireEvent.press(screen.getByText("Save"));

    expect(onUpdate).toHaveBeenCalledWith("e1", {
      description: "Updated",
      amount: 300,
      category: "GROCERY",
    });
  });

  it("triggers delete when delete button is pressed", () => {
    render(<ExpenseItem item={mockItem} isEditable={true} onUpdate={onUpdate} onDelete={onDelete} />);
    fireEvent.press(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith("e1");
  });
});

Step 4: Run the Tests
bash

pnpm test

You should see output indicating passing tests:

PASS  tests/HomeScreen.test.tsx
PASS  tests/MonthDetailsScreen.test.tsx
PASS  tests/ExpenseItem.test.tsx

Explanation
HomeScreen: Tests rendering of monthly expenses and navigation on card press.

MonthDetailsScreen: Tests rendering of month details, adding expenses for the current month, and disabling edits for past months.

ExpenseItem: Tests rendering, editing, and deleting an expense.

Mocks: Redux store and API calls are mocked to isolate UI logic from external dependencies.

Optional Enhancements
Snapshot Testing:
Add snapshots to ensure UI doesn’t change unexpectedly:
ts

it("matches snapshot", () => {
  const { toJSON } = render(<ExpenseItem item={mockItem} isEditable={false} onUpdate={onUpdate} onDelete={onDelete} />);
  expect(toJSON()).toMatchSnapshot();
});

End-to-End Testing:
Use Detox or Maestro for full app testing on simulators/devices.

Coverage:
Add --coverage to the test script to see code coverage:
json

"test": "jest --coverage"

These tests cover core functionality and can be expanded as your app grows. Let me know if you want to test additional components or refine these further!

