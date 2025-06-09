import { DefaultTheme } from "react-native-paper";
import { ViewStyle, TextStyle, StyleProp } from "react-native";

// Tipagem para as cores
interface Colors {
  [key: string]: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  dark: string;
  darkLight: string;
  light: string;
  gray: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  white: string;
  background: string;
}

export const colors: Colors = {
  primary: "#00b4d8",
  primaryDark: "#0096c7",
  primaryLight: "#90e0ef",
  secondary: "#ffd60a",
  secondaryDark: "#ffc300",
  dark: "#0a1128",
  darkLight: "#1a2c56",
  light: "#f8f9fa",
  gray: "#6c757d",
  success: "#10b981",
  warning1: "#59e0b",
  warning2: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  white: "#ffffff",
  background: "#f0f5ff",
   warning: "#f59e0b", 
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.white,
    text: colors.dark,
    error: colors.danger,
  },
};


interface GlobalStyles {
  container: StyleProp<ViewStyle>;
  card: StyleProp<ViewStyle>;
  button: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
  title: StyleProp<TextStyle>;
  subtitle: StyleProp<TextStyle>;
}

export const globalStyles: GlobalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: "System",
    color: colors.dark,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 16,
  },
};
