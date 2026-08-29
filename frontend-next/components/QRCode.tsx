"use client";
import { RiQrCodeLine } from "@remixicon/react";
import Image from "next/image";
import { useState } from "react";
import QRCode from "qrcode";

type QRCodeProps = {
    user_id: string | number;
}

export default function UserQRCode({ user_id }: QRCodeProps) {
    const [isQrCode, setIsQrCode] = useState(false);
    const [qrCode, setQrCode] = useState("");

    const generateQR = async () => {
        setIsQrCode(true);
        const url = `http://localhost:3000/profile/${user_id}`;

        const dataUrl = await QRCode.toDataURL(url, {
            width: 300,
            margin: 2,
        });

        setQrCode(dataUrl);
    };

    const close = () => {
        setIsQrCode(false);
        setQrCode("");
    }

    return (
        <>
            <div className="cursor-pointer border border-gray-400 rounded-md p-1" onClick={generateQR}>
                <RiQrCodeLine size={20} className="opacity-70" />
            </div>

            {isQrCode && (
                <div className=" p-10">
                    <p onClick={close}>&times;</p>
                    <div className="relative w-30 h-30">
                        <Image src={qrCode} alt="Profile QR code" fill />
                    </div>
                </div>
            )}
        </>
    );
}