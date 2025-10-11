import { Platform } from "react-native";

export function useToggleTheme() {
  if (Platform.OS === "web") {
    // For web, we'll use the media query to toggle the theme
    return () => {
      const html = document.documentElement;
      if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
      } else {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
      }
    };
  } else {
    // For native platforms, we'll use the Appearance API
    return () => {
      const { Appearance } = require("react-native");
      const currentColorScheme = Appearance.getColorScheme();
      Appearance.setColorScheme(
        currentColorScheme === "dark" ? "light" : "dark"
      );
    };
  }
}
