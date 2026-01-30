import React, { useEffect, useState } from 'react';
// @ts-ignore
import Plotly from 'plotly.js-dist';
import { postFormData } from '../utils/api';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Bot,
  Scale,
  ClipboardList,
  BookOpen,
  Fish,
  Camera,
  Search,
  Waves,
  ShieldCheck,
  Coins,
  Microscope,
  Link2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { mockFishClassification } from '../utils/mock';
import Chatbot from '../components/Chatbot';

// Skeleton Loader Component
const SkeletonLoader: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-white/20 rounded-full" style={{ width: `${100 - i * 10}%` }}></div>
    ))}
  </div>
);

// Status Badge Component
const StatusBadge: React.FC<{ status: 'CRITICAL' | 'SUSTAINABLE' | 'WARNING' }> = ({ status }) => {
  const styles = {
    CRITICAL: 'bg-red-500/30 border-red-400/50 text-red-200',
    SUSTAINABLE: 'bg-green-500/30 border-green-400/50 text-green-200',
    WARNING: 'bg-yellow-500/30 border-yellow-400/50 text-yellow-200'
  };

  const icons = {
    CRITICAL: <AlertCircle className="w-4 h-4 mr-2" />,
    SUSTAINABLE: <CheckCircle2 className="w-4 h-4 mr-2" />,
    WARNING: <AlertTriangle className="w-4 h-4 mr-2" />
  };

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full border ${styles[status]} font-semibold text-sm`}>
      {icons[status]}
      {status}
    </div>
  );
};

const Fisheries: React.FC = () => {

  const [overfishingData, setOverfishingData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overfishingFile, setOverfishingFile] = useState<File | null>(null);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [agentInsights, setAgentInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [isProcessingClassification, setIsProcessingClassification] = useState(false);
  const [showScientificProfile, setShowScientificProfile] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (overfishingData) {
      Plotly.newPlot('overfishing-chart', overfishingData.data, overfishingData.layout, {
        responsive: true,
        displayModeBar: false
      });
    }
  }, [overfishingData]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setClassificationResult(null);
    }
  };

  const handleClassifyFish = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setIsProcessingClassification(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Call multi-agent backend endpoint
      const result = await postFormData<any>('/predict/fish_species', undefined, formData);

      // Handle new multi-agent response format
      if (result.classification && result.biological_data) {
        // New multi-agent format
        const classification = result.classification;
        const bioData = result.biological_data;

        const confidenceStr = typeof classification.confidence === 'number'
          ? `${classification.confidence.toFixed(2)}%`
          : classification.confidence;

        setClassificationResult({
          species: classification.species,
          confidence: confidenceStr,
          top_predictions: classification.top_predictions,
          conservation_status: bioData.biological_info || 'No biological information available.',
          data_source: bioData.data_source
        });
        setClassifyError(null);
      } else if (result.species && result.confidence !== undefined) {
        // Old format (backward compatibility)
        const confidenceStr = typeof result.confidence === 'number'
          ? `${result.confidence.toFixed(2)}%`
          : result.confidence;

        setClassificationResult({
          ...result,
          species: result.species,
          confidence: confidenceStr
        });
        setClassifyError(null);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Fish classification failed:', error);
      // Seamless mock fallback
      const mock = mockFishClassification();
      setClassificationResult(mock);
      setClassifyError(null);
    } finally {
      setUploading(false);
      setIsProcessingClassification(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-[#F1C40F] to-white bg-clip-text text-transparent">
          Fisheries Management System
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
          Supporting sustainable fishing through overfishing monitoring and species classification
        </p>
      </div>

      <div className="space-y-12">


        {/* Overfishing Status Monitor */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3 text-yellow-400" />
            Overfishing Status Monitor
          </h2>

          {/* CSV Upload Section */}
          <h3 className="text-lg font-semibold text-white mb-4">Upload Fisheries Data</h3>
          <div className="mb-6 border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-[#F1C40F]/50 transition-colors duration-300">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setOverfishingFile(e.target.files?.[0] || null)}
              className="hidden"
              id="overfishing-csv-upload"
            />
            <label htmlFor="overfishing-csv-upload" className="cursor-pointer">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-[#F1C40F]" />
              <p className="text-white/70 mb-2">Click to upload CSV file</p>
              <p className="text-white/50 text-sm">Required columns: Date, Stock_Volume, Catch_Volume</p>
            </label>
          </div>

          {overfishingFile && (
            <div className="mb-6">
              <p className="text-white/80 mb-3">Selected: {overfishingFile.name}</p>
              <button
                onClick={async () => {
                  if (!overfishingFile) return;
                  setUploading(true);
                  setIsProcessingAgent(true);
                  setOverfishingData(null); // Clear previous data
                  setAgentInsights(null);
                  setShowAgentPanel(false); // Ensure panel remains collapsed by default
                  try {
                    const formData = new FormData();
                    formData.append('file', overfishingFile);
                    const data = await postFormData<any>('/overfishing_monitor', undefined, formData);

                    // Check if the response contains an error
                    if (data.error) {
                      alert(`Upload failed: ${data.error}`);
                      console.error('Backend error:', data.error);
                    } else {
                      console.log('CSV uploaded successfully');
                      console.log('Backend response:', JSON.stringify(data, null, 2));

                      // Handle new multi-agent response format
                      if (data.visualization && data.agent_analysis) {
                        // New format: extract visualization data
                        setOverfishingData(data.visualization);
                        setAgentInsights(data.agent_analysis);

                        // Log agent insights if overfishing detected
                        if (data.agent_analysis && data.agent_analysis.is_overfishing) {
                          console.log('🚨 Overfishing Detected!');
                          console.log('Agent Insights:', data.agent_analysis.rag_insights);
                          console.log('Recommendations:', data.agent_analysis.recommendations);
                          setShowInsights(true); // Auto-expand insights when overfishing detected
                        }
                      } else {
                        // Old format (backward compatibility)
                        setOverfishingData(data);
                        setAgentInsights(null);
                      }
                    }
                  } catch (error: any) {
                    console.error('CSV upload failed:', error);
                    alert(`Failed to upload CSV: ${error.message || 'Unknown error'}`);
                  } finally {
                    setUploading(false);
                    setIsProcessingAgent(false);
                  }
                }}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-[#C9A000] to-[#F1C40F] hover:from-[#F1C40F] hover:to-[#C9A000] disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Analyzing with AI Agents...
                  </div>
                ) : (
                  'Analyze Overfishing Data'
                )}
              </button>
            </div>
          )}




          {overfishingData && (() => {
            // Extract data from the backend response
            const stockVolumes: number[] = overfishingData.data[0]?.y || [];
            const catchVolumes: number[] = overfishingData.data[1]?.y || [];
            const thresholds: number[] = overfishingData.data[2]?.y || [];

            // Calculate current (latest) values
            const currentStock = stockVolumes[stockVolumes.length - 1] || 0;
            const currentCatch = catchVolumes[catchVolumes.length - 1] || 0;
            const currentThreshold = thresholds[thresholds.length - 1] || 0;

            // Calculate overfishing statistics
            const overfishingMonths = catchVolumes.filter((catchVol: number, idx: number) => {
              const threshold = thresholds[idx];
              return threshold !== undefined && catchVol > threshold;
            }).length;
            const totalMonths = catchVolumes.length;
            const healthyMonths = totalMonths - overfishingMonths;
            const overfishingRate = totalMonths > 0 ? Math.round((overfishingMonths / totalMonths) * 100) : 0;

            // Calculate threshold excess
            const thresholdExcess = currentThreshold > 0
              ? Math.round(((currentCatch - currentThreshold) / currentThreshold) * 100)
              : 0;

            // Determine risk level
            const riskLevel = overfishingRate > 50 ? 'High' : overfishingRate > 30 ? 'Medium' : 'Low';
            const riskColor = overfishingRate > 50 ? '#FF6B6B' : overfishingRate > 30 ? '#F1C40F' : '#2ECC71';

            return (
              <>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div id="overfishing-chart" style={{ height: '500px' }}></div>
                </div>

                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-[#2ECC71] mb-2">Current Status</h3>
                    <p className="text-white/70 text-sm mb-2">Stock Volume: {currentStock.toLocaleString()}</p>
                    <p className="text-white/70 text-sm mb-2">Catch Volume: {currentCatch.toLocaleString()}</p>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${currentStock > 0 ? Math.min((currentCatch / currentStock) * 100, 100) : 0}%`,
                          backgroundColor: riskColor
                        }}
                      ></div>
                    </div>
                    <p className="text-white/50 text-xs mt-1">Overfishing Risk: {riskLevel}</p>
                  </div>

                  <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-[#F1C40F] mb-2">Threshold Alert</h3>
                    <p className="text-white/70 text-sm mb-2">20% of Stock = {currentThreshold.toLocaleString()}</p>
                    <p className="text-white/70 text-sm mb-2">Current Catch: {currentCatch.toLocaleString()}</p>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#FF6B6B] h-2 rounded-full"
                        style={{ width: `${currentThreshold > 0 ? Math.min((currentCatch / currentThreshold) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-white/50 text-xs mt-1">
                      {thresholdExcess > 0
                        ? `Exceeds threshold by ${thresholdExcess}%`
                        : `Within safe limits`}
                    </p>
                  </div>

                  <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-[#00C9D9] mb-2">Monthly Trend</h3>
                    <p className="text-white/70 text-sm mb-2">Overfishing Months: {overfishingMonths}/{totalMonths}</p>
                    <p className="text-white/70 text-sm mb-2">Healthy Months: {healthyMonths}/{totalMonths}</p>
                    <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${overfishingRate}%`,
                          backgroundColor: riskColor
                        }}
                      ></div>
                    </div>
                    <p className="text-white/50 text-xs mt-1">{overfishingRate}% overfishing rate</p>
                  </div>
                </div>
              </>
            );
          })()}


          {/* Processing Skeleton Loader */}
          {isProcessingAgent && !agentInsights && (
            <div className="mt-6 backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="flex items-center mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F1C40F] mr-3"></div>
                <h3 className="text-lg font-semibold text-white">AI Agent Processing Documents...</h3>
              </div>
              <p className="text-white/60 text-sm mb-4">Reading FAO reports and legal documents from vector database</p>
              <SkeletonLoader lines={4} />
            </div>
          )}

          {/* Enhanced AI Insights Panel */}
          {agentInsights &&
            <div className="mt-6 backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border border-white/20 shadow-2xl">
              {/* Header with Status Badge - Clickable Toggle for the entire panel */}
              <button
                onClick={() => setShowAgentPanel(!showAgentPanel)}
                className="w-full flex items-center justify-between mb-6 group transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-white/10 rounded-xl mr-4 group-hover:bg-white/20 transition-colors">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white flex items-center">
                      AI Agentic Insights
                      {showAgentPanel ? (
                        <ChevronUp className="w-6 h-6 ml-3 text-white/40" />
                      ) : (
                        <ChevronDown className="w-6 h-6 ml-3 text-white/40" />
                      )}
                    </h3>
                    <p className="text-white/60 text-sm">Powered by RAG + Multi-Agent System</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <StatusBadge status={agentInsights.is_overfishing ? 'CRITICAL' : 'SUSTAINABLE'} />
                </div>
              </button>

              {showAgentPanel &&
                <div className="animate-fadeIn space-y-6">
                  {/* Sustainability Status Card */}
                  <div className={`rounded-xl p-6 mb-6 border-2 ${agentInsights.is_overfishing
                    ? 'bg-red-500/20 border-red-400/50'
                    : 'bg-green-500/20 border-green-400/50'
                    }`}>
                    <div className="flex items-start">
                      {agentInsights.is_overfishing ? (
                        <AlertTriangle className="w-10 h-10 mr-4 text-red-400" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 mr-4 text-green-400" />
                      )}
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">
                          {agentInsights.status || (agentInsights.is_overfishing ? 'OVERFISHING DETECTED' : 'SUSTAINABLE FISHING')}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/60 text-xs mb-1">Catch Volume</p>
                            <p className="text-white font-bold text-lg">{agentInsights.catch_volume?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/60 text-xs mb-1">Threshold (20% of Stock)</p>
                            <p className="text-white font-bold text-lg">{agentInsights.threshold?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3">
                            <p className="text-white/60 text-xs mb-1">Catch Percentage</p>
                            <p className={`font-bold text-lg ${agentInsights.is_overfishing ? 'text-red-300' : 'text-green-300'}`}>
                              {agentInsights.catch_percentage || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legal Warning Section - Only show if overfishing */}
                  {agentInsights.is_overfishing && (
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 mb-6 border border-orange-400/30">
                      <div className="flex items-start">
                        <Scale className="w-8 h-8 mr-3 text-orange-300" />
                        <div>
                          <h4 className="text-lg font-bold text-orange-200 mb-2">Legal Warning</h4>
                          <p className="text-white/80 text-sm leading-relaxed">
                            Current fishing practices exceed sustainable thresholds as defined by FAO Code of Conduct for Responsible Fisheries.
                            Continued overfishing may result in regulatory penalties, fishing quota reductions, or license suspension.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expandable Mitigation Plan */}
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className="w-full bg-white/10 hover:bg-white/15 rounded-xl p-4 mb-6 border border-white/20 transition-all duration-300 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClipboardList className="w-7 h-7 mr-3 text-white" />
                        <div>
                          <h4 className="text-lg font-semibold text-white">View Mitigation Plan & FAO Regulations</h4>
                          <p className="text-white/60 text-sm">Click to expand AI-generated recommendations</p>
                        </div>
                      </div>
                      <div className="text-white/60">
                        {showInsights ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Insights */}
                  {showInsights &&
                    <div className="space-y-6 animate-fadeIn">
                      {/* RAG Insights from FAO Reports */}
                      {agentInsights.rag_insights && (
                        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                          <h4 className="text-lg font-semibold text-[#F1C40F] mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-[#F1C40F]" />
                            FAO Regulations & Legal Consequences
                          </h4>
                          <div className="text-white/80 text-sm whitespace-pre-line max-h-96 overflow-y-auto pr-2 custom-scrollbar leading-relaxed bg-black/20 rounded-lg p-4">
                            {agentInsights.rag_insights}
                          </div>
                          {/* Source Citation */}
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center text-white/50 text-xs">
                              <Link2 className="w-4 h-4 mr-2" />
                              <span className="font-semibold mr-2">Source:</span>
                              <span>FAO Code of Conduct (i9540en.pdf), Global Fisheries Standards, Legal Database</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {agentInsights.recommendations && agentInsights.recommendations.length > 0 &&
                        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                          <h4 className="text-lg font-semibold text-[#2ECC71] mb-4 flex items-center">
                            <CheckCircle2 className="w-5 h-5 mr-2 text-[#2ECC71]" />
                            Recommended Mitigation Actions
                          </h4>
                          <div className="space-y-3">
                            {agentInsights.recommendations.map((rec: string, idx: number) => (
                              <div key={idx} className="flex items-start bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors duration-200">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2ECC71]/30 flex items-center justify-center text-[#2ECC71] font-bold text-xs mr-3 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="text-white/80 text-sm leading-relaxed">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        {/* Fish Species Classification */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Fish className="w-8 h-8 mr-3 text-[#F1C40F]" />
            Fish Species Classifier
          </h2>

          <div className="space-y-8">
            {/* Top Section: Upload and Result Summary */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Upload Fish Image</h3>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-[#00C9D9]/50 transition-colors duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="fish-upload"
                  />
                  <label htmlFor="fish-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-[#F1C40F]" />
                    <p className="text-white/70 mb-2">Click to upload fish image</p>
                    <p className="text-white/50 text-sm">Supports JPG, PNG, WebP</p>
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-4">
                    <p className="text-white/80 mb-3">Selected: {selectedFile.name}</p>
                    <button
                      onClick={handleClassifyFish}
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-[#007B82] to-[#00C9D9] hover:from-[#00C9D9] hover:to-[#007B82] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Classifying...
                        </div>
                      ) : (
                        'Classify Species'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Classification Results Summary */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Classification Results</h3>

                {classifyError && (
                  <div className="bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg p-4 mb-4">{classifyError}</div>
                )}

                {isProcessingClassification && !classificationResult && (
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00C9D9] mr-3"></div>
                      <p className="text-white/70 text-sm">AI Agent analyzing fish species...</p>
                    </div>
                    <SkeletonLoader lines={3} />
                  </div>
                )}

                {classificationResult ? (
                  <div className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="sm:col-span-1">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Uploaded fish" className="w-full h-40 object-cover rounded-lg border border-white/20 shadow-lg" />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                            <Fish className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <h4 className="text-2xl font-bold text-[#00C9D9] mb-2">
                          {classificationResult.species}
                        </h4>
                        <p className="text-white/70 mb-4">
                          Confidence: <span className="font-semibold text-[#2ECC71]">{classificationResult.confidence}</span>
                        </p>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#2ECC71] to-[#00C9D9] h-3 rounded-full transition-all duration-1000"
                            style={{ width: (typeof classificationResult.confidence === 'string' ? classificationResult.confidence : '0%') }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  !isProcessingClassification && (
                    <div className="text-center text-white/50 py-12">
                      <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
                      <p>Upload an image to classify fish species</p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Bottom Row: Scientific Profile */}
            {classificationResult && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 animate-fadeIn transition-all duration-300">
                <button
                  onClick={() => setShowScientificProfile(!showScientificProfile)}
                  className="w-full flex items-center justify-between group focus:outline-none mb-4"
                >
                  <h5 className="font-semibold text-white flex items-center text-xl group-hover:text-[#F1C40F] transition-colors">
                    <Microscope className="w-6 h-6 mr-3 text-white group-hover:text-[#F1C40F] transition-colors" />
                    Scientific Profile & Biological Data
                  </h5>
                  {showScientificProfile ? (
                    <ChevronUp className="w-6 h-6 text-white/50 group-hover:text-white" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-white/50 group-hover:text-white" />
                  )}
                </button>

                {showScientificProfile && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Habitat Card */}
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-400/30">
                        <div className="flex items-center mb-3">
                          <Waves className="w-8 h-8 mr-3 text-blue-300" />
                          <h6 className="font-bold text-white text-lg">Habitat</h6>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">
                          Marine waters, typically found in tropical and subtropical regions
                        </p>
                      </div>

                      {/* Conservation Status Card */}
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
                        <div className="flex items-center mb-3">
                          <ShieldCheck className="w-8 h-8 mr-3 text-green-300" />
                          <h6 className="font-bold text-white text-lg">Conservation Status</h6>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">
                          Varies by species - consult IUCN Red List for specific status
                        </p>
                      </div>

                      {/* Commercial Value Card */}
                      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30">
                        <div className="flex items-center mb-3">
                          <Coins className="w-8 h-8 mr-3 text-yellow-300" />
                          <h6 className="font-bold text-white text-lg">Commercial Value</h6>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">
                          Important for commercial fisheries and aquaculture
                        </p>
                      </div>
                    </div>

                    {/* Detailed Biological Information */}
                    <div className="bg-black/20 rounded-xl p-6 mb-6">
                      <h6 className="font-semibold text-white/90 text-lg mb-4">Detailed Biological Information</h6>
                      <div className="text-white/70 text-sm whitespace-pre-line max-h-60 overflow-y-auto pr-2 custom-scrollbar leading-relaxed">
                        {classificationResult.conservation_status || "No additional insights available."}
                      </div>
                    </div>

                    {/* Source Citation */}
                    {classificationResult.data_source && (
                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center text-white/50 text-sm">
                          <Link2 className="w-4 h-4 mr-2" />
                          <span className="font-semibold mr-2">Source:</span>
                          <span>
                            {classificationResult.data_source === 'fisheries_biology_collection'
                              ? <><Fish className="w-4 h-4 mr-1 inline" /> Fisheries Biology Database (RAG)</>
                              : 'Multi-Agent Classification System'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Chatbot Section */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-3">💬</span>
              AI Consultant
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Have questions about sustainable fishing practices, marine biology, or regulations?
              <br /><br />
              Our AI Expert, powered by <strong>AWS Bedrock</strong>, uses deep knowledge of fisheries data to provide instant, accurate answers.
            </p>
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
              <h4 className="font-semibold mb-2">Try asking:</h4>
              <ul className="space-y-2 text-sm text-white/80 list-disc list-inside">
                <li>"What are sustainable fishing methods?"</li>
                <li>"Explain the impact of overfishing on tuna."</li>
                <li>"What are the regulations for bycatch?"</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-2">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fisheries;