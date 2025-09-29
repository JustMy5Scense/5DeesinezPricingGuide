import React, { useState, useMemo } from 'react';
import { getPricingAdvice } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import type { Material, PricingSuggestion, GeminiResponse, PricingInfo } from './types';
import Header from './components/Header';
import PricingResult from './components/PricingResult';
import MaterialInput from './components/MaterialInput';
import Spinner from './components/Spinner';
import { PlusIcon } from './components/icons/PlusIcon';

const App: React.FC = () => {
  const [itemName, setItemName] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [materials, setMaterials] = useState<Material[]>([{ id: crypto.randomUUID(), name: '', cost: '' }]);
  const [hours, setHours] = useState<string>('');
  const [minutes, setMinutes] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('20');
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PricingSuggestion | null>(null);

  const baseCost = useMemo(() => {
    const totalMaterialCost = materials.reduce((acc, material) => acc + (parseFloat(material.cost) || 0), 0);
    const totalHours = (parseFloat(hours) || 0) + ((parseFloat(minutes) || 0) / 60);
    const totalLaborCost = totalHours * (parseFloat(hourlyRate) || 0);
    return totalMaterialCost + totalLaborCost;
  }, [materials, hours, minutes, hourlyRate]);

  const handleAddMaterial = () => {
    setMaterials([...materials, { id: crypto.randomUUID(), name: '', cost: '' }]);
  };

  const handleMaterialChange = (index: number, field: 'name' | 'cost', value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setMaterials(newMaterials);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(newMaterials);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setItemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let imagePart;
      if (itemImage) {
        const base64Data = await fileToBase64(itemImage);
        imagePart = {
          mimeType: itemImage.type,
          data: base64Data,
        };
      }
      
      const pricingInfo: PricingInfo = {
        itemName,
        itemDescription,
        materials,
        hours,
        minutes,
        hourlyRate,
        baseCost,
        itemImage: imagePart,
      };

      const aiResponse = await getPricingAdvice(pricingInfo);
      
      const parsedResponse: GeminiResponse = JSON.parse(aiResponse);
      
      const finalResult: PricingSuggestion = {
          ...parsedResponse,
          baseCost,
          profitAnalysis: {
              lowEndProfit: parsedResponse.suggestedPrices.lowEnd - baseCost,
              marketRateProfit: parsedResponse.suggestedPrices.marketRate - baseCost,
              highEndProfit: parsedResponse.suggestedPrices.highEnd - baseCost,
          }
      };

      setResult(finalResult);

    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching pricing advice. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
      return itemName.trim() !== '' && itemDescription.trim() !== '' && baseCost > 0;
  }, [itemName, itemDescription, baseCost]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          {/* Form Section */}
          <div className="bg-zinc-900 p-6 md:p-8 rounded-2xl shadow-lg border border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">Describe Your Creation</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Item Details */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="itemName" className="block text-sm font-medium text-zinc-400 mb-1">Item Name</label>
                  <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition"/>
                </div>
                <div>
                  <label htmlFor="itemDescription" className="block text-sm font-medium text-zinc-400 mb-1">Item Description</label>
                  <textarea id="itemDescription" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} rows={4} required className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition" placeholder="e.g., A hand-knitted wool scarf, 6 feet long, in a vibrant rainbow pattern."></textarea>
                </div>
                <div>
                  <label htmlFor="itemImage" className="block text-sm font-medium text-zinc-400 mb-1">Item Photo (Optional)</label>
                  <input type="file" id="itemImage" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20"/>
                  {imagePreview && <img src={imagePreview} alt="Item Preview" className="mt-4 rounded-lg shadow-md max-h-48" />}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <h3 className="text-lg font-semibold text-zinc-100">Cost Breakdown</h3>
                  {/* Materials */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Materials</label>
                    <div className="space-y-2">
                        {materials.map((material, index) => (
                           <MaterialInput key={material.id} index={index} material={material} onMaterialChange={handleMaterialChange} onRemoveMaterial={handleRemoveMaterial} isLast={materials.length === 1} />
                        ))}
                    </div>
                    <button type="button" onClick={handleAddMaterial} className="mt-2 flex items-center text-sm font-medium text-red-500 hover:text-red-400 transition">
                      <PlusIcon className="w-4 h-4 mr-1" /> Add Material
                    </button>
                  </div>

                  {/* Labor */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Time Spent</label>
                    <div className="flex items-center space-x-2">
                        <input type="number" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition" />
                        <input type="number" placeholder="Minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition" />
                    </div>
                  </div>
                  <div>
                      <label htmlFor="hourlyRate" className="block text-sm font-medium text-zinc-400 mb-1">Desired Hourly Rate ($)</label>
                      <input type="number" id="hourlyRate" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition" />
                  </div>
              </div>

              {/* Base Cost Display */}
              <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-sm font-medium text-zinc-400">Your Base Cost (Materials + Labor)</p>
                  <p className="text-2xl font-bold text-zinc-100">${baseCost.toFixed(2)}</p>
              </div>

              <button type="submit" disabled={isLoading || !isFormValid} className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-500 transition-colors disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed flex items-center justify-center">
                  {isLoading ? <Spinner colorClass="text-white" /> : 'Get Pricing Advice'}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="mt-8 lg:mt-0">
            {error && <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">{error}</div>}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-800">
                <Spinner size="lg" colorClass="text-red-500" />
                <p className="mt-4 text-zinc-300 font-medium animate-pulse">Analyzing your creation...</p>
                <p className="mt-2 text-sm text-zinc-400 text-center">Our AI is crunching the numbers and market data. This may take a moment.</p>
              </div>
            )}
            <PricingResult result={result} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;