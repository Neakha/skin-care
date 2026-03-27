import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebcamCaptureProps {
  onCapture: (image: string) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsStreaming(false);
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  }, []);

  const reset = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
      {!isStreaming && !capturedImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <Camera className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Ready to Scan?</h3>
          <p className="text-sm text-gray-400 mb-6">Position the affected area clearly in the frame.</p>
          <button 
            onClick={startCamera}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-all transform hover:scale-105 active:scale-95"
          >
            Open Camera
          </button>
        </div>
      )}

      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
      />

      {capturedImage && (
        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
      )}

      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence>
        {isStreaming && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-0 right-0 flex justify-center"
          >
            <button 
              onClick={captureFrame}
              className="w-16 h-16 bg-white rounded-full border-4 border-blue-600 shadow-lg flex items-center justify-center active:scale-90 transition-transform"
            >
              <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-200" />
            </button>
          </motion.div>
        )}

        {capturedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4"
          >
            <button 
              onClick={reset}
              className="flex-1 py-3 bg-gray-800/80 backdrop-blur-md text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" /> Retake
            </button>
            <button 
              onClick={confirm}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Check className="w-5 h-5" /> Analyze
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
