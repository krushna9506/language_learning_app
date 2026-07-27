import 'package:flutter/material.dart';

class ThemeProvider extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;
  Color _accentColor = const Color(0xFF58CC02); // Duolingo-style energetic green

  ThemeMode get themeMode => _themeMode;
  Color get accentColor => _accentColor;

  void toggleTheme(bool isDark) {
    _themeMode = isDark ? ThemeMode.dark : ThemeMode.light;
    notifyListeners();
  }

  void setAccentColor(Color color) {
    _accentColor = color;
    notifyListeners();
  }
}
