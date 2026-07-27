import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/chat_message.dart';
import '../providers/gamification_provider.dart';
import '../providers/learning_provider.dart';
import '../providers/theme_provider.dart';
import '../services/ai_tutor_service.dart';

class AiTutorChatTab extends StatefulWidget {
  const AiTutorChatTab({super.key});

  @override
  State<AiTutorChatTab> createState() => _AiTutorChatTabState();
}

class _AiTutorChatTabState extends State<AiTutorChatTab> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  final List<ChatMessage> _messages = [];
  bool _isTyping = false;

  final List<String> _suggestedPrompts = [
    '☕ Practice ordering coffee',
    '✈️ Hotel check-in roleplay',
    '👋 Casual greeting exchange',
    '❓ Explain past tense rules',
  ];

  @override
  void initState() {
    super.initState();
    // Welcome message
    _messages.add(
      ChatMessage(
        id: 'welcome',
        text: 'Bonjour! I am your AI Language Tutor. What would you like to practice today?',
        translation: 'Hello! I am your AI Language Tutor. What would you like to practice today?',
        isUser: false,
        timestamp: DateTime.now(),
      ),
    );
  }

  void _sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      text: text.trim(),
      isUser: true,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _isTyping = true;
    });

    _textController.clear();
    _scrollToBottom();

    final learning = Provider.of<LearningProvider>(context, listen: false);
    final gamification = Provider.of<GamificationProvider>(context, listen: false);

    // Call AI Tutor Service (Gemini API / Multi-Model AI)
    final aiRes = await AiTutorService.chatWithTutor(
      userMessage: text,
      targetLanguage: learning.targetLanguage,
      conversationHistory: _messages,
    );

    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add(
          ChatMessage(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            text: aiRes.reply,
            translation: aiRes.translation,
            correction: aiRes.correction,
            isUser: false,
            timestamp: DateTime.now(),
          ),
        );
      });

      _scrollToBottom();

      // Award XP for chatting and update Daily Quest progress
      gamification.addXp(10);
      gamification.updateQuestProgress('quest_2', 1);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Provider.of<ThemeProvider>(context);
    final learning = Provider.of<LearningProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Top Header Bar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: theme.accentColor.withValues(alpha: 0.2),
                    child: Icon(Icons.smart_toy_rounded, color: theme.accentColor),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AI ${learning.targetLanguage} Tutor',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.green,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Gemini 2.5 AI Active',
                            style: TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.purple.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.auto_awesome, color: Colors.purple, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'Multi-Model',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.purple,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Messages List
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (ctx, idx) {
                  final msg = _messages[idx];
                  return _buildMessageBubble(msg, theme);
                },
              ),
            ),

            if (_isTyping)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: const [
                    SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                    SizedBox(width: 10),
                    Text(
                      'AI Tutor is typing...',
                      style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey),
                    ),
                  ],
                ),
              ),

            // Suggested Prompt Chips
            SizedBox(
              height: 44,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _suggestedPrompts.length,
                itemBuilder: (ctx, idx) {
                  final prompt = _suggestedPrompts[idx];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ActionChip(
                      label: Text(prompt, style: const TextStyle(fontSize: 12)),
                      onPressed: () => _sendMessage(prompt.substring(2).trim()),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),

            // Input Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: Theme.of(context).cardColor,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      decoration: InputDecoration(
                        hintText: 'Type a message in ${learning.targetLanguage}...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                      onSubmitted: _sendMessage,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: () => _sendMessage(_textController.text),
                    icon: const Icon(Icons.send_rounded),
                    style: IconButton.styleFrom(
                      backgroundColor: theme.accentColor,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg, ThemeProvider theme) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: msg.isUser ? theme.accentColor : Theme.of(context).cardColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: Radius.circular(msg.isUser ? 20 : 4),
            bottomRight: Radius.circular(msg.isUser ? 4 : 20),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: msg.isUser ? Colors.white : Theme.of(context).colorScheme.onSurface,
              ),
            ),
            if (msg.translation != null) ...[
              const SizedBox(height: 6),
              Text(
                'Translation: ${msg.translation}',
                style: TextStyle(
                  fontSize: 12,
                  color: msg.isUser ? Colors.white.withValues(alpha: 0.85) : Colors.grey.shade600,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
            if (msg.correction != null) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lightbulb, size: 16, color: Colors.amber),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        msg.correction!,
                        style: TextStyle(fontSize: 11, color: Colors.amber.shade900),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }
}
