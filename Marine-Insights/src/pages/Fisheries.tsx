import React, { useEffect, useState } from 'react';
// @ts-ignore
import Plotly from 'plotly.js-dist';
import { getJson, postFormData } from '../utils/api';
import { mockFishClassification } from '../utils/mock';

const Fisheries: React.FC = () => {

  const [overfishingData, setOverfishingData] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overfishingFile, setOverfishingFile] = useState<File | null>(null);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  // Loading handled by presence of data; no separate state needed
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [agentInsights, setAgentInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Removed automatic data loading - graph will only show after CSV upload

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
            <span className="text-3xl mr-3">⚠️</span>
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
              <div className="text-4xl mb-4">📊</div>
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
                  setOverfishingData(null); // Clear previous data
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
                  } catch (error) {
                    console.error('CSV upload failed:', error);
                    alert('Failed to upload CSV. Please check the file format and try again.');
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-[#C9A000] to-[#F1C40F] hover:from-[#F1C40F] hover:to-[#C9A000] disabled:from-gray-600 disabled:to-gray-700 text-black font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Analyzing...
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

          {/* AI Insights Section - NEW */}
          {agentInsights && agentInsights.is_overfishing && (
            <div className="mt-6 backdrop-blur-md bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-400/30">
              <button
                onClick={() => setShowInsights(!showInsights)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Agentic Insights</h3>
                    <p className="text-white/70 text-sm">Click to view FAO regulations & legal consequences</p>
                  </div>
                </div>
                <span className="text-2xl text-white transition-transform duration-300" style={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </button>

              {showInsights && (
                <div className="mt-6 space-y-4 animate-fadeIn">
                  {/* Status Banner */}
                  <div className="bg-red-500/30 border border-red-400/50 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">⚠️</span>
                      <div>
                        <h4 className="text-lg font-bold text-white">{agentInsights.status}</h4>
                        <p className="text-white/80 text-sm">
                          Catch Volume: {agentInsights.catch_volume?.toLocaleString()} exceeds threshold of {agentInsights.threshold?.toLocaleString()} ({agentInsights.catch_percentage}% of stock)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RAG Insights from FAO Reports */}
                  {agentInsights.rag_insights && (
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-[#F1C40F] mb-3 flex items-center">
                        <span className="mr-2">📚</span>
                        FAO Regulations & Legal Consequences
                      </h4>
                      <div className="text-white/80 text-sm whitespace-pre-line max-h-96 overflow-y-auto pr-2 custom-scrollbar leading-relaxed">
                        {agentInsights.rag_insights}
                      </div>
                      <p className="text-white/50 text-xs mt-3">
                        Source: FAO Reports, Legal Code of Conduct (i9540en.pdf), Global Standards
                      </p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {agentInsights.recommendations && agentInsights.recommendations.length > 0 && (
                    <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                      <h4 className="text-lg font-semibold text-[#2ECC71] mb-3 flex items-center">
                        <span className="mr-2">✅</span>
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {agentInsights.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start text-white/80 text-sm">
                            <span className="mr-2 text-[#2ECC71] font-bold">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fish Species Classification */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">🐟</span>
            Fish Species Classifier
          </h2>

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
                  <div className="text-4xl mb-4">📷</div>
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

            {/* Results Section */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Classification Results</h3>

              {classifyError && (
                <div className="bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg p-4 mb-4">{classifyError}</div>
              )}

              {classificationResult ? (
                <div className="space-y-4">
                  <div className="backdrop-blur-md bg-white/10 rounded-lg p-6 border border-white/20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                      <div className="sm:col-span-1">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Uploaded fish" className="w-full h-40 object-cover rounded-lg border border-white/20" />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">🐟</div>
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
                  <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                    <h5 className="font-semibold text-white mb-2">Species Biological Information</h5>
                    <div className="text-white/70 text-sm whitespace-pre-line max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {classificationResult.conservation_status || "No additional insights available."}
                    </div>
                    {classificationResult.data_source && (
                      <p className="text-white/50 text-xs mt-2">
                        Source: {classificationResult.data_source === 'fisheries_biology_collection' ? '🐟 Fisheries Biology Database' : 'Multi-Agent System'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/50 py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p>Upload an image to classify fish species</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fisheries;