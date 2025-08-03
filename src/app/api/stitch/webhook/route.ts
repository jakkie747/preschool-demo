
import { NextResponse } from 'next/server';
import { updateInvoiceStatus } from '@/services/invoiceService';

export async function POST(req: Request) {
    try {
        // IMPORTANT: In a production environment, you must verify the webhook signature
        // to ensure the request is coming from Stitch. This is a critical security step.
        // Example:
        // const signature = req.headers.get('x-stitch-signature');
        // const body = await req.text(); // Read body as text for verification
        // verifySignature(signature, body, process.env.STITCH_WEBHOOK_SECRET);
        // const payload = JSON.parse(body);

        const payload = await req.json(); // For now, we'll just parse the JSON directly.

        const eventType = payload?.data?.event_type;
        const paymentDetails = payload?.data?.event_payload?.payment_initiation;

        if (eventType === 'payment_initiation.completed' && paymentDetails) {
            const invoiceId = paymentDetails.external_reference;
            
            if (invoiceId) {
                console.log(`Processing successful payment for invoice: ${invoiceId}`);
                await updateInvoiceStatus(invoiceId, 'paid');
            } else {
                 console.warn("Webhook received for completed payment but no external_reference (invoiceId) was found.");
            }
        }
        
        // Acknowledge receipt of the webhook
        return NextResponse.json({ status: 'success' }, { status: 200 });
        
    } catch (error) {
        console.error("Error processing Stitch webhook:", error);
        return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
    }
}
