import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_page.dart';
import 'screens/register_page.dart';
import 'screens/landowner_dashboard.dart';
import 'screens/farmer_dashboard.dart';
import 'screens/investor_dashboard.dart';

void main() {
  runApp(const AgricorusApp());
}

class AgricorusApp extends StatelessWidget {
  const AgricorusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Agricorus',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
      ),
      home: const SplashScreen(),
      routes: {
        '/login': (context) => const LoginPage(),
        '/register': (context) => const RegisterPage(),
        '/landowner-dashboard': (context) => const LandownerDashboard(),
        '/farmer-dashboard': (context) => const FarmerDashboard(),
        '/investor-dashboard': (context) => const InvestorDashboard(),
      },
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final role = prefs.getString('role');

    await Future.delayed(const Duration(seconds: 1));

    if (!mounted) return;

    if (token != null && role != null) {
      final route = role == 'landowner'
          ? '/landowner-dashboard'
          : role == 'farmer'
              ? '/farmer-dashboard'
              : '/investor-dashboard';
      Navigator.pushReplacementNamed(context, route);
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.agriculture, size: 80, color: Colors.green[700]),
            const SizedBox(height: 20),
            const Text('Agricorus', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
