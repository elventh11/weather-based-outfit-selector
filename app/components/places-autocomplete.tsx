import { MagnifyingGlassIcon, UpdateIcon } from '@radix-ui/react-icons';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn, useDebounce } from '@/lib/utils';

import {
  type Autocomplete,
  type AutocompleteOptions,
  type PlaceResult,
} from '@/types/google-maps';

type PlacesAutocompleteProps = {
  onPlaceSelect: (place: PlaceResult | null) => void;
  placeholder?: string;
  className?: string;
  debounceTime?: number;
};

export function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = 'Search location...',
  className = 'w-full max-w-sm',
  debounceTime = 300,
}: PlacesAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<Autocomplete | null>(null);

  const places = useMapsLibrary('places');
  const debouncedInputValue = useDebounce(inputValue, debounceTime);

  const handlePlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) {
      return;
    }

    setIsLoading(true);

    try {
      const place = autocompleteRef.current.getPlace();
      onPlaceSelect(place);
    } catch (error) {
      console.error('Error getting place details:', error);
      onPlaceSelect(null);
    } finally {
      setIsLoading(false);
    }
  }, [onPlaceSelect]);

  useEffect(() => {
    if (!places || !inputRef.current) {
      return;
    }

    const autoCompleteOptions: AutocompleteOptions = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    autocompleteRef.current = new places.Autocomplete(
      inputRef.current,
      autoCompleteOptions,
    );

    const listener = autocompleteRef.current.addListener(
      'place_changed',
      handlePlaceChanged,
    );

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.removeListener(listener);
        autocompleteRef.current = null;
      }
    };
  }, [places, handlePlaceChanged]);

  useEffect(() => {
    if (autocompleteRef.current && inputRef.current) {
      autocompleteRef.current.getPlace();
    }
  }, [debouncedInputValue]);

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className='pl-10 pr-10'
        aria-label='Search for a location'
      />
      <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      {isLoading && (
        <UpdateIcon className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground' />
      )}
    </div>
  );
}
