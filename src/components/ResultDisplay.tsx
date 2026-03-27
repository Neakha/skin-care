import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, AlertCircle, ShieldCheck, Activity, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisResult } from '../services/geminiService';

interface ResultDisplayProps {
  result: AnalysisResult;
  image: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, image }) => {
  const downloadReport = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('SkinScanAI_Report.pdf');
  };

  const severityColors = {
    Low: 'text-green-600 bg-green-50 border-green-200',
    Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    High: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      <div id="report-content" className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2 text-blue-600 font-bold tracking-tight text-xl">
              <ShieldCheck className="w-8 h-8" />
              SKINSCAN AI
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
              Analysis Summary
            </h2>
            <div className="flex flex-wrap gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${severityColors[result.severity]}`}>
                {result.severity} Severity
              </span>
              <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-600 border border-blue-200">
                {result.confidence}% Confidence
              </span>
            </div>
          </div>
          <div className="w-full md:w-48 aspect-square rounded-2xl overflow-hidden shadow-inner bg-gray-50 border border-gray-100">
            <img src={image} alt="Analyzed area" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Predicted Condition
              </h3>
              <p className="text-2xl font-bold text-gray-900">{result.condition}</p>
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Detected Features</h3>
              <div className="flex flex-wrap gap-2">
                {result.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Recommendations
              </h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <div className="bg-amber-50 rounded-2xl p-6 flex items-start gap-4 border border-amber-100">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">Medical Disclaimer</h4>
              <p className="text-xs text-amber-800 leading-relaxed opacity-80">
                {result.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={downloadReport}
          className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold flex items-center gap-3 hover:bg-black transition-all transform hover:scale-105 active:scale-95 shadow-xl"
        >
          <Download className="w-5 h-5" /> Download PDF Report
        </button>
      </div>
    </motion.div>
  );
};
