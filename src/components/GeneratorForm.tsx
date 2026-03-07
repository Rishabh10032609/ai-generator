import { IonInput, IonButton } from "@ionic/react";
import { useState } from "react";
import ResultCard from "./ResultCard";

const GeneratorForm: React.FC = () => {

const [topic,setTopic] = useState("");
const [result,setResult] = useState<any>(null);

const generatePost = async () => {

 const response = await fetch("http://localhost:8000/generate",{
  method:"POST",
  headers:{
   "Content-Type":"application/json"
  },
  body: JSON.stringify({ topic })
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