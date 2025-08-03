
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import type { Activity } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

const seedActivities = async (): Promise<Activity[]> => {
    if (!db) throw new Error("Firebase is not configured for seeding.");
    
    const batch = writeBatch(db);
    const activitiesCollectionRef = collection(db, 'activities');

    const mockActivities: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
            title: "Creative Craft Day",
            description: "Our little artists explored textures and colors, creating beautiful collages with various materials. So much creativity!",
            image: "https://picsum.photos/400/400?random=1",
            aiHint: "children painting"
        },
        {
            title: "Music and Movement",
            description: "Dancing, singing, and playing with instruments! We had a blast expressing ourselves through the joy of music.",
            image: "https://picsum.photos/400/400?random=2",
            aiHint: "children music"
        },
        {
            title: "Building Block Bonanza",
            description: "Teamwork makes the dream work! The children collaborated to build magnificent towers, castles, and cities.",
            image: "https://picsum.photos/400/400?random=3",
            aiHint: "kids blocks"
        },
        {
            title: "Outdoor Water Play",
            description: "Splish, splash! We cooled off on a sunny day with some fun and exciting water activities.",
            image: "https://picsum.photos/400/400?random=4",
            aiHint: "children water"
        },
        {
            title: "Story Time Adventures",
            description: "Gathered around, we traveled to magical lands and met fantastic creatures through the pages of a captivating storybook.",
            image: "https://picsum.photos/400/400?random=5",
            aiHint: "children reading"
        },
        {
            title: "Garden Exploration",
            description: "We got our hands dirty learning about plants, digging for worms, and watching our little garden grow.",
            image: "https://picsum.photos/400/400?random=6",
            aiHint: "kids garden"
        },
        {
            title: "Science Fun!",
            description: "Simple and safe experiments that wowed the little ones! We made a volcano erupt and explored with magnets.",
            image: "https://picsum.photos/400/400?random=7",
            aiHint: "kids science"
        },
        {
            title: "Dress-Up Day",
            description: "From superheroes to fairies, our classroom was filled with amazing characters for our annual dress-up day.",
            image: "https://picsum.photos/400/400?random=8",
            aiHint: "children costumes"
        },
    ];

    const seededActivities: Activity[] = [];
    const now = new Date();

    mockActivities.forEach((activity, index) => {
        const docRef = doc(activitiesCollectionRef);
        const newActivity = { 
            ...activity, 
            createdAt: serverTimestamp(),
        };
        batch.set(docRef, newActivity);
        // We subtract seconds to ensure a consistent descending order for the initial return
        seededActivities.push({ ...activity, id: docRef.id, createdAt: new Date(now.getTime() - index * 1000) });
    });

    await batch.commit();
    console.log("Seeded mock activities.");
    // Sort by the JS date to ensure correct order on first load
    return seededActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const getActivities = async (): Promise<Activity[]> => {
    if (!db) return [];
    
    try {
        const activitiesCollectionRef = collection(db, 'activities');
        const q = query(activitiesCollectionRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("No activities found, seeding mock data.");
            return await seedActivities();
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
    } catch (error: any) {
        console.error("Error fetching activities:", error);
        throw error;
    }
};

export const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const activitiesCollectionRef = collection(db, 'activities');
    const docRef = await promiseWithTimeout(
        addDoc(activitiesCollectionRef, {
            ...activityData,
            createdAt: serverTimestamp(),
        }),
        TIMEOUT_DURATION,
        new Error("Adding activity document timed out.")
    );
    return docRef.id;
};

export const updateActivity = async (activityId: string, activityData: Partial<Omit<Activity, 'id' | 'createdAt'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const activityDoc = doc(db, 'activities', activityId);
    await promiseWithTimeout(
        updateDoc(activityDoc, {
            ...activityData,
            updatedAt: serverTimestamp()
        }),
        TIMEOUT_DURATION,
        new Error(`Updating activity ${activityId} timed out.`)
    );
};

export const deleteActivity = async (activityId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const activityDoc = doc(db, 'activities', activityId);
    await promiseWithTimeout(
        deleteDoc(activityDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting activity ${activityId} timed out.`)
    );
};
