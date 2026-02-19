
import React, { useState, useEffect } from 'react';
import { Save, X, Hash, Tag, Briefcase, Palette, Calendar, DollarSign, Box, Info, Ruler, PlusSquare } from 'lucide-react';
import { Product } from '../types';

interface ProductFormProps {
  initialData: Partial<Product>;
  onSave: (product: Product) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const InputField = ({ 
  label, 
  name, 
  icon: Icon, 
  placeholder, 
  value, 
  onChange,
  type = "text"
}: { 
  label: string, 
  name: string, 
  icon: any, 
  placeholder: string, 
  value: string | number, 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  type?: string
}) => (
  <div className="mb-5 flex-1 min-w-[140px]">
    <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 mb-2 ml-0.5">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-600 group-focus-within:text-emerald-500 transition-colors">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#141414] border border-[#222] rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-neutral-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30 transition-all placeholder:text-neutral-700 placeholder:font-normal"
      />
    </div>
  </div>
);

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode: '',
    brand: '',
    season: '',
    model: '',
    name: '',
    productType: '',
    color: '',
    size: '',
    price: '',
    quantity: 1,
    ...initialData
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' ? parseInt(value) || 1 : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultProduct: Product = {
      id: formData.id || Math.random().toString(36).substr(2, 9),
      barcode: formData.barcode || 'N/A',
      brand: formData.brand || 'GÉNÉRIQUE',
      season: formData.season || 'N/A',
      model: formData.model || 'N/A',
      name: formData.name || 'PRODUIT SANS NOM',
      productType: formData.productType || 'N/A',
      color: formData.color || 'N/A',
      size: formData.size || 'N/A',
      price: formData.price || '0.00 EUR',
      quantity: formData.quantity || 1,
      timestamp: formData.timestamp || Date.now(),
    };
    onSave(resultProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
      <div className="bg-[#0c0c0c] border border-neutral-900 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header matching visual */}
        <div className="px-8 pt-8 pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase leading-tight">
              {isEditing ? 'Édition Article' : 'Confirmation'}
            </h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-1">
              {isEditing ? 'Modifier les propriétés dans l\'inventaire' : 'Vérifiez les données extraites par l\'IA'}
            </p>
          </div>
          <button 
            onClick={onCancel} 
            className="mt-1 p-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-full transition-colors text-neutral-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Separator line */}
        <div className="mx-8 border-t border-[#1a1a1a]" />

        <form onSubmit={handleSubmit} className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap gap-x-4">
              <InputField label="Code Barre" name="barcode" icon={Hash} placeholder="Ex: 8721222061311" value={formData.barcode || ''} onChange={handleChange} />
              <InputField label="Marque" name="brand" icon={Briefcase} placeholder="Ex: TOMMY JEANS" value={formData.brand || ''} onChange={handleChange} />
            </div>

            <div className="flex flex-wrap gap-x-4">
              <InputField label="Saison" name="season" icon={Calendar} placeholder="Ex: FW24, SS25..." value={formData.season || ''} onChange={handleChange} />
              <InputField label="Modèle" name="model" icon={Info} placeholder="Ex: DM0DM221861BX" value={formData.model || ''} onChange={handleChange} />
            </div>

            <InputField label="Nom Complet" name="name" icon={Tag} placeholder="Ex: RONNY TAPERED CRISTO" value={formData.name || ''} onChange={handleChange} />

            <div className="flex flex-wrap gap-x-4">
              <InputField label="Type" name="productType" icon={Box} placeholder="Ex: Jeans" value={formData.productType || ''} onChange={handleChange} />
              <InputField label="Couleur" name="color" icon={Palette} placeholder="Ex: Denim Dark" value={formData.color || ''} onChange={handleChange} />
            </div>

            <div className="flex flex-wrap gap-x-4">
              <InputField label="Taille" name="size" icon={Ruler} placeholder="Ex: 32 32" value={formData.size || ''} onChange={handleChange} />
              <InputField label="Quantité" name="quantity" icon={PlusSquare} type="number" placeholder="1" value={formData.quantity || 1} onChange={handleChange} />
            </div>

            <InputField label="Prix" name="price" icon={DollarSign} placeholder="Ex: 99.90 EUR" value={formData.price || ''} onChange={handleChange} />
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 px-6 bg-[#181818] hover:bg-[#222] text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all border border-transparent hover:border-neutral-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Mettre à jour' : 'Ajouter au Stock'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0c0c0c;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
};

export default ProductForm;
