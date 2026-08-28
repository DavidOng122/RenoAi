"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
export default function RequestPage(){const {requestId}=useParams<{requestId:string}>();const router=useRouter();useEffect(()=>router.replace(`/repair/${requestId}/result`),[requestId,router]);return null;}
