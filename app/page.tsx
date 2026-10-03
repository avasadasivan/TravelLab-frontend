import Image from "next/image";

type Activity = { id: number; title: string; time: string; location: string; notes: string};

export default async function Home() {
    const res = await fetch('http://localhost:3001/activities');
    const activities: Activity[] = await res.json();
    console.log(activities);

    return (
        <ul>
          {activities.map((a) => <li key={a.id}>{a.title}</li>)}
        </ul>
    );
}