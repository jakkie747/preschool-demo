
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import type { Document } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000;

export const getDocuments = async (): Promise<Document[]> => {
    if (!db) return [];
    try {
        const docsCollectionRef = collection(db, 'documents');
        const q = query(docsCollectionRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    } catch (error: any) {
        if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: Please create the required Firestore index.", error);
            throw new Error(`A database index is required. Please check the browser console (F12) for a link to create it. Raw error: ${message}`);
        }
        console.error("Error fetching documents:", error);
        throw new Error("Could not fetch documents.");
    }
};

export const addDocument = async (docData: Omit<Document, 'id' | 'createdAt'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const docsCollectionRef = collection(db, 'documents');
    const docRef = await promiseWithTimeout(
        addDoc(docsCollectionRef, {
            ...docData,
            createdAt: serverTimestamp(),
        }),
        TIMEOUT_DURATION,
        new Error("Adding document timed out.")
    );
    return docRef.id;
};

export const deleteDocument = async (docId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const docRef = doc(db, 'documents', docId);
    await promiseWithTimeout(
        deleteDoc(docRef),
        TIMEOUT_DURATION,
        new Error(`Deleting document ${docId} timed out.`)
    );
};
