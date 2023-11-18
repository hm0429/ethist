import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const config = {
    api: {
      externalResolver: true,
    },
  };
  
  export type PostReviewReply = {
    code: string;
  };
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PostReviewReply>
  ) {
    console.log("Received request to post review:\n", req.body);

    const docRef = await db.collection('reviews').add({
        placeId: 42,
        title: "title",
        body: "body"
    });

    res.status(200).send({
        code: "success"
    });
  }

if (!getApps()?.length) {
    initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)
      ),
    });
  }
  
  export const adminDB = getFirestore();