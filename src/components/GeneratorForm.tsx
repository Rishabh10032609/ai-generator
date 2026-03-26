import { IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/react";
import { useState } from "react";
import ResultCard from "./ResultCard";
import { api } from "../services/api";

const GeneratorForm: React.FC = () => {

const [topic,setTopic] = useState("");
const [platform,setPlatform] = useState("Instagram");
const [tone,setTone] = useState("Professional");
const [result,setResult] = useState<any>(null);

const generatePost = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  try {
    const data = await api.generatePost({ topic, platform, tone }, token);
    setResult(data);
  } catch (error) {
    alert('Error generating post: ' + (error as Error).message);
  }
}

return (

<div>

<IonInput
placeholder="Enter Topic"
value={topic}
onIonChange={(e:any)=>setTopic(e.target.value)}
/>

<br/>

<IonSelect value={platform} onIonChange={(e)=>setPlatform(e.detail.value)}>
  <IonSelectOption value="Instagram">Instagram</IonSelectOption>
  <IonSelectOption value="LinkedIn">LinkedIn</IonSelectOption>
  <IonSelectOption value="Twitter">Twitter</IonSelectOption>
  <IonSelectOption value="Facebook">Facebook</IonSelectOption>
</IonSelect>

<br/>

<IonSelect value={tone} onIonChange={(e)=>setTone(e.detail.value)}>
  <IonSelectOption value="Professional">Professional</IonSelectOption>
  <IonSelectOption value="Casual">Casual</IonSelectOption>
  <IonSelectOption value="Friendly">Friendly</IonSelectOption>
</IonSelect>

<br/>

<IonButton expand="block" onClick={generatePost}>
Generate Post
</IonButton>

<br/>

{result && (

<ResultCard
title={result.title}
caption={result.caption}
hashtags={result.hashtags}
/>

)}

</div>

);

}

export default GeneratorForm;