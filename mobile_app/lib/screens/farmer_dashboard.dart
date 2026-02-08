import 'package:flutter/material.dart';
import '../services/api_service.dart';

class FarmerDashboard extends StatelessWidget {
  const FarmerDashboard({super.key});

  Future<void> _logout(BuildContext context) async {
    await ApiService.clearToken();
    if (!context.mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmer Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Welcome, Farmer!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                children: [
                  _buildDashboardCard(Icons.add_business, 'Add Project', Colors.green),
                  _buildDashboardCard(Icons.view_list, 'My Projects', Colors.blue),
                  _buildDashboardCard(Icons.pending_actions, 'Active Leases', Colors.orange),
                  _buildDashboardCard(Icons.gavel, 'Disputes', Colors.red),
                  _buildDashboardCard(Icons.verified_user, 'KYC Status', Colors.teal),
                  _buildDashboardCard(Icons.person, 'Profile', Colors.indigo),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardCard(IconData icon, String title, Color color) {
    return Card(
      elevation: 4,
      child: InkWell(
        onTap: () {},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
