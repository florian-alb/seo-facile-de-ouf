import { useState, useCallback, useRef } from 'react';
 
interface GenerationResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  content?: {
    title: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    slug: string;
  };
  error?: string;
}
 
export function useGeneration() {
  const [generations, setGenerations] = useState<Map<string, GenerationResult>>(
    new Map()
  );
  const pollingRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Démarrer une génération
  const startGeneration = useCallback(async (
    productId: string,
    productName: string,
    keywords: string[]
  ) => {
    const response = await fetch('/api/generation/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        productName,
        keywords,
        userId: 'current-user-id',  // À récupérer du contexte auth
        shopId: 'current-shop-id',
        type: 'full_description'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Ajouter à l'état
      setGenerations(prev => {
        const next = new Map(prev);
        next.set(productId, {
          jobId: data.jobId,
          status: 'pending'
        });
        return next;
      });
      
      // Démarrer le polling
      startPolling(productId, data.jobId);
    }
    
    return data;
  }, []);
  
  // Polling pour suivre l'avancement
  const startPolling = useCallback((productId: string, jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/generation/job/${jobId}`);
        const data: GenerationResult = await response.json();
        
        setGenerations(prev => {
          const next = new Map(prev);
          next.set(productId, data);
          return next;
        });
        
        // Arrêter si terminé
        if (data.status === 'completed' || data.status === 'failed') {
          const timeout = pollingRefs.current.get(productId);
          if (timeout) clearInterval(timeout);
          pollingRefs.current.delete(productId);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };
    
    // Poll toutes les 2 secondes
    const interval = setInterval(poll, 2000);
    pollingRefs.current.set(productId, interval);
    
    // Premier poll immédiat
    poll();
  }, []);
  
  // Cleanup
  const stopAllPolling = useCallback(() => {
    pollingRefs.current.forEach(timeout => clearInterval(timeout));
    pollingRefs.current.clear();
  }, []);
  
  return {
    generations,
    startGeneration,
    stopAllPolling
  };
}
