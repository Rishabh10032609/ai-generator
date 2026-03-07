import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/react";

interface Props {
 title: string;
 caption: string;
 hashtags: string;
}

const ResultCard: React.FC<Props> = ({title,caption,hashtags}) => {

 return (

<IonCard>

<IonCardHeader>
<IonCardTitle>{title}</IonCardTitle>
</IonCardHeader>

<IonCardContent>

<p>{caption}</p>

<br/>

<p>{hashtags}</p>

</IonCardContent>

</IonCard>

 )

}

export default ResultCard;