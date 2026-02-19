
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Package, Trash2, Sheet, Hash, ChevronUp, ChevronDown, Download, CloudSync, ChevronRight, Pencil, Maximize2, Minimize2, PlusCircle } from 'lucide-react';
import { Product } from '../types';

interface InventoryListProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onSync: (type: 'csv' | 'sheets') => void;
  syncing: boolean;
}

type SortKey = keyof Product | 'timestamp';
type SortDirection = 'asc' | 'desc';

const InventoryList: React.FC<InventoryListProps> = ({ products, onDelete, onEdit, onSync, syncing }) => {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'timestamp',
    direction: 'desc',
  });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    const sortableItems = [...products];
    sortableItems.sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [products, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return (
      <div className="flex flex-col ml-1 opacity-20 group-hover:opacity-40 transition-opacity">
        <ChevronUp className="w-2.5 h-2.5 -mb-1" />
        <ChevronDown className="w-2.5 h-2.5" />
      </div>
    );
    return (
      <div className="flex flex-col ml-1 text-emerald-500">
        {sortConfig.direction === 'asc' ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </div>
    );
  };

  const HeaderCell = ({ label, columnKey, className = "" }: { label: string, columnKey: SortKey, className?: string }) => (
    <th 
      className={`px-6 py-4 cursor-pointer hover:bg-neutral-800/50 transition-colors group ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <div className={`flex items-center ${className.includes('text-center') ? 'justify-center' : ''}`}>
        <span className="uppercase tracking-[0.2em] font-bold text-neutral-500 group-hover:text-neutral-300 transition-colors">
          {label}
        </span>
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  return (
    <div className={`space-y-6 transition-all duration-500 ${isFullscreen ? 'fixed inset-0 z-[100] bg-black p-8' : ''}`}>
      <div className="flex justify-between items-end px-2">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight uppercase">Inventaire Global</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{products.length} Modèles / {products.reduce((a,b) => a + (b.quantity || 1), 0)} Articles</p>
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all shadow-inner"
            title={isFullscreen ? "Réduire" : "Agrandir"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsExportOpen(!isExportOpen)}
            disabled={syncing || products.length === 0}
            className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all text-white disabled:opacity-30 shadow-[0_10px_25px_rgba(16,185,129,0.3)] group"
          >
            {syncing ? (
              <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            )}
            Export
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-[#0c0c0c] border border-neutral-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 flex flex-col gap-1">
                <button 
                  onClick={() => { onSync('sheets'); setIsExportOpen(false); }}
                  className="flex items-center justify-between p-4 hover:bg-neutral-900 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-900/30 rounded-xl text-emerald-500">
                      <CloudSync className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Sync Google Sheets</p>
                      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Mise à jour directe</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-neutral-800 group-hover:text-emerald-500 transition-colors" />
                </button>
                
                <button 
                  onClick={() => { onSync('csv'); setIsExportOpen(false); }}
                  className="flex items-center justify-between p-4 hover:bg-neutral-900 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-800 rounded-xl text-neutral-400">
                      <Sheet className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Excel / CSV Local</p>
                      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Téléchargement fichier</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-neutral-800 group-hover:text-white transition-colors" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`overflow-x-auto rounded-[2rem] border border-neutral-900 bg-[#070707]/50 backdrop-blur-xl shadow-2xl custom-scrollbar transition-all duration-500 ${isFullscreen ? 'h-[calc(100vh-12rem)]' : 'max-h-[60vh]'}`}>
        <table className="w-full text-left text-[11px] whitespace-nowrap sticky-header">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-neutral-900 bg-[#0e0e0e]">
              <HeaderCell label="Produit / Marque" columnKey="brand" />
              <HeaderCell label="Code Barre" columnKey="barcode" />
              <HeaderCell label="Quantité" columnKey="quantity" className="text-center" />
              <HeaderCell label="Saison" columnKey="season" />
              <HeaderCell label="Modèle" columnKey="model" />
              <HeaderCell label="Type" columnKey="productType" />
              <HeaderCell label="Couleur" columnKey="color" />
              <HeaderCell label="Taille" columnKey="size" className="text-center" />
              <HeaderCell label="Prix" columnKey="price" />
              <HeaderCell label="Entrée" columnKey="timestamp" />
              <th className="px-6 py-4 text-right bg-[#0e0e0e]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900/50">
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-24 text-center text-neutral-600 italic">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-inner">
                      <Package className="w-8 h-8 opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[10px] uppercase tracking-[0.3em] font-black text-neutral-500">Coffre Vide</span>
                      <span className="block text-[8px] uppercase tracking-widest text-neutral-700">Commencez par scanner un article</span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedProducts.map((p) => (
                <tr key={p.id} className="group hover:bg-emerald-900/5 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-black text-white uppercase tracking-wider text-[10px] leading-tight">{p.brand}</span>
                      <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-tight truncate max-w-[150px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-neutral-500 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-neutral-700" />
                      {p.barcode}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full font-black text-[10px] min-w-[28px]">
                      {p.quantity || 1}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-900/50">{p.season}</span>
                  </td>
                  <td className="px-6 py-5 text-neutral-400 font-medium">{p.model}</td>
                  <td className="px-6 py-5 text-neutral-500 uppercase text-[9px] tracking-widest font-black">{p.productType}</td>
                  <td className="px-6 py-5 text-neutral-500 italic">{p.color}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="inline-flex px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-emerald-400 font-black text-[10px] shadow-sm">
                      {p.size}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-emerald-500 tabular-nums">{p.price}</td>
                  <td className="px-6 py-5 text-neutral-600 font-mono text-[9px]">
                    {formatDate(p.timestamp)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => onEdit(p)}
                        className="p-3 bg-emerald-500/0 hover:bg-emerald-500/10 rounded-xl text-neutral-700 hover:text-emerald-500 transition-all active:scale-90"
                        title="Modifier l'article"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-3 bg-red-500/0 hover:bg-red-500/10 rounded-xl text-neutral-700 hover:text-red-500 transition-all active:scale-90"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #070707;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        .sticky-header thead th {
          position: sticky;
          top: 0;
          z-index: 20;
        }
      `}</style>
    </div>
  );
};

export default InventoryList;
