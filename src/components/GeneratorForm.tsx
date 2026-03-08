import { IonInput, IonButton, IonSelect, IonSelectOption } from "@ionic/react";
import { useState } from "react";
import ResultCard from "./ResultCard";

const GeneratorForm: React.FC = () => {

const [topic,setTopic] = useState("");
const [platform,setPlatform] = useState("Instagram");
const [tone,setTone] = useState("Professional");
const [result,setResult] = useState<any>(null);

const generatePost = async () => {

 const response = await fetch("http://localhost:8000/generate",{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body: JSON.stringify({
    topic,
    platform,
    tone
  })
 });

 const data = await response.json();

 setResult(data);
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