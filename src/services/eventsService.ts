
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Event } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

const seedEvents = async (): Promise<Event[]> => {
    if (!db) throw new Error("Firebase is not configured for seeding.");
    
    const batch = writeBatch(db);
    const eventsCollectionRef = collection(db, 'events');
    
    const getFutureDate = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }

    const mockEvents: Omit<Event, 'id' | 'createdAt'>[] = [
        {
            title: "Annual Sports Day",
            date: getFutureDate(30),
            description: "Get ready for a day of fun, games, and friendly competition! Parents are welcome to cheer on our little athletes.",
            image: "https://picsum.photos/600/400?random=11",
            aiHint: "kids sports"
        },
        {
            title: "Pajama & Movie Day",
            date: getFutureDate(45),
            description: "A cozy day at school! Children can come in their favorite pajamas as we watch a fun animated movie and enjoy popcorn.",
            image: "https://picsum.photos/600/400?random=12",
            aiHint: "children movie"
        },
        {
            title: "Parent-Teacher Meetings",
            date: getFutureDate(60),
            description: "A great opportunity to discuss your child's progress and development. Please sign up for a time slot at the front desk.",
            image: "https://picsum.photos/600/400?random=13",
            aiHint: "meeting discussion"
        },
        {
            title: "Bake Sale Fundraiser",
            date: getFutureDate(75),
            description: "Help support our school! We'll be selling delicious baked goods. All proceeds go towards new playground equipment.",
            image: "https://picsum.photos/600/400?random=14",
            aiHint: "bake sale"
        },
        {
            title: "School Concert",
            date: getFutureDate(90),
            description: "Our little stars will be showcasing their talents in our annual concert. A performance you won't want to miss!",
            image: "https://picsum.photos/600/400?random=15",
            aiHint: "kids concert"
        },
        {
            title: "Grandparents' Day",
            date: getFutureDate(105),
            description: "We invite all grandparents to join us for a special morning of activities, stories, and treats with their grandchildren.",
            image: "https://picsum.photos/600/400?random=16",
            aiHint: "grandparents children"
        },
    ];

    const seededEvents: Event[] = [];
    const now = new Date();

    mockEvents.forEach(event => {
        const docRef = doc(eventsCollectionRef);
        batch.set(docRef, { ...event, createdAt: serverTimestamp() });
        seededEvents.push({ ...event, id: docRef.id, createdAt: now });
    });

    await batch.commit();
    console.log("Seeded mock events.");
    return seededEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};


export const getEvents = async (): Promise<Event[]> => {
    if (!db) return [];
    try {
        const eventsCollectionRef = collection(db, 'events');
        // Sort by the event date to show the soonest events first.
        const q = query(eventsCollectionRef, orderBy("date", "asc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No events found, seeding mock data.");
            return await seedEvents();
        }
        
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        // Client-side sort is still a good fallback.
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } catch (error: any) {
        console.error("Error fetching events:", error);
        throw error;
    }
};

export const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventsCollectionRef = collection(db, 'events');
    const docRef = await promiseWithTimeout(
        addDoc(eventsCollectionRef, { ...eventData, createdAt: serverTimestamp() }),
        TIMEOUT_DURATION,
        new Error("Adding event document timed out.")
    );
    return docRef.id;
};

export const updateEvent = async (eventId: string, eventData: Partial<Omit<Event, 'id' | 'createdAt'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventDoc = doc(db, 'events', eventId);
    await promiseWithTimeout(
        updateDoc(eventDoc, eventData),
        TIMEOUT_DURATION,
        new Error(`Updating event ${eventId} timed out.`)
    );
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const eventDoc = doc(db, 'events', eventId);
    await promiseWithTimeout(
        deleteDoc(eventDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting event ${eventId} timed out.`)
    );
};
