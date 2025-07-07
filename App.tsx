import React, { useState, useCallback } from 'react';
import { ImageUploader, DescriptionDisplay, Loader, ErrorAlert, Header } from './components/components';
import { generateDescriptionFromImage } from './services/ollamaService';
import { ImageInfo } from './types';

function App(): React.ReactNode {
  // State to hold the uploaded image information.
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  // State to hold the generated description.
  const [description, setDescription] = useState<string>('');
  // State to track the loading status.
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // State to hold any error messages.
  const [error, setError] = useState<string | null>(null);

  // Callback function to handle image uploads.
  const handleImageUpload = (info: ImageInfo | null) => {
    setImageInfo(info);
    setDescription('');
    setError(null);
  };

  // Callback function to generate the image description.
  const handleGenerateDescription = useCallback(async () => {
    if (!imageInfo) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDescription('');

    try {
      const generatedText = await generateDescriptionFromImage(imageInfo);
      setDescription(generatedText);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate description. ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [imageInfo]);

  return (
    <div className="min-h-screen bg-base-100 text-text-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-base-200 p-6 rounded-2xl shadow-lg border border-base-300 flex flex-col items-center justify-center">
            <ImageUploader onImageUpload={handleImageUpload} />
            <button
              onClick={handleGenerateDescription}
              disabled={!imageInfo || isLoading}
              className="mt-6 w-full max-w-xs inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-100 focus:ring-brand-secondary disabled:bg-base-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Analyzing...' : 'Generate Description'}
            </button>
          </div>
          
          <div className="bg-base-200 p-6 rounded-2xl shadow-lg border border-base-300 min-h-[300px] flex flex-col">
            <h2 className="text-xl font-bold text-text-primary mb-4">AI Generated Description</h2>
            <div className="flex-grow relative">
              {isLoading && <Loader />}
              {error && !isLoading && <ErrorAlert message={error} />}
              {!isLoading && !error && (
                <DescriptionDisplay description={description} />
              )}
            </div>
          </div>
        </div>
        <footer className="text-center text-text-secondary mt-12">
            <p>Powered by a local Ollama model. Designed for amazing user experiences.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;