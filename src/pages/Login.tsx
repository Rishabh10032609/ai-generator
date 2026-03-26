import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonItem, IonLabel, IonToast } from '@ionic/react';
import { api } from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();

  const isAuthenticated = () => !!localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated()) {
      history.replace('/dashboard');
    }
  }, [history]);

  const handleSubmit = async () => {
    try {
      const data = isRegister ? await api.register({ email, password }) : await api.login({ email, password });
      localStorage.setItem('token', data.access_token);
      setToastMessage(isRegister ? 'Registration successful!' : 'Login successful!');
      setShowToast(true);
      history.replace('/dashboard');
    } catch (error) {
      setToastMessage('Error: ' + (error as Error).message);
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isRegister ? 'Register' : 'Login'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput value={email} onIonChange={e => setEmail(e.detail.value!)} type="email" />
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput value={password} onIonChange={e => setPassword(e.detail.value!)} type="password" />
        </IonItem>
        <IonButton expand="full" onClick={handleSubmit}>
          {isRegister ? 'Register' : 'Login'}
        </IonButton>
        <IonButton fill="clear" expand="full" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
        </IonButton>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;