import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ethers } from 'ethers'

if (!getApps()?.length) {
  initializeApp({
    credential: cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string)
    ),
  });
}

const db = getFirestore();

export const config = {
  api: {
    externalResolver: true,
  },
};

export type VerifyReply = {
  code: string;
  detail: string;
};

type PlaceDoc = {
  address: string;
};

const verifyEndpoint = `${process.env.NEXT_PUBLIC_WLD_API_BASE_URL}/api/v1/verify/${process.env.NEXT_PUBLIC_WLD_APP_ID}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyReply>
) {
  //   return new Promise((resolve, reject) => {
  console.log("Received request to verify credential:\n", req.body);
  const actionData = req.body.action_data;
  
  const haloData = req.body.halo_data

  const placeDoc = await db.collection('places').doc(`${process.env.NEXT_PUBLIC_DEMO_PLACE_ID}`).get()
  if (!placeDoc.exists) {
    return res.status(400).send({
      code: "error",
      detail: "place doesn't exist."
    })
  }

  const expandedSig = {
    r: '0x' + haloData.signature.raw.r,
    s: '0x' + haloData.signature.raw.s,
    v: haloData.signature.raw.v
  }
  const signature = ethers.utils.joinSignature(expandedSig)

  const recoveredaddress = ethers.utils.recoverAddress(req.body.nullifier_hash, signature)
  console.log('recoveredaddress:', recoveredaddress)
  
  if ((placeDoc.data() as PlaceDoc).address !== recoveredaddress) {
    return res.status(400).send({
      code: "error",
      detail: "address doesn't match."
    })
  }


  const reqBody = {
    nullifier_hash: req.body.nullifier_hash,
    merkle_root: req.body.merkle_root,
    proof: req.body.proof,
    credential_type: req.body.credential_type,
    action: req.body.action,
    signal: req.body.signal,
  };
  console.log("Sending request to World ID /verify endpoint:\n", reqBody);
  fetch(verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  }).then((verifyRes) => {
    verifyRes.json().then(async(wldResponse) => {
      console.log(
        `Received ${verifyRes.status} response from World ID /verify endpoint:\n`,
        wldResponse
      );

      if (verifyRes.status == 200) {
        // This is where you should perform backend actions based on the verified credential, such as setting a user as "verified" in a database
        // For this example, we'll just return a 200 response and console.log the verified credential
        console.log(
          "Credential verified! This user's nullifier hash is: ",
          wldResponse.nullifier_hash
        );
        res.status(verifyRes.status).send({
          code: "success",
          detail: "This action verified correctly!",
        });
        //   resolve(void 0);

        const docRef = await db.collection('reviews').add({
          placeId: process.env.NEXT_PUBLIC_DEMO_PLACE_ID,
          title: actionData.title,
          body: actionData.body,
          rating: actionData.rating,
          ...reqBody
      });

      } else {
        // This is where you should handle errors from the World ID /verify endpoint. Usually these errors are due to an invalid credential or a credential that has already been used.
        // For this example, we'll just return the error code and detail from the World ID /verify endpoint.
        res
          .status(verifyRes.status)
          .send({ code: wldResponse.code, detail: wldResponse.detail });
      }
    });
  });
  //   });
}

