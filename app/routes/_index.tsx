import { json, type ActionFunctionArgs } from '@remix-run/node';
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { CloudSun, MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ClientOnly } from 'remix-utils/client-only';

import { PlacesAutocomplete } from '@/components/places-autocomplete';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateOutfitByWeather } from '@/lib/ai.server';
import { generateOutfitImage, type FalOutput } from '@/lib/fal-ai.server';
import { getWeatherByCoordinates } from '@/lib/open-weather.server';
import { type PlaceResult } from '@/types/google-maps';

export const config = { runtime: 'edge' };

export function loader() {
  return json({ GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY });
}

type ActionData =
  | { success: false; error: string }
  | { success: true; outfitSuggestions: string; outfitImage?: FalOutput };

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const lat = formData.get('lat');
  const lng = formData.get('lng');

  if (!lat || !lng) {
    return json<ActionData>(
      {
        success: false,
        error: 'Please provide valid latitude and longitude.',
      },
      { status: 400 },
    );
  }

  try {
    const weather = await getWeatherByCoordinates(
      lat.toString(),
      lng.toString(),
    );

    const outfitSuggestions = await generateOutfitByWeather(
      JSON.stringify(weather),
    );

    console.log(weather);

    const outfitImage = await generateOutfitImage(outfitSuggestions);

    return json<ActionData>({
      success: true,
      outfitSuggestions,
      outfitImage,
    });
  } catch (error) {
    console.error(
      `Error getting weather or outfit recommendations for location ${lat}, ${lng}`,
      error,
    );

    return json<ActionData>(
      {
        success: false,
        error:
          'Unable to fetch weather data or outfit recommendations. Please try again later.',
      },
      { status: 500 },
    );
  }
}

export default function HomePage() {
  const { GOOGLE_MAPS_API_KEY } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();

  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const submit = useSubmit();

  const handlePlaceSelect = (place: PlaceResult | null) => {
    setSelectedPlace(place);

    if (place?.geometry?.location) {
      const formData = new FormData();
      formData.append('lat', place.geometry.location.lat().toString());
      formData.append('lng', place.geometry.location.lng().toString());
      submit(formData, { method: 'post' });
    }
  };

  const isLoading = navigation.state === 'submitting';

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 py-12'>
      <div className='container mx-auto px-4'>
        <h1 className='mb-8 text-center text-4xl font-bold text-blue-800'>
          Weather-based Outfit Selector
        </h1>

        <div className='grid gap-8 md:grid-cols-2'>
          <SearchLocationCard
            GOOGLE_MAPS_API_KEY={GOOGLE_MAPS_API_KEY}
            onPlaceSelect={handlePlaceSelect}
          />
          {selectedPlace && <SelectedPlaceCard place={selectedPlace} />}
        </div>

        {actionData?.success === false && (
          <Alert variant='destructive' className='mt-8 w-full'>
            <AlertDescription>{actionData.error}</AlertDescription>
          </Alert>
        )}

        {(isLoading || actionData?.success) && (
          <OutfitSuggestionsCard
            isLoading={isLoading}
            outfitSuggestions={
              actionData?.success ? actionData.outfitSuggestions : undefined
            }
            selectedPlace={selectedPlace?.formatted_address ?? ''}
            generatedOutfitImage={
              actionData?.success ? actionData.outfitImage : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

function SearchLocationCard({
  GOOGLE_MAPS_API_KEY,
  onPlaceSelect,
}: {
  GOOGLE_MAPS_API_KEY: string;
  onPlaceSelect: (place: PlaceResult | null) => void;
}) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center text-xl font-semibold text-blue-700'>
          <Search className='mr-2' /> Search Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ClientOnly>
          {() => (
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
              <PlacesAutocomplete onPlaceSelect={onPlaceSelect} />
            </APIProvider>
          )}
        </ClientOnly>
      </CardContent>
    </Card>
  );
}

function SelectedPlaceCard({ place }: { place: PlaceResult }) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center text-xl font-semibold text-blue-700'>
          <MapPin className='mr-2' /> Selected Place
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='font-medium'>{place.name}</p>
        <p className='text-sm text-muted-foreground'>
          {place.formatted_address}
        </p>
        {place.geometry?.location && (
          <p className='mt-2 text-sm text-muted-foreground'>
            Coordinates:
            {place.geometry.location.lat().toFixed(4)},{' '}
            {place.geometry.location.lng().toFixed(4)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function OutfitSuggestionsCard({
  isLoading,
  outfitSuggestions,
  generatedOutfitImage,
  selectedPlace,
}: {
  isLoading: boolean;
  outfitSuggestions?: string;
  generatedOutfitImage?: FalOutput;
  selectedPlace: string;
}) {
  return (
    <Card className='mt-8 w-full'>
      <CardHeader>
        <CardTitle className='flex items-center text-xl font-semibold text-blue-700'>
          <CloudSun className='mr-2' /> Outfit Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-2'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ) : outfitSuggestions ? (
          <div className='flex flex-col items-center gap-y-8 p-8'>
            <OutfitSuggestionImage
              generatedOutfitImage={generatedOutfitImage}
              selectedPlace={selectedPlace}
            />
            <div className='prose prose-blue mt-4 max-w-none'>
              <ReactMarkdown>{outfitSuggestions}</ReactMarkdown>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function OutfitSuggestionImage({
  generatedOutfitImage,
  selectedPlace,
}: {
  generatedOutfitImage?: FalOutput;
  selectedPlace: string;
}) {
  return (
    <div className='relative w-1/2'>
      <img
        key={generatedOutfitImage?.images[0]?.url}
        src={generatedOutfitImage?.images[0]?.url}
        alt={`Outfit Suggestion for ${selectedPlace}`}
        className='h-auto w-full rounded-lg'
      />
    </div>
  );
}
