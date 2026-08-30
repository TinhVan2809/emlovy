"use client";

import { RiQrCodeLine } from "@remixicon/react";
import { useRef, useState } from "react";
import QRCode from "qrcode";

type QRCodeProps = {
    user_id: string | number;
};

const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) => {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
};

export default function UserQRCode({ user_id }: QRCodeProps) {
    const [isQrCode, setIsQrCode] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const generateQR = async () => {
        setIsQrCode(true);

        await new Promise((resolve) => requestAnimationFrame(resolve));

        const canvas = canvasRef.current;
        if (!canvas) return;

        const url = `http://localhost:3000/profile/${user_id}`;

        await QRCode.toCanvas(canvas, url, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: "H",
        });

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logo = new window.Image();
        logo.src = "/logo.png";

        logo.onload = () => {
            const logoSize = 64;
            const badgeSize = logoSize + 26;
            const x = (canvas.width - badgeSize) / 2;
            const y = (canvas.height - badgeSize) / 2;
            const logoX = x + 13;
            const logoY = y + 13;

            ctx.save();
            ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;

            drawRoundedRect(ctx, x, y, badgeSize, badgeSize, 22);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.shadowColor = "transparent";
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#dfe7f3";
            ctx.stroke();

            ctx.clip();
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
            ctx.restore();
        };
    };

    const close = () => {
        setIsQrCode(false);
    };

    const downloadQR = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `qr-code-${user_id}.png`;
        link.click();
    };

    return (
        <>
            <div className="cursor-pointer border border-gray-400 rounded-md p-1" onClick={generateQR}>
                <RiQrCodeLine size={20} className="opacity-70" />
            </div>

            {isQrCode && (
                <div className="w-full h-screen fixed z-1000 top-0 right-0 flex justify-center items-center">
                    <div className="p-10 flex flex-col gap-3 rounded-xl shadow-xl bg-white">
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={300}
                            className="w-[300px] h-[300px] rounded-lg bg-white"
                        />
                        <div className="w-full flex gap-1.5 flex-col">
                            <button
                                className="w-full rounded-xl py-2.5 bg-black text-white"
                                onClick={downloadQR}
                            >
                                Tải ảnh xuống
                            </button>
                            <button className="w-full rounded-xl py-2.5 shadow-lg" onClick={close}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}