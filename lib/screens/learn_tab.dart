import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/learning_provider.dart';
import '../providers/theme_provider.dart';
import '../models/category.dart';

class LearnTab extends StatelessWidget {
  const LearnTab({super.key});

  IconData _getCategoryIcon(String iconName) {
    switch (iconName) {
      case 'menu_book':
        return Icons.menu_book;
      case 'auto_stories':
        return Icons.auto_stories;
      case 'flight_takeoff':
        return Icons.flight_takeoff;
      case 'restaurant':
        return Icons.restaurant;
      case 'chat':
        return Icons.chat;
      default:
        return Icons.translate;
    }
  }

  @override
  Widget build(BuildContext context) {
    final learning = Provider.of<LearningProvider>(context);
    final theme = Provider.of<ThemeProvider>(context);
    final categories = learning.categories;
    final dailyQueue = learning.dailyReviewQueue;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your Learning Path',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Real-time Firestore progress & Leitner Spaced Repetition',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                  ),
                  const SizedBox(height: 20),

                  // Leitner Daily Queue Banner
                  if (dailyQueue.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            theme.accentColor.withValues(alpha: 0.15),
                            theme.accentColor.withValues(alpha: 0.05),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: theme.accentColor.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: theme.accentColor,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 24),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Daily Leitner Queue',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Next up: "${dailyQueue.first.sourceWord}" (${dailyQueue.first.translation})',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey.shade700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  Text(
                    'Categories',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
          ),

          // Categories Grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            sliver: categories.isEmpty
                ? const SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(30.0),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  )
                : SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.9,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final cat = categories[index];
                        final progressPct = learning.getCategoryMasteryProgress(cat.id);
                        final displayPct = (progressPct * 100).toInt();

                        return Card(
                          elevation: 2,
                          shadowColor: Colors.black.withValues(alpha: 0.08),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(24),
                          ),
                          child: InkWell(
                            borderRadius: BorderRadius.circular(24),
                            onTap: () {
                              // Open quiz or lesson for category
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => CategoryDetailScreen(category: cat),
                                ),
                              );
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  // Progress Ring surrounding Category Icon
                                  Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      SizedBox(
                                        width: 70,
                                        height: 70,
                                        child: CircularProgressIndicator(
                                          value: progressPct,
                                          strokeWidth: 6,
                                          backgroundColor: Colors.grey.shade200,
                                          valueColor: AlwaysStoppedAnimation<Color>(
                                            theme.accentColor,
                                          ),
                                        ),
                                      ),
                                      Icon(
                                        _getCategoryIcon(cat.iconName),
                                        size: 32,
                                        color: theme.accentColor,
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    cat.title,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$displayPct% Mastered',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: progressPct > 0.0
                                          ? theme.accentColor
                                          : Colors.grey.shade600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      childCount: categories.length,
                    ),
                  ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }
}

class CategoryDetailScreen extends StatelessWidget {
  final CategoryModel category;
  const CategoryDetailScreen({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(category.title),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                category.description,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  // Direct to flashcard flow
                },
                icon: const Icon(Icons.style),
                label: const Text('Start Flashcards'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(200, 50),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                },
                icon: const Icon(Icons.quiz),
                label: const Text('Take Category Quiz'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(200, 50),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
