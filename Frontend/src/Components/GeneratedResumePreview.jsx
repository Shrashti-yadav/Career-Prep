import { Copy, Download, Check } from "lucide-react";
import { useState } from "react";

export function GeneratedResumePreview({ resumeText, onClose }) {

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {

    navigator.clipboard.writeText(resumeText);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };

  const handleDownload = () => {

    const element = document.createElement("a");

    const file = new Blob([resumeText], { type: "text/plain" });

    element.href = URL.createObjectURL(file);

    element.download = "resume.txt";

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">

          <h2 className="text-2xl font-bold text-gray-900">

            Generated Resume

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>

        </div>

        <div className="flex-1 overflow-auto p-6">

          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">

            {resumeText}

          </div>

        </div>

        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">

          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >

            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy
              </>
            )}

          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >

            <Download className="w-5 h-5" />

            Download

          </button>

        </div>

      </div>

    </div>

  );

}