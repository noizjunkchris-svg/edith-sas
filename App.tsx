
import React, { useState, useEffect } from 'react';
import { Scan, Layers, Settings } from 'lucide-react';
import Scanner from './components/Scanner';
import ProductForm from './components/ProductForm';
import InventoryList from './components/InventoryList';
import { Product } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'scanner' | 'inventory'>('scanner');
  const [inventory, setInventory] = useState<Product[]>([]);
  const [pendingProduct, setPendingProduct] = useState<Partial<Product> | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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
    showNotification("Mis à jour", 'success');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Supprimer cet article ?")) {
      setInventory(prev => prev.filter(p => p.id !== id));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Inter'] selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto p-4 pb-32">
        <header className="flex justify-between items-center mb-8 px-2 pt-4">
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
              EDITH <span className="text-emerald-500">SCAN</span>
            </h1>
            <p className="text-[9px] text-neutral-600 font-bold tracking-[0.4em] uppercase mt-1">
              Visual AI Inventory
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
        </header>

        <main className="animate-in fade-in duration-700">
          {view === 'scanner' ? (
            <Scanner onProductDetected={handleProductDetected} />
          ) : (
            <InventoryList 
              products={inventory} 
              onDelete={handleDeleteProduct} 
              onEdit={setEditingProduct} 
              onSync={() => {}} 
              syncing={false} 
            />
          )}
        </main>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-3xl border border-white/5 p-1.5 rounded-[2.5rem] flex gap-1 w-80 shadow-2xl z-[100]">
           <button 
             onClick={() => setView('scanner')} 
             className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all ${view === 'scanner' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
           >
             <Scan className="w-4 h-4" />
             Scanner
           </button>
           <button 
             onClick={() => setView('inventory')} 
             className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[2.2rem] text-[11px] font-black uppercase tracking-[0.15em] transition-all ${view === 'inventory' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
           >
             <Layers className="w-4 h-4" />
             Stock
           </button>
        </nav>

        {pendingProduct && <ProductForm initialData={pendingProduct} onSave={handleAddProduct} onCancel={() => setPendingProduct(null)} />}
        {editingProduct && <ProductForm initialData={editingProduct} onSave={handleUpdateProduct} onCancel={() => setEditingProduct(null)} isEditing />}
        
        {notification && (
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-top-8 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
