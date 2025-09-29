import React from 'react';
import type { Material } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface MaterialInputProps {
  index: number;
  material: Material;
  onMaterialChange: (index: number, field: 'name' | 'cost', value: string) => void;
  onRemoveMaterial: (index: number) => void;
  isLast: boolean;
}

const MaterialInput: React.FC<MaterialInputProps> = ({ index, material, onMaterialChange, onRemoveMaterial, isLast }) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        placeholder="Material Name (e.g., Yarn)"
        value={material.name}
        onChange={(e) => onMaterialChange(index, 'name', e.target.value)}
        className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition"
      />
      <input
        type="number"
        placeholder="Cost ($)"
        value={material.cost}
        onChange={(e) => onMaterialChange(index, 'cost', e.target.value)}
        className="w-1/3 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-zinc-200 transition"
      />
      <button
        type="button"
        onClick={() => onRemoveMaterial(index)}
        disabled={isLast}
        className="p-2 text-zinc-500 hover:text-red-500 disabled:text-zinc-700 disabled:cursor-not-allowed transition rounded-full hover:bg-red-500/10"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MaterialInput;