'use client';

import { useState } from 'react';
import { Camera, Upload, FileText, Loader } from 'lucide-react';
import { processReceiptImage } from '@/app/actions/ocr';

export default function OCRScanner() {
    const [image, setImage] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
            setExtractedData(null);
        };
        reader.readAsDataURL(file);
    }



    async function processImage() {
        if (!image) return;

        setIsProcessing(true);
        try {
            const data = await processReceiptImage(image);

            // Ensure extracted data has the expected structure
            setExtractedData({
                date: data.date || new Date().toISOString().split('T')[0],
                items: data.items || [],
                total: data.total_amount || data.total || 0,
            });
        } catch (error) {
            console.error('Error processing image:', error);
            alert(error instanceof Error ? error.message : 'Error processing image.');
        } finally {
            setIsProcessing(false);
        }
    }

    async function saveData() {
        if (!extractedData) return;

        setIsProcessing(true);
        try {
            const { saveOCRData } = await import('@/app/actions/ocr');
            await saveOCRData(extractedData);
            alert('Recipe data successfully saved to sales records!');
            setImage(null);
            setExtractedData(null);
        } catch (error) {
            console.error('Error saving data:', error);
            alert('Failed to save data to database.');
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">OCR Receipt Scanner</h2>
                <p className="text-[var(--text-secondary)]">
                    Upload receipt or invoice images to automatically extract data
                </p>
            </div>

            {/* Upload Area */}
            {!image ? (
                <div className="border-2 border-dashed border-[var(--border-primary)] rounded-lg p-12 text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-[var(--text-tertiary)]" />
                    <h3 className="text-lg font-semibold mb-2">Upload Receipt Image</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Supports JPG, PNG, PDF formats
                    </p>

                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="ocr-upload"
                    />
                    <label htmlFor="ocr-upload" className="btn-primary cursor-pointer inline-flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Choose Image
                    </label>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image Preview */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Image Preview</h3>
                        <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                            <img
                                src={image}
                                alt="Receipt"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setImage(null);
                                    setExtractedData(null);
                                }}
                                className="btn-secondary flex-1"
                            >
                                Clear
                            </button>
                            <button
                                onClick={processImage}
                                disabled={isProcessing}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5" />
                                        Extract Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Extracted Data */}
                    <div className="space-y-4">
                        <h3 className="font-semibold">Extracted Data</h3>
                        {extractedData ? (
                            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 space-y-4">
                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)]">Date</label>
                                    <input
                                        type="date"
                                        value={extractedData.date}
                                        onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                                        className="input-field mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)] mb-2 block">Items</label>
                                    <div className="space-y-2">
                                        {extractedData.items.map((item: any, index: number) => (
                                            <div key={index} className="flex gap-2 items-center p-2 bg-[var(--bg-secondary)] rounded">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    className="input-field flex-1 py-1"
                                                    onChange={(e) => {
                                                        const newItems = [...extractedData.items];
                                                        newItems[index].name = e.target.value;
                                                        setExtractedData({ ...extractedData, items: newItems });
                                                    }}
                                                />
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    className="input-field w-16 py-1"
                                                    onChange={(e) => {
                                                        const newItems = [...extractedData.items];
                                                        newItems[index].quantity = Number(e.target.value);
                                                        setExtractedData({ ...extractedData, items: newItems });
                                                    }}
                                                />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price}
                                                    className="input-field w-24 py-1"
                                                    onChange={(e) => {
                                                        const newItems = [...extractedData.items];
                                                        newItems[index].price = Number(e.target.value);
                                                        setExtractedData({ ...extractedData, items: newItems });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-[var(--text-tertiary)]">Total</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={extractedData.total}
                                        onChange={(e) => setExtractedData({ ...extractedData, total: Number(e.target.value) })}
                                        className="input-field mt-1"
                                    />
                                </div>

                                <button onClick={saveData} className="btn-primary w-full">
                                    Save to Database
                                </button>
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-tertiary)] rounded-lg p-12 text-center">
                                <FileText className="w-12 h-12 mx-auto mb-2 text-[var(--text-tertiary)]" />
                                <p className="text-[var(--text-secondary)]">
                                    Click &quot;Extract Data&quot; to process the image
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
