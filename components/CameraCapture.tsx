
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        alert("请允许访问相机以使用此功能。");
        onClose();
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    onCapture(base64);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 text-white">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 6-12 12"/><path d="m6 6 12 12"/></svg>
        </button>
        <span className="font-semibold">餐食扫描</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-neutral-900 flex items-center justify-center">
        {!isReady && <div className="text-white/50 animate-pulse">正在初始化相机...</div>}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="max-h-full max-w-full object-contain"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Overlay guides */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white/30 rounded-3xl border-dashed"></div>
        </div>
      </div>

      <div className="p-8 bg-black flex justify-center items-center">
        <button 
          onClick={takePhoto}
          disabled={!isReady}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50"
        >
          <div className="w-12 h-12 bg-white rounded-full"></div>
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
