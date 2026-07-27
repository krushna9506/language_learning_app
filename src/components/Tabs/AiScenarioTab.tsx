import React, { useState } from 'react';
import { Language, RoleplayScenario } from '../../types';
import { AiOrchestrator } from '../../services/aiOrchestrator';
import { Compass, Send, Award, CheckCircle2, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface AiScenarioTabProps {
  currentLanguage: Language;
  accentColor: string;
  onRewardXp: (amount: number) => void;
}

const SCENARIOS: RoleplayScenario[] = [
  {
    id: 'airport',
    title: 'Airport Customs & Immigration',
    description: 'Answer customs officer questions at international arrival',
    icon: '✈️',
    initialMessage: 'Bonjour. Quel est l\'objet de votre visite?',
    initialTranslation: 'Hello. What is the purpose of your visit?',
  },
  {
    id: 'restaurant',
    title: 'Michelin Restaurant Ordering',
    description: 'Reserve a table, ask for dietary options, and order wine',
    icon: '🍷',
    initialMessage: 'Bonsoir! Avez-vous une réservation pour ce soir?',
    initialTranslation: 'Good evening! Do you have a reservation for tonight?',
  },
  {
    id: 'emergency',
    title: 'Pharmacy & Medical Help',
    description: 'Explain your symptoms and get medicine from a pharmacist',
    icon: '🏥',
    initialMessage: 'Bonjour, comment puis-je vous aider aujourd\'hui?',
    initialTranslation: 'Hello, how can I help you today?',
  },
  {
    id: 'interview',
    title: 'Global Job Interview',
    description: 'Introduce your professional experience and answer interview questions',
    icon: '💼',
    initialMessage: 'Bienvenue! Pouvez-vous vous présenter brièvement?',
    initialTranslation: 'Welcome! Can you briefly introduce yourself?',
  },
];

export const AiScenarioTab: React.FC<AiScenarioTabProps> = ({
  currentLanguage,
  accentColor,
  onRewardXp,
}) => {
  const [activeScenario, setActiveScenario] = useState<RoleplayScenario | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{ feedback: string; fluencyScore: number; grammarScore: number } | null>(null);

  const handleStartScenario = (sc: RoleplayScenario) => {
    setActiveScenario(sc);
    setUserResponse('');
    setEvaluation(null);
  };

  const handleEvaluate = async () => {
    if (!userResponse.trim() || !activeScenario) return;
    setIsEvaluating(true);

    const res = await AiOrchestrator.evaluateRoleplayResponse(
      userResponse,
      activeScenario.title,
      currentLanguage
    );

    setEvaluation(res);
    setIsEvaluating(false);
    onRewardXp(20);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Real-World AI Scenarios</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Interactive situation roleplay simulations with live AI diagnostic scorecard
        </p>
      </div>

      {!activeScenario ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {SCENARIOS.map((sc) => (
            <div
              key={sc.id}
              className="hover-card glass-panel"
              onClick={() => handleStartScenario(sc)}
              style={{ padding: '24px', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{sc.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{sc.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
                {sc.description}
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: accentColor, fontWeight: 800, fontSize: '13px' }}>
                Start Simulation <Compass size={16} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button className="btn-outline" onClick={() => setActiveScenario(null)} style={{ alignSelf: 'flex-start' }}>
            ← Back to Scenarios
          </button>

          {/* Scenario Header */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>{activeScenario.icon}</span>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>{activeScenario.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{activeScenario.description}</p>
              </div>
            </div>

            {/* Officer / Counterpart Initial Prompt */}
            <div style={{ padding: '16px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} color={accentColor} /> AI Counterpart
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: accentColor }}>"{activeScenario.initialMessage}"</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeScenario.initialTranslation}</div>
            </div>
          </div>

          {/* User Input & Action */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px' }}>Your Response in {currentLanguage}:</h4>
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder={`e.g. Je suis ici pour les vacances...`}
              rows={3}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                outline: 'none',
                resize: 'none',
                marginBottom: '16px',
              }}
            />
            <button
              className="btn-primary"
              onClick={handleEvaluate}
              disabled={isEvaluating || !userResponse.trim()}
              style={{ backgroundColor: accentColor, width: '100%', justifyContent: 'center' }}
            >
              <Sparkles size={18} /> {isEvaluating ? 'AI Diagnosing Fluency...' : 'Submit & Get AI Scorecard (+20 XP)'}
            </button>
          </div>

          {/* Evaluation Scorecard */}
          {evaluation && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={22} color="#eab308" /> AI Diagnostic Scorecard
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ padding: '14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700 }}>Fluency Score</div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#15803d' }}>{evaluation.fluencyScore}%</div>
                </div>
                <div style={{ padding: '14px', background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#6b21a8', fontWeight: 700 }}>Grammar Score</div>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#7e22ce' }}>{evaluation.grammarScore}%</div>
                </div>
              </div>

              <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '14px', fontSize: '14px', lineHeight: 1.5 }}>
                <strong>AI Feedback:</strong> {evaluation.feedback}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
