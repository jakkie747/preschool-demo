
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, query, orderBy, where } from 'firebase/firestore';
import type { Child } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';
import { deleteImageFromUrl } from './storageService';

const TIMEOUT_DURATION = 15000; // 15 seconds
const COLLECTION_NAME = 'afterschoolChildren';

export const getAfterschoolChildren = async (): Promise<Child[]> => {
    if (!db) return [];
    try {
        const childrenCollectionRef = collection(db, COLLECTION_NAME);
        const q = query(childrenCollectionRef, orderBy("name"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Child));
    } catch (error: any) {
         if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
            throw new Error(`A database index is required to sort children by name. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh the page. Raw error: ${message}`);
        }
        console.error("Error fetching afterschool children:", error);
        throw new Error("Could not fetch afterschool children.");
    }
};

export const getAfterschoolChildById = async (childId: string): Promise<Child | null> => {
    if (!db) return null;
    try {
        const childDocRef = doc(db, COLLECTION_NAME, childId);
        const docSnap = await getDoc(childDocRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Child;
        }
        return null;
    } catch (error) {
        console.error("Error fetching afterschool child by ID:", error);
        throw new Error("Could not fetch afterschool child data.");
    }
}

export const addAfterschoolChild = async (childData: Omit<Child, 'id'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childrenCollectionRef = collection(db, COLLECTION_NAME);
    const docRef = await promiseWithTimeout(
        addDoc(childrenCollectionRef, childData),
        TIMEOUT_DURATION,
        new Error("Adding afterschool child document timed out.")
    );
    return docRef.id;
};

export const updateAfterschoolChild = async (childId: string, childData: Partial<Omit<Child, 'id'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childDoc = doc(db, COLLECTION_NAME, childId);
    await promiseWithTimeout(
        updateDoc(childDoc, childData),
        TIMEOUT_DURATION,
        new Error(`Updating afterschool child ${childId} timed out.`)
    );
};

export const deleteAfterschoolChild = async (childId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const childDocRef = doc(db, COLLECTION_NAME, childId);

    try {
        const docSnap = await getDoc(childDocRef);
        if (docSnap.exists()) {
            const childData = docSnap.data() as Child;
            if (childData.photo) {
                await deleteImageFromUrl(childData.photo);
            }
        }
    } catch (error) {
        console.error("Could not fetch afterschool child doc for photo deletion, but proceeding with Firestore delete.", error);
    }
    
    await promiseWithTimeout(
        deleteDoc(childDocRef),
        TIMEOUT_DURATION,
        new Error(`Deleting afterschool child ${childId} timed out.`)
    );
};
