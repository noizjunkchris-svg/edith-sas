
import React, { useState, useEffect } from 'react';
import { Scan, Layers, Info, X, Key, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import Scanner from './components/Scanner';
import ProductForm from './components/ProductForm';
import InventoryList from './components/InventoryList';
import { Product } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'scanner' | 'inventory'>('scanner');
  const [inventory, setInventory] = useState<Product[]>([]);
  const [pendingProduct, setPendingProduct] = useState<Partial<Product> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [manualKey, setManualKey] = useState(localStorage.getItem('gemini_api_key') || '');
  
  const isKeyMissing = !manualKey || manualKey.length < 20;

  useEffect(() => {
    const saved = localStorage.getItem('inventory_data');
    if (saved) {
      try {
        setInventory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load inventory");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(inventory));
  }, [inventory]);

  const handleSaveKey = () => {
    const cleanKey = manualKey.trim();
    if (cleanKey.length > 20) {
      localStorage.setItem('gemini_api_key', cleanKey);
      showNotification("Clé activée !", 'success');
      setTimeout(() => window.location.reload(), 500);
    } else {
      alert("Clé invalide.");
    }
  };

  const handleProductDetected = (data: Partial<Product>) => {
    setPendingProduct({ ...data, quantity: 1 });
  };

  const handleAddProduct = (product: Product) => {
    setInventory(prev => [product, ...prev]);
    setPendingProduct(null);
    showNotification("Article ajouté", 'success');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setInventory(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    showNotification("Article mis à jour", 'success');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Supprimer ?")) {
      setInventory(prev => prev.filter(p => p.id !== id));
    }
  };

  const showNotification = (message: string, type: 'success' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {isKeyMissing ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black p-6 z-[999]">
          <div className="bg-neutral-900 border border-white/10 rounded-[2rem] p-8 w-full max-w-sm text-center">
            <Key className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Configuration EDITH</h2>
            <p className="text-neutral-500 text-xs mb-6 uppercase tracking-widest">Collez votre clé API Gemini</p>
            <input 
              type="password" 
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl p-4 mb-4 text-emerald-500 text-xs font-mono"
              placeholder="AIza..."
            />
            <button onClick={handleSaveKey} className="w-full bg-emerald-600 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Activer</button>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="block mt-4 text-[10px] text-neutral-600 hover:text-white uppercase tracking-widest">Obtenir une clé gratuite</a>
          </div>
        </div>
      ) : (
        <>
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-black italic uppercase">Edith <span className="text-emerald-500">Scan</span></h1>
            <button onClick={() => { localStorage.removeItem('gemini_api_key'); window.location.reload(); }} className="p-2 text-neutral-600"><Key className="w-4 h-4" /></button>
          </header>

          <main>
            {view === 'scanner' ? <Scanner onProductDetected={handleProductDetected} /> : <InventoryList products={inventory} onDelete={handleDeleteProduct} onEdit={setEditingProduct} onSync={() => {}} syncing={false} />}
          </main>

          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/90 border border-white/5 p-1 rounded-full flex gap-1 w-64">
             <button onClick={() => setView('scanner')} className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest ${view === 'scanner' ? 'bg-white text-black' : 'text-neutral-500'}`}>Scan</button>
             <button onClick={() => setView('inventory')} className={`flex-1 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest ${view === 'inventory' ? 'bg-white text-black' : 'text-neutral-500'}`}>Stock</button>
          </nav>

          {pendingProduct && <ProductForm initialData={pendingProduct} onSave={handleAddProduct} onCancel={() => setPendingProduct(null)} />}
          {editingProduct && <ProductForm initialData={editingProduct} onSave={handleUpdateProduct} onCancel={() => setEditingProduct(null)} isEditing />}
        </>
      )}
    </div>
  );
};

export default App;
