import { CredentialType, IDKitWidget } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";
import { useRef, useState } from 'react';

//@ts-ignore
import {execHaloCmdWeb} from '@arx-research/libhalo/api/web.js';

import {
	Card,
	Input,
	Checkbox,
	Button,
	Typography,
} from "@material-tailwind/react";

const ACTION_NAME = `${process.env.NEXT_PUBLIC_WLD_ACTION_NAME}-${process.env.NEXT_PUBLIC_DEMO_PLACE_ID}`

export default function Home() {

	const titleRef = useRef<any>();
	const bodyRef = useRef<any>();
	const star5Ref = useRef<any>(null);
	const star4Ref = useRef<any>(null);
	const star3Ref = useRef<any>(null);
	const star2Ref = useRef<any>(null);
	const star1Ref = useRef<any>(null);

	const getRating = () => {
		const refs = [star5Ref, star4Ref, star3Ref, star2Ref, star1Ref];
		const checkedRef = refs.find(ref => ref.current && ref.current.checked);
		return checkedRef ? checkedRef.current.value : undefined;
	};

	const onSuccess = (result: ISuccessResult) => {
		// This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
		// window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);

		// TODO: show message
		// reload

	};

	const handleProof = async (result: ISuccessResult) => {
		console.log("Proof received from IDKit:\n", JSON.stringify(result)); // Log the proof from IDKit to the console for visibility

        let halocmd = {
            name: "sign",
            keyNo: 1,
            digest: result.nullifier_hash.slice(2)
        };

		let haloRes;
		haloRes = await execHaloCmdWeb(halocmd);

        try {
            // --- request NFC command execution ---
            
            // the command has succeeded, display the result to the user
            console.log(haloRes);
        } catch (e) {
            // the command has failed, display error to the user
			console.log(e);
        }

		const rating = getRating();
		if (!titleRef.current || !bodyRef.current || !rating) {
			return
		}

		const action_data = {
			title: titleRef.current.value,
			body: bodyRef.current.value,
			rating: rating
		}

		const reqBody = {
			merkle_root: result.merkle_root,
			nullifier_hash: result.nullifier_hash,
			proof: result.proof,
			credential_type: result.credential_type,
			action: ACTION_NAME,
			action_data: action_data,
			halo_data: haloRes,
			signal: "",
		};
		console.log("Sending proof to backend for verification:\n", JSON.stringify(reqBody)) // Log the proof being sent to our backend for visibility
		const res: Response = await fetch("/api/verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(reqBody),
		})
		const data: VerifyReply = await res.json()
		if (res.status == 200) {
			console.log("Successful response from backend:\n", data); // Log the response from our backend for visibility
		} else {
			throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error."); // Throw an error if verification fails
		}
	};

	return (
		<div>
			<div className="flex flex-col items-center justify-center align-middle min-h-screen bg-gray-100 text-gray-800">
				<div className="max-w-md w-full space-y-8 p-10 bg-white shadow-md rounded-xl">
					<div className="text-center">
						<p className="text-4xl font-extrabold mb-4">HomoSapienSays</p>
						<p>Please leave a review for THE KEDI HOTEL!</p>

					</div>

					<form className="space-y-6" action="#" method="POST">
						<input
							ref={titleRef}
							placeholder="Title"
							className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
							required
						/>
						<textarea
							ref={bodyRef}
							placeholder="Body"
							rows={4}
							className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
							required
						></textarea>
						<div className="text-center">
							<div className="star-rating w-full">
								<input type="radio" id="star5" name="rating" value="5" ref={star5Ref} /><label htmlFor="star5" title="5 stars">&#9733;</label>
								<input type="radio" id="star4" name="rating" value="4" ref={star4Ref} /><label htmlFor="star4" title="4 stars">&#9733;</label>
								<input type="radio" id="star3" name="rating" value="3" ref={star3Ref} defaultChecked/><label htmlFor="star3" title="3 stars">&#9733;</label>
								<input type="radio" id="star2" name="rating" value="2" ref={star2Ref} /><label htmlFor="star2" title="2 stars">&#9733;</label>
								<input type="radio" id="star1" name="rating" value="1" ref={star1Ref} /><label htmlFor="star1" title="1 star">&#9733;</label>
							</div>
						</div>
						<IDKitWidget
							action={ACTION_NAME!}
							app_id={process.env.NEXT_PUBLIC_WLD_APP_ID!}
							onSuccess={onSuccess}
							handleVerify={handleProof}
							credential_types={[CredentialType.Orb, CredentialType.Phone]}
							autoClose
						>
							{({ open }) =>
								<button
									type="button"
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
									onClick={open}
								>
									Review with World ID
								</button>
							}
						</IDKitWidget>
					</form>

				</div>
			</div>
		</div>
	);
}
