import React, { useState } from 'react';
import {
  IonItem,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner
} from '@ionic/react';
import axios from 'axios';

const GeneratorForm: React.FC = () => {

  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

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

  return (
    <div>

      {/* INPUT */}
      <IonItem>
        <IonInput
          placeholder="Try: gym post OR gym poster image"
          value={topic}
          onIonChange={(e) => setTopic(e.detail.value!)}
        />
      </IonItem>

      {/* BUTTON */}
      <IonButton
        expand="block"
        onClick={generateContent}
        style={{ marginTop: '12px' }}
      >
        Generate
      </IonButton>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <IonSpinner name="crescent" />
        </div>
      )}

      {/* ERROR */}
      {error && (
        <IonText color="danger">
          <p style={{ marginTop: '10px' }}>{error}</p>
        </IonText>
      )}

      {/* TEXT RESULT */}
      {result && result.type === 'text' && (
        <IonCard style={{ marginTop: '20px' }}>
          <IonCardContent>

            <IonText>
              <h2>{result.title}</h2>
            </IonText>

            <IonText>
              <p>{result.caption}</p>
            </IonText>

            <IonText color="primary">
              <p>{result.hashtags}</p>
            </IonText>

          </IonCardContent>
        </IonCard>
      )}

      {/* IMAGE RESULT */}
      {result && result.type === 'image' && (
        <IonCard style={{ marginTop: '20px', textAlign: 'center' }}>
          <IonCardContent>

            <img
              src={result.image_url}
              alt="Generated"
              style={{
                width: '100%',
                borderRadius: '10px',
                marginTop: '10px'
              }}
            />

          </IonCardContent>
        </IonCard>
      )}

    </div>
  );
};

export default GeneratorForm;