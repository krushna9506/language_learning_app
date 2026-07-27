import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/learning_provider.dart';
import '../providers/theme_provider.dart';

class StreakStatsTab extends StatelessWidget {
  const StreakStatsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final learning = Provider.of<LearningProvider>(context);
    final theme = Provider.of<ThemeProvider>(context);
    final stats = learning.get14DayStats();
    final masteredTotal = learning.totalWordsMastered;
    final streak = learning.streakCount;

    final statEntries = stats.entries.toList();

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Streak & Analytics',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                'Real-time learning statistics driven by Firestore streams',
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 20),

              // Streak & Words Mastered Cards Row
              Row(
                children: [
                  Expanded(
                    child: Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      child: Padding(
                        padding: const EdgeInsets.all(18.0),
                        child: Column(
                          children: [
                            const Icon(Icons.local_fire_department, color: Colors.deepOrange, size: 36),
                            const SizedBox(height: 8),
                            Text(
                              '$streak Days',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                                color: Colors.deepOrange,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text('Active Streak', style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      child: Padding(
                        padding: const EdgeInsets.all(18.0),
                        child: Column(
                          children: [
                            Icon(Icons.verified, color: theme.accentColor, size: 36),
                            const SizedBox(height: 8),
                            Text(
                              '$masteredTotal Words',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 20,
                                color: theme.accentColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text('Mastered Total', style: TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // 14-Day fl_chart Bar Chart Section
              Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '14-Day Learning History',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: theme.accentColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              'fl_chart',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: theme.accentColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Words reviewed per day',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 24),

                      SizedBox(
                        height: 220,
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: 10,
                            barTouchData: BarTouchData(enabled: true),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    final index = value.toInt();
                                    if (index >= 0 && index < statEntries.length) {
                                      final date = statEntries[index].key;
                                      return Padding(
                                        padding: const EdgeInsets.only(top: 6.0),
                                        child: Text(
                                          '${date.month}/${date.day}',
                                          style: const TextStyle(fontSize: 9),
                                        ),
                                      );
                                    }
                                    return const Text('');
                                  },
                                ),
                              ),
                              leftTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              rightTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              topTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                            ),
                            gridData: const FlGridData(show: false),
                            borderData: FlBorderData(show: false),
                            barGroups: List.generate(statEntries.length, (idx) {
                              final count = statEntries[idx].value.toDouble();
                              return BarChartGroupData(
                                x: idx,
                                barRods: [
                                  BarChartRodData(
                                    toY: count == 0 ? 0.3 : count,
                                    color: count > 0 ? theme.accentColor : Colors.grey.shade300,
                                    width: 12,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                ],
                              );
                            }),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Requirements Explanation Card for User Review
              Card(
                color: Colors.blue.shade50,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.blue),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Note: A word is counted as "Mastered" only when both quiz score (>=70%) and pronunciation score (>=70%) criteria are fulfilled.',
                          style: TextStyle(fontSize: 12, color: Colors.blue),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
