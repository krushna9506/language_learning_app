import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/gamification_provider.dart';
import '../providers/theme_provider.dart';

class DuolingoQuestsTab extends StatelessWidget {
  const DuolingoQuestsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final gamification = Provider.of<GamificationProvider>(context);
    final theme = Provider.of<ThemeProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Quests & Leagues',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                'Duolingo-style hearts, XP levels, and daily achievements',
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 20),

              // Hearts & XP Status Card
              Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          // Hearts Counter
                          Column(
                            children: [
                              Row(
                                children: List.generate(gamification.maxHearts, (idx) {
                                  return Icon(
                                    idx < gamification.hearts
                                        ? Icons.favorite
                                        : Icons.favorite_border,
                                    color: Colors.red,
                                    size: 26,
                                  );
                                }),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                '${gamification.hearts}/${gamification.maxHearts} Hearts Left',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              if (gamification.hearts < gamification.maxHearts)
                                TextButton(
                                  onPressed: () => gamification.refillHearts(),
                                  child: const Text('Refill Hearts ❤️'),
                                ),
                            ],
                          ),

                          // XP Counter
                          Column(
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.bolt, color: Colors.amber, size: 30),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${gamification.xp} XP',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 22,
                                      color: Colors.amber,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                gamification.leagueName,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: theme.accentColor,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(),
                      const SizedBox(height: 10),

                      // Level Progress Bar
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Next Level Progress', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text('${(gamification.xpProgressInCurrentLevel * 100).toInt()}%', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          LinearProgressIndicator(
                            value: gamification.xpProgressInCurrentLevel,
                            minHeight: 10,
                            borderRadius: BorderRadius.circular(10),
                            backgroundColor: Colors.grey.shade200,
                            valueColor: AlwaysStoppedAnimation<Color>(theme.accentColor),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),

              Text(
                'Daily Quests',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 12),

              // Quests List
              ...gamification.quests.map((quest) {
                final pct = (quest.current / quest.target).clamp(0.0, 1.0);

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  elevation: 2,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: quest.isCompleted
                                    ? Colors.green.shade50
                                    : theme.accentColor.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                quest.isCompleted ? Icons.check_circle : Icons.stars,
                                color: quest.isCompleted ? Colors.green : theme.accentColor,
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    quest.title,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    quest.description,
                                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: Colors.amber.shade50,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '+${quest.rewardXp} XP',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.amber,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        LinearProgressIndicator(
                          value: pct,
                          minHeight: 8,
                          borderRadius: BorderRadius.circular(8),
                          backgroundColor: Colors.grey.shade200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            quest.isCompleted ? Colors.green : theme.accentColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}
