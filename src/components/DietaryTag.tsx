import { Leaf, Wheat, Salad } from 'lucide-react';
import { clsx } from 'clsx';

const tagConfig: Record<string, {
  icon: any;
  label: string;
  className: string;
}> = {
  'gluten-free': {
    icon: Wheat,
    label: 'Sans gluten',
    className: 'bg-amber-100 text-amber-800',
  },
  'vegan': {
    icon: Leaf,
    label: 'Végétalien',
    className: 'bg-green-100 text-green-800',
  },
  'vegetarian': {
    icon: Salad,
    label: 'Végétarien',
    className: 'bg-emerald-100 text-emerald-800',
  },
  'organic': {
    icon: Leaf,
    label: 'Bio',
    className: 'bg-lime-100 text-lime-800',
  },
};

export function DietaryTag({ tag }: { tag: string }) {
  const config = tagConfig[tag] || {
    icon: Leaf,
    label: tag,
    className: 'bg-gray-100 text-gray-800'
  };
  
  const Icon = config.icon;

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config.className
    )}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}