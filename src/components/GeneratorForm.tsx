import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner,
  IonIcon,
  IonChip
} from '@ionic/react';
import { search } from 'ionicons/icons';
import axios from 'axios';
import './GeneratorForm.css';

const GeneratorForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 👉 BACKEND URL (for web)
  const BASE_URL = 'http://127.0.0.1:8000';

  const generateContent = async () => {
    if (!topic) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/generate`, {
        topic: topic
      });

      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Something went wrong. Check backend.');
    }

    setLoading(false);
  };

  const suggestedTopics = [
    'AI Ethics',
    'Future of Travel',
    'Quantum Computing',
    'Space News',
    'Neuroscience'
  ];

  const featuredTopics = [
    { icon: '🧠', title: 'Trending Now', desc: 'Latest AI insights' },
    { icon: '🚀', title: 'Tech & Science', desc: 'Stay updated on tech' }
  ];

  return (
    <div className={`generator-form ${isDark ? 'dark-theme' : 'light-theme'}`}>
      {/* HERO SECTION */}
      <div className="hero-section">
        <div className="hero-header">
          <h1 className="hero-title">
            Unlock <span className="highlight">AI Insights</span> for Any Topic
          </h1>
          <p className="hero-subtitle">
            Navigate the future of information with our generative intelligence engine.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <IonIcon icon={search} className="search-icon" />
            <IonInput
              className="search-input"
              placeholder="Enter any topic..."
              value={topic}
              onIonChange={(e) => setTopic(e.detail.value!)}
              onKeyPress={(e) => e.key === 'Enter' && generateContent()}
            />
          </div>

          {/* GENERATE BUTTON */}
          <IonButton
            className="generate-button"
            onClick={generateContent}
            disabled={!topic || loading}
          >
            <IonIcon slot="start" icon={search} />
            SEARCH AI
          </IonButton>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-container">
          <IonSpinner name="crescent" />
          <p>Generating insights...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="error-container">
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        </div>
      )}

      {/* RESULT CARD */}
      {result && result.type === 'text' && (
        <IonCard className="result-card">
          <IonCardContent>
            <IonText>
              <h2 className="result-title">{result.title}</h2>
            </IonText>

            <IonText>
              <p className="result-content">{result.caption}</p>
            </IonText>

            <div className="hashtags-container">
              {result.hashtags?.split(' ').map((tag: string, idx: number) => (
                <IonChip key={idx} className="hashtag-chip">
                  {tag}
                </IonChip>
              ))}
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* IMAGE RESULT */}
      {result && result.type === 'image' && (
        <IonCard className="result-card">
          <IonCardContent>
            <img
              src={result.image_url}
              alt="Generated"
              className="result-image"
            />
          </IonCardContent>
        </IonCard>
      )}

      {/* FEATURED SECTION - Shows when no results */}
      {!result && !loading && (
        <>
          {/* TRENDING NOW SECTION */}
          <div className="featured-section">
            <h3 className="featured-title">Trending Now</h3>
            <div className="trending-grid">
              {featuredTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="featured-card"
                  onClick={() => setTopic(topic.title)}
                >
                  <span className="featured-icon">{topic.icon}</span>
                  <h4>{topic.title}</h4>
                  <p>{topic.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT TOPICS SECTION */}
          <div className="recent-section">
            <h3 className="recent-title">Recent Topics</h3>
            <div className="topics-container">
              {suggestedTopics.map((topic, idx) => (
                <IonChip
                  key={idx}
                  className="topic-chip"
                  onClick={() => setTopic(topic)}
                >
                  {topic}
                </IonChip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneratorForm;