
import { NextResponse } from 'next/server';

// This is a placeholder for Stitch API interaction.
// In a real application, you would use the Stitch Node.js SDK.

async function getStitchAccessToken(clientId: string, clientSecret: string) {
    const response = await fetch("https://secure.stitch.money/connect/token", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': clientId,
            'client_secret': clientSecret,
            'scope': 'client_paymentrequest'
        })
    });
    
    if (!response.ok) {
        console.error("Stitch Auth Error:", await response.text());
        throw new Error("Failed to authenticate with Stitch.");
    }

    const data = await response.json();
    return data.access_token;
}

export async function POST(req: Request) {
    const { amount, email, description, externalReference } = await req.json();

    const clientId = process.env.STITCH_CLIENT_ID;
    const clientSecret = process.env.STITCH_CLIENT_SECRET;
    const redirectUrl = process.env.STITCH_REDIRECT_URL;

    if (!clientId || !clientSecret || !redirectUrl) {
        return NextResponse.json({ error: "Stitch environment variables are not configured." }, { status: 500 });
    }

    try {
        const accessToken = await getStitchAccessToken(clientId, clientSecret);
        
        const mutation = `
            mutation CreatePaymentRequest($amount: MoneyInput!, $payerReference: String!, $beneficiaryReference: String!, $externalReference: String, $redirectUrl: String!) {
              clientPaymentInitiation(
                amount: $amount,
                payerReference: $payerReference,
                beneficiaryReference: $beneficiaryReference,
                externalReference: $externalReference,
                redirectUrl: $redirectUrl,
                beneficiaryName: "Blinkogies Pre-School",
                beneficiaryBankId: za_fnb
              ) {
                paymentInitiationRequest {
                  id
                  url
                }
              }
            }
        `;

        const variables = {
            amount: { quantity: amount, currency: 'ZAR' },
            payerReference: email,
            beneficiaryReference: 'School Fees',
            externalReference: externalReference, // This is our invoice ID
            redirectUrl: redirectUrl,
        };

        const stitchApiResponse = await fetch("https://api.stitch.money/graphql", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                query: mutation,
                variables: variables
            })
        });

        if (!stitchApiResponse.ok) {
            console.error("Stitch API Error:", await stitchApiResponse.text());
            throw new Error('Failed to create payment request with Stitch.');
        }

        const result = await stitchApiResponse.json();
        
        if (result.errors || !result.data.clientPaymentInitiation) {
            console.error("Stitch GraphQL Error:", result.errors);
            throw new Error("Stitch returned an error.");
        }

        const url = result.data.clientPaymentInitiation.paymentInitiationRequest.url;

        return NextResponse.json({ url });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
