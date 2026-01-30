import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, BarChart2, Activity, Globe, Thermometer, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
// @ts-ignore
import Plot from 'plotly.js-dist';
import { postFormData } from '../utils/api';

interface PredictionData {
  depth: number[];
  salinity: number[];
  ph: number[];
  predicted_chlorophyll: number[];
  actual_chlorophyll?: number[];
}

interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface SSTForecastData {
  forecast: ForecastPoint[];
}

const OceanData: React.FC = () => {
  // Chlorophyll prediction state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SST forecast state
  const [sstFile, setSstFile] = useState<File | null>(null);
  const [sstForecastData, setSstForecastData] = useState<SSTForecastData | null>(null);
  const [sstLoading, setSstLoading] = useState(false);
  const [sstError, setSstError] = useState<string | null>(null);

  // Toggle state for 3D chart
  const [show3DChart, setShow3DChart] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPredictionData(null);
      setError(null);
    }
  };

  const handleUploadAndPredict = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await postFormData<PredictionData>('/predict/csv', undefined, formData);

      if (result && 'error' in (result as any)) {
        setError((result as any).error);
        setPredictionData(null);
      } else {
        setPredictionData(result);
        setError(null);
      }
    } catch (err: any) {
      console.error('Chlorophyll prediction error:', err);
      setError(err.message || 'Failed to upload and predict sequence.');
      setPredictionData(null);
    } finally {
      setLoading(false);
    }
  };

  // SST Forecast handlers
  const handleSstFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSstFile(file);
      setSstForecastData(null);
      setSstError(null);
    }
  };

  const handleSstUploadAndForecast = async () => {
    if (!sstFile) return;

    setSstLoading(true);
    setSstError(null);
    const formData = new FormData();
    formData.append('file', sstFile);

    try {
      const result = await postFormData<SSTForecastData>('/predict/sst/csv', undefined, formData);

      if (result && 'error' in (result as any)) {
        setSstError((result as any).error);
        setSstForecastData(null);
      } else {
        setSstForecastData(result);
        setSstError(null);
      }
    } catch (err: any) {
      console.error('SST forecast error:', err);
      setSstError(err.message || 'Failed to upload and forecast SST.');
      setSstForecastData(null);
    } finally {
      setSstLoading(false);
    }
  };

  // Create Plotly charts when prediction data is available
  useEffect(() => {
    if (predictionData) {
      // Chart 1: Depth vs Chlorophyll (Predicted vs Actual)
      const depthChartData: any[] = [
        {
          x: predictionData.depth,
          y: predictionData.predicted_chlorophyll,
          mode: 'markers',
          type: 'scatter',
          name: 'Predicted Chlorophyll',
          marker: {
            color: '#00C9D9',
            size: 5,
            opacity: 0.8,
            line: {
              color: '#00E5FF',
              width: 0.5
            }
          }
        }
      ];

      if (predictionData.actual_chlorophyll) {
        depthChartData.push({
          x: predictionData.depth,
          y: predictionData.actual_chlorophyll,
          mode: 'markers',
          type: 'scatter',
          name: 'Actual Chlorophyll',
          marker: {
            color: '#2ECC71',
            size: 5,
            opacity: 0.8,
            line: {
              color: '#27AE60',
              width: 0.5
            }
          }
        });
      }

      Plot.newPlot('depth-chlorophyll-chart', depthChartData, {
        title: {
          text: 'Depth vs Chlorophyll Concentration',
          font: { size: 18, color: 'white', family: 'Inter, sans-serif' }
        },
        xaxis: {
          title: {
            text: 'Depth (meters)',
            font: { size: 14, color: 'white', family: 'Inter, sans-serif' }
          },
          gridcolor: 'rgba(255,255,255,0.1)',
          tickfont: { color: 'white', size: 12 }
        },
        yaxis: {
          title: {
            text: 'Chlorophyll Concentration (mg/m³)',
            font: { size: 14, color: 'white', family: 'Inter, sans-serif' }
          },
          gridcolor: 'rgba(255,255,255,0.1)',
          tickfont: { color: 'white', size: 12 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(255,255,255,0.05)',
        font: { color: 'white' },
        showlegend: true,
        legend: { x: 0.02, y: 0.98 }
      }, {
        responsive: true,
        displayModeBar: false
      });

      // Chart 2: Predicted vs Actual (if actual data exists)
      if (predictionData.actual_chlorophyll) {
        const minVal = Math.min(...predictionData.actual_chlorophyll, ...predictionData.predicted_chlorophyll);
        const maxVal = Math.max(...predictionData.actual_chlorophyll, ...predictionData.predicted_chlorophyll);

        Plot.newPlot('prediction-accuracy-chart', [
          {
            x: predictionData.actual_chlorophyll,
            y: predictionData.predicted_chlorophyll,
            mode: 'markers',
            type: 'scatter',
            name: 'Predictions',
            marker: {
              color: '#F1C40F',
              size: 10,
              opacity: 0.6
            }
          },
          {
            x: [minVal, maxVal],
            y: [minVal, maxVal],
            mode: 'lines',
            type: 'scatter',
            name: 'Perfect Prediction',
            line: {
              color: 'rgba(255,255,255,0.3)',
              dash: 'dash',
              width: 2
            }
          }
        ], {
          title: {
            text: 'Model Prediction Accuracy',
            font: { size: 18, color: 'white', family: 'Inter, sans-serif' }
          },
          xaxis: {
            title: {
              text: 'Actual Chlorophyll (mg/m³)',
              font: { size: 14, color: 'white', family: 'Inter, sans-serif' }
            },
            gridcolor: 'rgba(255,255,255,0.1)',
            tickfont: { color: 'white', size: 12 }
          },
          yaxis: {
            title: {
              text: 'Predicted Chlorophyll (mg/m³)',
              font: { size: 14, color: 'white', family: 'Inter, sans-serif' }
            },
            gridcolor: 'rgba(255,255,255,0.1)',
            tickfont: { color: 'white', size: 12 }
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(255,255,255,0.05)',
          font: { color: 'white' },
          showlegend: true
        }, {
          responsive: true,
          displayModeBar: false
        });
      }

    }
  }, [predictionData]);

  // Effect to plot 3D chart when visible
  useEffect(() => {
    if (predictionData && show3DChart) {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        Plot.newPlot('3d-scatter-chart', [{
          x: predictionData.depth,
          y: predictionData.salinity,
          z: predictionData.ph,
          mode: 'markers',
          type: 'scatter3d',
          marker: {
            size: 5,
            color: predictionData.predicted_chlorophyll,
            colorscale: 'Viridis',
            showscale: true,
            colorbar: {
              title: 'Chlorophyll',
              titlefont: { color: 'white' },
              tickfont: { color: 'white' }
            }
          }
        }], {
          title: {
            text: '3D Environmental Parameters Visualization',
            font: { size: 18, color: 'white', family: 'Inter, sans-serif' }
          },
          scene: {
            xaxis: {
              title: { text: 'Depth (meters)', font: { color: 'white', size: 12 } },
              gridcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              tickfont: { color: 'white', size: 10 }
            },
            yaxis: {
              title: { text: 'Salinity (PSU)', font: { color: 'white', size: 12 } },
              gridcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              tickfont: { color: 'white', size: 10 }
            },
            zaxis: {
              title: { text: 'pH Level', font: { color: 'white', size: 12 } },
              gridcolor: 'rgba(255,255,255,0.1)',
              color: 'white',
              tickfont: { color: 'white', size: 10 }
            },
            bgcolor: 'rgba(0,0,0,0)'
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: 'white' },
          margin: { l: 0, r: 0, b: 0, t: 30 }
        }, {
          responsive: true,
          displayModeBar: false
        });
      }, 100); // 100ms delay to allow for animation/rendering

      return () => clearTimeout(timer);
    }
  }, [predictionData, show3DChart]);

  // Create SST forecast chart when data is available
  useEffect(() => {
    if (sstForecastData && sstForecastData.forecast.length > 0) {
      const dates = sstForecastData.forecast.map(point => point.ds);
      const predictions = sstForecastData.forecast.map(point => point.yhat);
      const lowerBound = sstForecastData.forecast.map(point => point.yhat_lower);
      const upperBound = sstForecastData.forecast.map(point => point.yhat_upper);

      Plot.newPlot('sst-forecast-chart', [
        {
          x: dates,
          y: lowerBound,
          mode: 'lines',
          type: 'scatter',
          name: 'Lower Bound',
          fill: 'tonexty',
          fillcolor: 'rgba(0, 201, 217, 0.15)',
          line: { color: 'rgba(0, 201, 217, 0.3)', width: 1, dash: 'dash' },
          showlegend: true
        },
        {
          x: dates,
          y: upperBound,
          mode: 'lines',
          type: 'scatter',
          name: 'Upper Bound',
          line: { color: 'rgba(0, 201, 217, 0.3)', width: 1, dash: 'dash' },
          showlegend: true
        },
        {
          x: dates,
          y: predictions,
          mode: 'lines+markers',
          type: 'scatter',
          name: 'SST Forecast',
          line: { color: '#00C9D9', width: 3 },
          marker: { color: '#00E5FF', size: 6, line: { color: '#FFFFFF', width: 1 } }
        }
      ], {
        title: {
          text: 'Sea Surface Temperature Forecast',
          font: { size: 18, color: 'white', family: 'Inter, sans-serif' }
        },
        xaxis: {
          title: { text: 'Date', font: { size: 14, color: 'white', family: 'Inter, sans-serif' } },
          gridcolor: 'rgba(255,255,255,0.1)',
          tickfont: { color: 'white', size: 12 },
          type: 'date'
        },
        yaxis: {
          title: { text: 'Temperature (°C)', font: { size: 14, color: 'white', family: 'Inter, sans-serif' } },
          gridcolor: 'rgba(255,255,255,0.1)',
          tickfont: { color: 'white', size: 12 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(255,255,255,0.05)',
        font: { color: 'white' },
        showlegend: true,
        legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0.3)', bordercolor: 'rgba(255,255,255,0.2)', borderwidth: 1 },
        hovermode: 'x unified'
      }, {
        responsive: true,
        displayModeBar: false
      });
    }
  }, [sstForecastData]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00C9D9] mx-auto mb-4"></div>
          <p className="text-white/80">Loading ocean data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white via-[#00C9D9] to-white bg-clip-text text-transparent">
          Ocean Data Analysis & Forecasting
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
          Predict chlorophyll levels and forecast sea surface temperatures using machine learning
        </p>
      </div>

      <div className="space-y-12">
        {/* CSV Upload Section */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Upload className="w-8 h-8 mr-3 text-[#00C9D9]" />
            Upload Ocean Data
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Upload CSV File</h3>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-[#00C9D9]/50 transition-colors duration-300">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <div className="flex justify-center mb-4">
                    <FileText className="w-12 h-12 text-[#00C9D9]/80" />
                  </div>
                  <p className="text-white/70 mb-2">Click to upload CSV file</p>
                  <p className="text-white/50 text-sm">Required columns: Depth, Salinity, pH, Chlorophyll (optional)</p>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4">
                  <p className="text-white/80 mb-3">Selected: {selectedFile.name}</p>
                  <button
                    onClick={handleUploadAndPredict}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#007B82] to-[#00C9D9] hover:from-[#00C9D9] hover:to-[#007B82] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Predict Chlorophyll Levels'
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-[#00C9D9] p-1 bg-[#00C9D9]/10 rounded-full mt-1">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload CSV</p>
                    <p className="text-white/70 text-sm">Prepare a CSV with ocean parameters</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-[#2ECC71] p-1 bg-[#2ECC71]/10 rounded-full mt-1">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">ML Prediction</p>
                    <p className="text-white/70 text-sm">Random Forest model predicts chlorophyll</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-[#F1C40F] p-1 bg-[#F1C40F]/10 rounded-full mt-1">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Visualize Results</p>
                    <p className="text-white/70 text-sm">Interactive charts show predictions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {predictionData && (
          <>
            {/* Chart 1: Depth vs Chlorophyll */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-[#00C9D9]" />
                Depth vs Chlorophyll Concentration
              </h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div id="depth-chlorophyll-chart" style={{ height: '500px' }}></div>
              </div>
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-[#00C9D9] mb-2">Data Points</h3>
                  <p className="text-2xl font-bold text-white">{predictionData.depth.length}</p>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-[#2ECC71] mb-2">Avg Predicted</h3>
                  <p className="text-2xl font-bold text-white">
                    {(predictionData.predicted_chlorophyll.reduce((a, b) => a + b, 0) / predictionData.predicted_chlorophyll.length).toFixed(3)}
                  </p>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-[#F1C40F] mb-2">Depth Range</h3>
                  <p className="text-2xl font-bold text-white">
                    {Math.min(...predictionData.depth)}-{Math.max(...predictionData.depth)}m
                  </p>
                </div>
              </div>
            </div>

            {/* Chart 2: Prediction Accuracy (only if actual data exists) */}
            {predictionData.actual_chlorophyll && (
              <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="w-8 h-8 mr-3 text-[#00C9D9]" />
                  Model Prediction Accuracy
                </h2>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div id="prediction-accuracy-chart" style={{ height: '500px' }}></div>
                </div>
                <p className="mt-4 text-white/70 text-sm text-center">
                  Points closer to the diagonal line indicate better prediction accuracy
                </p>
              </div>
            )}

            {/* Chart 3: 3D Scatter */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 transition-all duration-300">
              <button
                onClick={() => setShow3DChart(!show3DChart)}
                className="w-full text-left flex items-center justify-between group focus:outline-none"
              >
                <h2 className="text-2xl font-bold text-white flex items-center group-hover:text-[#00C9D9] transition-colors">
                  <Globe className="w-8 h-8 mr-3 text-[#00C9D9]" />
                  3D Environmental Parameters
                </h2>
                {show3DChart ? (
                  <ChevronUp className="w-6 h-6 text-white/50 group-hover:text-white" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-white/50 group-hover:text-white" />
                )}
              </button>

              {show3DChart && (
                <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div id="3d-scatter-chart" style={{ height: '600px' }}></div>
                  </div>
                  <p className="mt-4 text-white/70 text-sm text-center">
                    Interactive 3D visualization of Depth, Salinity, and pH colored by Chlorophyll concentration
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* SST Forecast Section */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Thermometer className="w-8 h-8 mr-3 text-[#00C9D9]" />
            SST Forecast
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Upload SST CSV</h3>
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-[#00C9D9]/50 transition-colors duration-300">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleSstFileSelect}
                  className="hidden"
                  id="sst-csv-upload"
                />
                <label htmlFor="sst-csv-upload" className="cursor-pointer">
                  <div className="flex justify-center mb-4">
                    <FileText className="w-12 h-12 text-[#00C9D9]/80" />
                  </div>
                  <p className="text-white/70 mb-2">Click to upload SST CSV file</p>
                  <p className="text-white/50 text-sm">Required columns: date, value</p>
                </label>
              </div>

              {sstFile && (
                <div className="mt-4">
                  <p className="text-white/80 mb-3">Selected: {sstFile.name}</p>
                  <button
                    onClick={handleSstUploadAndForecast}
                    disabled={sstLoading}
                    className="w-full bg-gradient-to-r from-[#007B82] to-[#00C9D9] hover:from-[#00C9D9] hover:to-[#007B82] disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {sstLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Forecasting...
                      </div>
                    ) : (
                      'Generate SST Forecast'
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="text-[#00C9D9] p-1 bg-[#00C9D9]/10 rounded-full mt-1">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Upload Historical Data</p>
                    <p className="text-white/70 text-sm">CSV with date and temperature values</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-[#2ECC71] p-1 bg-[#2ECC71]/10 rounded-full mt-1">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Prophet Forecasting</p>
                    <p className="text-white/70 text-sm">Time series model predicts future SST</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-[#F1C40F] p-1 bg-[#F1C40F]/10 rounded-full mt-1">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Confidence Intervals</p>
                    <p className="text-white/70 text-sm">View predictions with uncertainty bounds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {sstError && (
            <div className="mt-6 bg-red-500/20 border border-red-400/30 text-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Error</p>
                <p className="text-sm">{sstError}</p>
              </div>
            </div>
          )}
        </div>

        {/* SST Forecast Results */}
        {sstForecastData && sstForecastData.forecast.length > 0 && (
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-[#00C9D9]" />
              Temperature Forecast
            </h2>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div id="sst-forecast-chart" style={{ height: '500px' }}></div>
            </div>

            <div className="mt-6 grid md:grid-cols-4 gap-4">
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#00C9D9] mb-2">Total Points</h3>
                <p className="text-2xl font-bold text-white">{sstForecastData.forecast.length}</p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#2ECC71] mb-2">Avg Temp</h3>
                <p className="text-2xl font-bold text-white">
                  {(sstForecastData.forecast.reduce((a, b) => a + b.yhat, 0) / sstForecastData.forecast.length).toFixed(2)}°C
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#F1C40F] mb-2">Max Temp</h3>
                <p className="text-2xl font-bold text-white">
                  {Math.max(...sstForecastData.forecast.map(f => f.yhat)).toFixed(2)}°C
                </p>
              </div>
              <div className="backdrop-blur-md bg-white/10 rounded-lg p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-[#E74C3C] mb-2">Min Temp</h3>
                <p className="text-2xl font-bold text-white">
                  {Math.min(...sstForecastData.forecast.map(f => f.yhat)).toFixed(2)}°C
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OceanData;
