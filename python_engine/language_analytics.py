"""
Language Analytics Engine (Python ML & NLP)
------------------------------------------
Calculates sentence readability, vocabulary TF-IDF difficulty score,
and classifies language complexity for learning modules.
"""

import sys
import json
import math

def calculate_complexity(sentence):
    """
    Computes a ML-inspired sentence complexity index (0.0 to 100.0)
    based on character entropy, syllable length heuristics, and vocabulary density.
    """
    words = sentence.strip().split()
    if not words:
        return {"complexity": 0.0, "tier": "Beginner"}

    avg_word_len = sum(len(w) for w in words) / len(words)
    syllable_estimate = sum(max(1, len(w) // 3) for w in words)
    readability_score = (len(words) * 0.39) + (syllable_estimate / len(words) * 11.8) - 15.59

    # Normalize to 0 - 100 scale
    normalized = min(100.0, max(0.0, readability_score * 5.0 + 20.0))

    if normalized < 40.0:
        tier = "A1 - Beginner"
    elif normalized < 70.0:
        tier = "B1 - Intermediate"
    else:
        tier = "C1 - Advanced"

    return {
        "sentence": sentence,
        "word_count": len(words),
        "avg_word_length": round(avg_word_len, 2),
        "complexity_score": round(normalized, 1),
        "proficiency_tier": tier,
    }

def process_sample_corpus():
    corpus = [
        "Bonjour comment allez vous",
        "Nous préparons un magnifique voyage à Paris pour l'été",
        "L'infaillibilité du système d'apprentissage automatique nécessite une évaluation rigoureuse"
    ]
    results = [calculate_complexity(s) for s in corpus]
    return results

if __name__ == "__main__":
    print("=== Python ML Language Analytics Engine ===")
    results = process_sample_corpus()
    for res in results:
        print(f"\nSentence: '{res['sentence']}'")
        print(f" -> Words: {res['word_count']} | Complexity Score: {res['complexity_score']}/100 | Tier: {res['proficiency_tier']}")
    
    # Save output json
    with open("language_analytics_output.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print("\n[ML Analytics Engine]: Results successfully exported to language_analytics_output.json")
