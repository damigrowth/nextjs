import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveButtonProps {
  isSaved: boolean;
  onSave: () => void;
  className?: string;
}

export default function SaveButton({
  isSaved,
  onSave,
  className = '',
}: SaveButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave();
  };

  return (
    <Button
      variant='ghost'
      size='sm'
      className={`h-8 w-8 p-0 rounded-full bg-muted ${
        isSaved
          ? 'text-red-500 hover:text-red-600 bg-muted'
          : 'text-gray-400 hover:text-red-500'
      } ${className}`}
      onClick={handleClick}
    >
      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
    </Button>
  );
}
