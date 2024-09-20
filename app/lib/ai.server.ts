import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const generateOutfitByWeather = async (weather: string) => {
  const prompt = `
  You are an expert in both fashion and weather. You are task to summarize the weather data and provide outfit suggestions based on the weather conditions. The summary should be concise and accurate. The outfit suggestions should be specific, simple, and perfectly suited for the summarized weather conditions. This is the weather data: ${weather}. The outfit suggestions should be well thought out and specific. It should only contain the outfit suggestions, nothing else. It should be well formatted in markdown.

  ## **Outfit Suggestion**
  - **Top:** Main item
  - **Bottom:** Main item
  - **Footwear:** Suitable option
  - **Accessories:** 1-2 key items
  - **Outerwear:** If needed
  - **Style Tip:** One brief styling suggestion

  ## Example

  ### **Outfit Suggestion**
  - **Top:** A light blue blouse
  - **Bottom:** A pair of dark blue jeans
  - **Footwear:** A pair of white sneakers
  - **Accessories:** A small black handbag
`;

  const response = await generateText({ model: openai('gpt-4o-mini'), prompt });

  return response.text;
};
