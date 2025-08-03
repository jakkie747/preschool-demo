
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import type { DailyReport } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000; // 15 seconds

export const getReportsByChildId = async (childId: string): Promise<DailyReport[]> => {
    if (!db) return [];
    
    try {
        const reportsCollectionRef = collection(db, 'daily_reports');
        const q = query(reportsCollectionRef, where("childId", "==", childId), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyReport));
    } catch (error: any) {
        if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
            // Re-throw the original, more helpful error message which contains the direct link.
            throw new Error(message);
        }
        console.error("Error fetching reports:", error);
        throw new Error("Could not fetch reports.");
    }
};

export const addReport = async (reportData: Omit<DailyReport, 'id' | 'createdAt'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    const reportsCollectionRef = collection(db, 'daily_reports');
    const docRef = await promiseWithTimeout(
        addDoc(reportsCollectionRef, {
            ...reportData,
            createdAt: serverTimestamp(),
        }),
        TIMEOUT_DURATION,
        new Error("Adding report document timed out.")
    );
    return docRef.id;
};

export const updateReport = async (reportId: string, reportData: Partial<Omit<DailyReport, 'id' | 'createdAt'>>): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const reportDoc = doc(db, 'daily_reports', reportId);
    await promiseWithTimeout(
        updateDoc(reportDoc, {
            ...reportData,
        }),
        TIMEOUT_DURATION,
        new Error(`Updating report ${reportId} timed out.`)
    );
};

export const deleteReport = async (reportId: string): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const reportDoc = doc(db, 'daily_reports', reportId);
    await promiseWithTimeout(
        deleteDoc(reportDoc),
        TIMEOUT_DURATION,
        new Error(`Deleting report ${reportId} timed out.`)
    );
};
