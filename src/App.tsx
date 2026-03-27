import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, ShieldCheck, Heart, ArrowLeft, Loader2, Info } from 'lucide-react';
import { WebcamCapture } from './components/WebcamCapture';
import { ResultDisplay } from './components/ResultDisplay';
import { analyzeSkinImage, AnalysisResult } from './services/geminiService';

export default function App() {
  const [step, setStep] = useState<'home' | 'capture' | 'analyzing' | 'result'>('home');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageInput = async (image: string) => {
    setSelectedImage(image);
    setStep('analyzing');
    setError(null);
    
    try {
      const result = await analyzeSkinImage(image);
      setAnalysisResult(result);
      setStep('result');
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again with a clearer image.");
      setStep('home');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setStep('home');
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900">SKINSCAN AI</span>
          </div>
          
          {step !== 'home' && (
            <button 
              onClick={reset}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto text-center space-y-12"
            >
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-gray-900">
                  Early detection, <br />
                  <span className="text-blue-600">healthier skin.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
                  SkinScan AI uses advanced computer vision to analyze skin conditions in seconds. 
                  Fast, private, and accessible for everyone.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button 
                  onClick={() => setStep('capture')}
                  className="group p-8 bg-white border-2 border-gray-100 rounded-3xl text-left hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 transition-all"
                >
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Camera className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Use Camera</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Capture a real-time photo using your device webcam or camera.</p>
                </button>

                <label className="group p-8 bg-white border-2 border-gray-100 rounded-3xl text-left hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 transition-all cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Upload Photo</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Select an existing image from your gallery or files.</p>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-center gap-8 pt-8 opacity-40 grayscale">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Heart className="w-4 h-4 text-red-500" /> 10k+ Scans
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-500" /> HIPAA Compliant
                </div>
              </div>
            </motion.div>
          )}

          {step === 'capture' && (
            <motion.div 
              key="capture"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg mx-auto"
            >
              <WebcamCapture onCapture={handleImageInput} />
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              <div className="relative">
                <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">Analyzing Image...</h3>
                <p className="text-gray-500">Our AI is processing your scan with high precision.</p>
              </div>
              <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-1/2 h-full bg-blue-600 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {step === 'result' && analysisResult && selectedImage && (
            <ResultDisplay result={analysisResult} image={selectedImage} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold tracking-tighter">SKINSCAN AI</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <Info className="w-3 h-3" />
            Not a substitute for professional medical advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
