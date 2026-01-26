import React, { useState } from 'react';
import { postFormData } from '../utils/api';
import { mockEdnaAnalyze } from '../utils/mock';

interface SpeciesResult {
  sequence: string;
  species: string;
  confidence?: number;
  invasive?: boolean;
  sequenceId?: string;
}

interface SpeciesAnalysis {
  species_scientific: string;
  species_common: string;
  confidence: number;
  genetic_markers: string[];
  invasive_status: string;
  characteristics: {
    habitat: string;
    behavior: string;
    diet: string;
    conservation_status: string;
  };
  ecological_role: string;
  interesting_facts: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const Biodiversity: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<SpeciesResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [invasiveAlert, setInvasiveAlert] = useState<string | null>(null);
  const [speciesAnalysis, setSpeciesAnalysis] = useState<SpeciesAnalysis | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResults(null);
      setInvasiveAlert(null);
      setSpeciesAnalysis(null);
      setShowChatbot(false);
      setChatMessages([]);
    }
  };

  const handleAnalyzeeDNA = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await postFormData<{
        success: boolean;
        analysis: SpeciesAnalysis;
        detected_species: SpeciesResult[];
        invasive_species: { species: string }[];
      }>('/api/v1/edna/analyze', undefined, formData);

      if (result.detected_species) {
        setAnalysisResults(result.detected_species);
        setSpeciesAnalysis(result.analysis);

        // Check for invasive species
        const invasive = result.invasive_species && result.invasive_species.length > 0
          ? result.invasive_species[0]
          : null;
        if (invasive) {
          setInvasiveAlert(typeof invasive === 'string' ? invasive : invasive.species);
        }

        // Show chatbot after successful analysis
        setShowChatbot(true);
      }
    } catch {
      console.log('eDNA API not available, using mock results');
      const mockResults = mockEdnaAnalyze();
      setAnalysisResults(mockResults);

      // Check for invasive species in mock data
      const invasive = mockResults.find(s => s.invasive);
      if (invasive) {
        setInvasiveAlert(invasive.species);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!userQuestion.trim() || !speciesAnalysis) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: userQuestion
    };
    setChatMessages(prev => [...prev, userMessage]);
    setUserQuestion('');
    setChatLoading(true);

    try {
      // Call chat API
      const response = await fetch('http://localhost:8000/api/v1/edna/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          species_data: speciesAnalysis,
          question: userQuestion
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.answer
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        };
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Unable to connect to the chatbot service. Please try again later.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Mock data now sourced from utils/mock with valid-looking sequence IDs

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-[#2ECC71] to-white bg-clip-text text-transparent">
          Biodiversity Monitoring
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
          Environmental DNA analysis for species identification and invasive species detection
        </p>
      </div>

      <div className="space-y-8">
        {/* Upload Section */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="text-3xl mr-3">🧬</span>
            eDNA Sample Upload
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Upload FASTA/FASTQ File</h3>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-[#2ECC71]/50 transition-colors duration-300">
                <input
                  type="file"
                  accept=".fasta,.fastq,.fa,.fq"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="edna-upload"
                />
                <label htmlFor="edna-upload" className="cursor-pointer">
                  <div className="text-4xl mb-4">🔬</div>
                  <p className="text-white/70 mb-2">Click to upload eDNA sequence file</p>
                  <p className="text-white/50 text-sm">Supports FASTA, FASTQ formats</p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-white/80 mb-3">Selected: {selectedFile.name}</p>
                  <button
                    onClick={handleAnalyzeeDNA}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#2ECC71] to-[#00C9D9] hover:from-[#00C9D9] hover:to-[#2ECC71] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing eDNA...
                      </div>
                    ) : (
                      'Analyze eDNA Sample'
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Analysis Info</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-[#2ECC71] text-xl">✓</div>
                  <div>
                    <p className="text-white font-medium">Species Identification</p>
                    <p className="text-white/70 text-sm">Advanced DNA barcoding analysis</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-[#F1C40F] text-xl">⚠</div>
                  <div>
                    <p className="text-white font-medium">Invasive Species Detection</p>
                    <p className="text-white/70 text-sm">Automated alerts for non-native species</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-[#00C9D9] text-xl">📊</div>
                  <div>
                    <p className="text-white font-medium">Biodiversity Assessment</p>
                    <p className="text-white/70 text-sm">Comprehensive ecosystem analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invasive Species Alert */}
        {invasiveAlert && (
          <div className="backdrop-blur-md bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-300 mb-4 flex items-center">
              <span className="text-3xl mr-3">⚠️</span>
              Invasive Species Alert
            </h2>
            <div className="bg-red-500/30 rounded-xl p-6 border border-red-400/30">
              <p className="text-red-200 text-lg font-semibold">
                Invasive Species Detected: <span className="text-red-100">{invasiveAlert}</span>
              </p>
              <p className="text-red-300/80 mt-2">
                Immediate attention required. This species may pose a threat to local marine ecosystems.
              </p>
            </div>
          </div>
        )}

        {/* Species Output Table */}
        {analysisResults && invasiveAlert === null && (
          <div className="backdrop-blur-md bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-green-300 mb-4 flex items-center">
              <span className="text-3xl mr-3">✅</span>
              Analysis Complete - No Invasive Species Detected
            </h2>
          </div>
        )}

        {analysisResults && (
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">📋</span>
              Species Identification Results
            </h2>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10 border-b border-white/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Sequence ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Predicted Species
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {analysisResults.map((result, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-white/80 bg-white/10 rounded px-2 py-1">
                            {result.sequenceId || result.sequence.substring(0, 16) + '...'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">
                            {result.species}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-white/80">
                              {result.confidence}%
                            </div>
                            <div className="ml-3 w-16 bg-white/20 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${result.confidence && result.confidence > 85 ? 'bg-[#2ECC71]' :
                                  result.confidence && result.confidence > 70 ? 'bg-[#F1C40F]' : 'bg-[#FF6B6B]'
                                  }`}
                                style={{ width: `${result.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${result.invasive
                            ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                            : 'bg-green-500/20 text-green-300 border border-green-400/30'
                            }`}>
                            {result.invasive ? '⚠ Invasive' : '✓ Native'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#2ECC71] mb-2">Species Found</h3>
                <p className="text-2xl font-bold text-white">{analysisResults.length}</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#F1C40F] mb-2">Avg Confidence</h3>
                <p className="text-2xl font-bold text-white">
                  {Math.round(analysisResults.reduce((acc, r) => acc + (r.confidence || 0), 0) / analysisResults.length)}%
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#FF6B6B] mb-2">Invasive Alert</h3>
                <p className="text-2xl font-bold text-white">
                  {analysisResults.filter(r => r.invasive).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* GenAI Species Chatbot */}
        {showChatbot && speciesAnalysis && (
          <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border-2 border-purple-400/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🤖</span>
              AI Species Assistant
              <span className="ml-3 text-sm font-normal text-purple-300">Powered by GenAI</span>
            </h2>

            {/* Species Quick Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-purple-300 mb-4">Species Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-sm">Scientific Name</p>
                    <p className="text-white font-medium italic">{speciesAnalysis.species_scientific}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Common Name</p>
                    <p className="text-white font-medium">{speciesAnalysis.species_common}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Conservation Status</p>
                    <p className="text-white font-medium">{speciesAnalysis.characteristics.conservation_status}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-blue-300 mb-4">Characteristics</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/60 text-sm">Habitat</p>
                    <p className="text-white font-medium text-sm">{speciesAnalysis.characteristics.habitat}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Diet</p>
                    <p className="text-white font-medium text-sm">{speciesAnalysis.characteristics.diet}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-white/60 py-12">
                    <p className="text-lg mb-4">👋 Ask me anything about this species!</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      <button
                        onClick={() => setUserQuestion("What is the ecological role of this species?")}
                        className="bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        🌊 Ecological role?
                      </button>
                      <button
                        onClick={() => setUserQuestion("Is this species endangered?")}
                        className="bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        ⚠️ Conservation status?
                      </button>
                      <button
                        onClick={() => setUserQuestion("What are the main threats to this species?")}
                        className="bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        🎯 Main threats?
                      </button>
                      <button
                        onClick={() => setUserQuestion("Tell me interesting facts about this species")}
                        className="bg-white/10 hover:bg-white/20 text-white/80 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        ✨ Interesting facts?
                      </button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-white/10 text-white border border-white/20'
                          }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
                      <div className="flex items-center space-x-2">
                        <div className="animate-bounce w-2 h-2 bg-purple-400 rounded-full"></div>
                        <div className="animate-bounce w-2 h-2 bg-blue-400 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                        <div className="animate-bounce w-2 h-2 bg-purple-400 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="border-t border-white/10 p-4 bg-white/5">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
                    placeholder="Ask about habitat, behavior, threats, conservation..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleSendQuestion}
                    disabled={chatLoading || !userQuestion.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {chatLoading ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>

            {/* Interesting Facts */}
            {speciesAnalysis.interesting_facts && speciesAnalysis.interesting_facts.length > 0 && (
              <div className="mt-6 bg-white/10 rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center">
                  <span className="mr-2">💡</span>
                  Interesting Facts
                </h3>
                <ul className="space-y-2">
                  {speciesAnalysis.interesting_facts.map((fact, idx) => (
                    <li key={idx} className="text-white/80 text-sm flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Biodiversity;