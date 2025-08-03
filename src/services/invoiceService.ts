

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import type { Invoice } from '@/lib/types';
import { promiseWithTimeout } from '@/lib/utils';

const TIMEOUT_DURATION = 15000;
const COLLECTION_NAME = 'invoices';

export const getAllInvoices = async (): Promise<Invoice[]> => {
    if (!db) return [];
    try {
        const invoicesCollectionRef = collection(db, COLLECTION_NAME);
        const q = query(invoicesCollectionRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
    } catch (error: any) {
        if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            throw new Error(`A database index is required. Please check the browser console (F12) for a link to create it. Raw error: ${message}`);
        }
        console.error("Error fetching invoices:", error);
        throw new Error("Could not fetch invoices.");
    }
};

export const getInvoicesByChild = async (childId: string): Promise<Invoice[]> => {
    if (!db) return [];
     try {
        const invoicesCollectionRef = collection(db, COLLECTION_NAME);
        const q = query(invoicesCollectionRef, where("childId", "==", childId), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        return invoices;

    } catch (error: any) {
        if ((error as any).code === 'failed-precondition') {
            const message = (error as Error).message;
            throw new Error(`A database index is required. Please check the browser console (F12) for a link to create it. Raw error: ${message}`);
        }
        console.error("Error fetching invoices for child:", error);
        throw new Error("Could not fetch invoices for this child.");
    }
}

export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'status' | 'invoiceNumber'>): Promise<string> => {
    if (!db) throw new Error("Firebase is not configured.");
    
    // Generate a simple invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const newInvoiceData = {
        ...invoiceData,
        amount: Math.round(invoiceData.amount * 100), // Convert to cents
        status: 'unpaid' as const,
        invoiceNumber,
        createdAt: serverTimestamp(),
    };
    
    const invoicesCollectionRef = collection(db, COLLECTION_NAME);
    const docRef = await promiseWithTimeout(
        addDoc(invoicesCollectionRef, newInvoiceData),
        TIMEOUT_DURATION,
        new Error("Adding invoice document timed out.")
    );
    return docRef.id;
};

export const updateInvoiceStatus = async (invoiceId: string, status: 'paid' | 'pending' | 'cancelled'): Promise<void> => {
    if (!db) throw new Error("Firebase is not configured.");
    const invoiceDoc = doc(db, COLLECTION_NAME, invoiceId);
    
    const updateData: any = { status };
    if (status === 'paid') {
        updateData.paidAt = serverTimestamp();
    }
    
    await promiseWithTimeout(
        updateDoc(invoiceDoc, updateData),
        TIMEOUT_DURATION,
        new Error(`Updating invoice ${invoiceId} timed out.`)
    );
};

    