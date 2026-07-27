import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/gamification_provider.dart';
import 'providers/learning_provider.dart';
import 'providers/theme_provider.dart';
import 'screens/main_navigation_screen.dart';
import 'services/local_db_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables for Gemini API
  try {
    await dotenv.load(fileName: '.env');
  } catch (_) {}

  final localDbService = LocalDbService();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => GamificationProvider()),
        ChangeNotifierProvider(
          create: (_) => LearningProvider(localDbService),
        ),
      ],
      child: const LinguaPopApp(),
    ),
  );
}

class LinguaPopApp extends StatelessWidget {
  const LinguaPopApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp(
      title: 'LinguaPop — Language Learning App',
      debugShowCheckedModeBanner: false,
      themeMode: themeProvider.themeMode,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: themeProvider.accentColor,
          brightness: Brightness.light,
        ),
        scaffoldBackgroundColor: const Color(0xFFF9FAFC),
        cardTheme: CardThemeData(
          color: Colors.white,
          surfaceTintColor: Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: themeProvider.accentColor,
          brightness: Brightness.dark,
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}
