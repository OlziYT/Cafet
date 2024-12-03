import { Leaf, Wheat, Salad } from 'lucide-react';
import { clsx } from 'clsx';

const tagConfig: Record<string, {
  icon: any;
  label: string;
  className: string;
  darkClassName: string;
}> = {
  'gluten-free': {
    icon: Wheat,
    label: 'Sans gluten',
    className: 'bg-amber-100 text-amber-800',
    darkClassName: 'dark:bg-amber-900/50 dark:text-amber-200',
  },
  'vegan': {
    icon: Leaf,
    label: 'Végétalien',
    className: 'bg-green-100 text-green-800',
    darkClassName: 'dark:bg-green-900/50 dark:text-green-200',
  },
  'vegetarian': {
    icon: Salad,
    label: 'Végétarien',
    className: 'bg-emerald-100 text-emerald-800',
    darkClassName: 'dark:bg-emerald-900/50 dark:text-emerald-200',
  },
  'organic': {
    icon: Leaf,
    label: 'Bio',
    className: 'bg-lime-100 text-lime-800',
    darkClassName: 'dark:bg-lime-900/50 dark:text-lime-200',
  },
};

export function DietaryTag({ tag }: { tag: string }) {
  const config = tagConfig[tag] || {
    icon: Leaf,
    label: tag,
    className: 'bg-gray-100 text-gray-800',
    darkClassName: 'dark:bg-gray-800 dark:text-gray-200'
  };
  
  const Icon = config.icon;

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config.className,
      config.darkClassName
    )}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}