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
import { search, share, logoWhatsapp, logoFacebook, logoTwitter, copy } from 'ionicons/icons';
import { api } from '../services/api';
import './GeneratorForm.css';

const GeneratorForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState<{current: number, limit: number, remaining: number} | null>(null);
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

  // Fetch current usage on mount
  useEffect(() => {
    const fetchUsage = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // We'll add a usage endpoint later, for now just initialize
          setUsage(null);
        } catch (err) {
          console.error('Failed to fetch usage:', err);
        }
      }
    };

    fetchUsage();
  }, []);

  // Function to download image
  const downloadImage = (base64Data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to convert base64 to blob
  const base64ToBlob = (base64Data: string): Blob => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  };

  // Function to share image
  const shareImage = async (base64Data: string, filename: string, title: string) => {
    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        const blob = base64ToBlob(base64Data);
        const file = new File([blob], filename, { type: 'image/png' });
        
        // Check if the browser supports sharing files
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'AI Generated Content',
            text: title,
            files: [file]
          });
          return;
        }
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Function to share to WhatsApp
  const shareToWhatsApp = (title: string) => {
    const text = encodeURIComponent(title);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  // Function to share to Facebook
  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  // Function to share to Twitter
  const shareToTwitter = (title: string) => {
    const text = encodeURIComponent(`Check out this AI-generated content: ${title}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank');
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Content copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy content');
    });
  };

  const generateContent = async () => {
    if (!topic) return;

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to generate content');
        setLoading(false);
        return;
      }

      const response = await api.generatePost({
        topic: topic,
        platform: 'Instagram',
        tone: 'engaging'
      }, token);

      setResult(response.content);
      setUsage(response.usage);
    } catch (err: any) {
      console.error(err);

      // Handle rate limiting (429 status)
      if (err.response?.status === 429) {
        const errorData = err.response.data?.detail;
        setError(`🚫 ${errorData?.message || 'Free request limit exceeded. Please upgrade to premium for unlimited access.'}`);
        setUsage({
          current: errorData?.current_usage || 3,
          limit: errorData?.limit || 3,
          remaining: 0
        });
      } else if (err.message?.includes('Free request limit exceeded')) {
        setError('🚫 You have reached your free request limit. Please upgrade to premium for unlimited access.');
      } else {
        setError('❌ Something went wrong. Please try again.');
      }
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

        {/* USAGE DISPLAY */}
        {usage && (
          <div className="usage-display">
            <div className="usage-info">
              <span className="usage-text">
                Requests: {usage.current}/{usage.limit}
                {usage.remaining > 0 && ` (${usage.remaining} remaining)`}
              </span>
              <div className="usage-bar">
                <div
                  className={`usage-progress ${usage.current >= usage.limit * 0.8 ? 'danger' : usage.current >= usage.limit * 0.5 ? 'warning' : ''}`}
                  style={{ width: `${Math.min((usage.current / usage.limit) * 100, 100)}%` }}
                ></div>
              </div>
              {usage.remaining === 0 && (
                <span className="upgrade-prompt">
                  🚀 Upgrade to Premium for unlimited access!
                </span>
              )}
            </div>
          </div>
        )}

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
          {error.includes('free request limit') && (
            <div className="upgrade-section">
              <IonButton
                fill="solid"
                color="primary"
                onClick={() => window.open('https://your-payment-link.com', '_blank')}
                className="upgrade-button"
              >
                🚀 Upgrade to Premium - $9.99/month
              </IonButton>
              <p className="upgrade-features">
                ✓ Unlimited content generation<br/>
                ✓ Priority support<br/>
                ✓ Advanced AI features
              </p>
            </div>
          )}
        </div>
      )}

      {/* RESULT CARD */}
      {result && result.type === 'text' && (
        <IonCard className="result-card">
          <IonCardContent>
            <IonText>
              <h2 className="result-title">{result.content?.title || result.title}</h2>
            </IonText>

            <IonText>
              <p className="result-content">{result.content?.caption || result.caption}</p>
            </IonText>

            <div className="hashtags-container">
              {(result.content?.hashtags || result.hashtags)?.split(' ').map((tag: string, idx: number) => (
                <IonChip key={idx} className="hashtag-chip">
                  {tag}
                </IonChip>
              ))}
            </div>

            {/* TEXT ACTION BUTTONS */}
            <div className="action-buttons">
              <IonButton
                expand="full"
                onClick={() => copyToClipboard(`${result.content?.title || result.title}\n\n${result.content?.caption || result.caption}\n\n${result.content?.hashtags || result.hashtags}`)}
                className="download-button"
              >
                <IonIcon slot="start" icon={copy} />
                Copy Text
              </IonButton>
              
              <IonButton
                expand="full"
                onClick={() => shareImage('', 'content', result.content?.title || result.title)}
                className="share-button"
              >
                <IonIcon slot="start" icon={share} />
                Share
              </IonButton>
            </div>

            {/* TEXT PLATFORM SHARE BUTTONS */}
            <div className="platform-share-section">
              <p className="share-label">Share on social media:</p>
              <div className="platform-buttons">
                <IonButton
                  size="small"
                  onClick={() => shareToWhatsApp(`${result.content?.title || result.title}\n${result.content?.hashtags || result.hashtags}`)}
                  className="whatsapp-btn"
                  title="Share on WhatsApp"
                >
                  <IonIcon slot="start" icon={logoWhatsapp} />
                  WhatsApp
                </IonButton>

                <IonButton
                  size="small"
                  onClick={() => shareToTwitter(result.content?.title || result.title)}
                  className="twitter-btn"
                  title="Share on Twitter"
                >
                  <IonIcon slot="start" icon={logoTwitter} />
                  Twitter
                </IonButton>

                <IonButton
                  size="small"
                  onClick={() => shareToFacebook()}
                  className="facebook-btn"
                  title="Share on Facebook"
                >
                  <IonIcon slot="start" icon={logoFacebook} />
                  Facebook
                </IonButton>

                <IonButton
                  size="small"
                  onClick={() => copyToClipboard(result.content?.caption || result.caption)}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  <IonIcon slot="start" icon={copy} />
                  Copy
                </IonButton>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      )}

      {/* IMAGE RESULT */}
      {result && result.type === 'image' && (
        <IonCard className="result-card">
          <IonCardContent>
            <img
              src={`data:image/png;base64,${result.image_data}`}
              alt="Generated"
              className="result-image"
            />
            
            {/* ACTION BUTTONS */}
            <div className="action-buttons">
              <IonButton
                expand="full"
                onClick={() => downloadImage(result.image_data, result.filename)}
                className="download-button"
              >
                <IonIcon slot="start" icon={search} />
                Download
              </IonButton>
              
              <IonButton
                expand="full"
                onClick={() => shareImage(result.image_data, result.filename, result.title || 'Check this out!')}
                className="share-button"
              >
                <IonIcon slot="start" icon={share} />
                Share
              </IonButton>
            </div>

            {/* PLATFORM SHARE BUTTONS */}
            <div className="platform-share-section">
              <p className="share-label">Share on social media:</p>
              <div className="platform-buttons">
                <IonButton
                  size="small"
                  onClick={() => shareToWhatsApp(result.title || 'Check out this AI-generated content!')}
                  className="whatsapp-btn"
                  title="Share on WhatsApp"
                >
                  <IonIcon slot="start" icon={logoWhatsapp} />
                  WhatsApp
                </IonButton>

                <IonButton
                  size="small"
                  onClick={() => shareToTwitter(result.title || 'AI Generated')}
                  className="twitter-btn"
                  title="Share on Twitter"
                >
                  <IonIcon slot="start" icon={logoTwitter} />
                  Twitter
                </IonButton>

                <IonButton
                  size="small"
                  onClick={() => shareToFacebook()}
                  className="facebook-btn"
                  title="Share on Facebook"
                >
                  <IonIcon slot="start" icon={logoFacebook} />
                  Facebook
                </IonButton>

                <IonButton
                  size="small"
                  onClick={() => copyToClipboard(result.title || 'Generated content')}
                  className="copy-btn"
                  title="Copy to clipboard"
                >
                  <IonIcon slot="start" icon={copy} />
                  Copy
                </IonButton>
              </div>
            </div>
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