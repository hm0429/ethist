import { CredentialType, IDKitWidget } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";
import { useRef } from 'react';
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

	const onSuccess = (result: ISuccessResult) => {
		// This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
		window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
	};

	const handleProof = async (result: ISuccessResult) => {
		console.log("Proof received from IDKit:\n", JSON.stringify(result)); // Log the proof from IDKit to the console for visibility
		
		if (!titleRef.current || !bodyRef.current) {
			return
		}
		
		const action_data = {
			title: titleRef.current.value,
			body: bodyRef.current.value
		}

		const reqBody = {
			merkle_root: result.merkle_root,
			nullifier_hash: result.nullifier_hash,
			proof: result.proof,
			credential_type: result.credential_type,
			action: ACTION_NAME,
			action_data: action_data,
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
			<div className="flex flex-col items-center justify-center align-middle h-screen">
				<p className="text-2xl mb-5">HomoSapienSays</p>
						<input
							ref={titleRef}
							placeholder="title"
							className="!border-t-blue-gray-200 focus:!border-t-gray-900"
						/>
						<input
							ref={bodyRef}
							placeholder="body"
							className="!border-t-blue-gray-200 focus:!border-t-gray-900"
						/>

				<IDKitWidget
					action={ACTION_NAME!}
					app_id={process.env.NEXT_PUBLIC_WLD_APP_ID!}
					onSuccess={onSuccess}
					handleVerify={handleProof}
					credential_types={[CredentialType.Orb, CredentialType.Phone]}
					autoClose
				>
					{({ open }) =>
						<button className="border border-black rounded-md" onClick={open}>
							<div className="mx-3 my-1">Review with World ID</div>
						</button>
					}
				</IDKitWidget>
			</div>
		</div>
	);
}
