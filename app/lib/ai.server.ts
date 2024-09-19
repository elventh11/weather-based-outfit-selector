import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const generateOutfitByWeather = async (weather: string) => {
  const prompt = `
  You are a fashion expert specializing in weather-appropriate clothing recommendations. Analyze weather data to provide detailed outfit suggestions. Structure your response with main categories (Top, Bottoms, Footwear, Accessories) and include alternatives where appropriate. Also provide additional tips for comfort and practicality.

  Based on the following weather data, provide detailed outfit recommendations:

  - Break down recommendations into categories: Top, Bottoms, Footwear, and Accessories.

  Weather data: ${weather}`;

  // const prompt = `
  // You are a fashion expert specializing in weather-appropriate clothing recommendations. Analyze the provided weather data to generate detailed and stylish outfit suggestions. Your response should be structured in the following categories: Top, Bottoms, Footwear, and Accessories, offering alternatives where appropriate. Additionally, provide practical tips on comfort and functionality, considering temperature, humidity, wind, and cloud cover.

  // The weather data will include variables like temperature, humidity, cloud cover, wind speed, and more. Consider all these factors when recommending outfits, ensuring that the clothing is comfortable and suitable for the specific weather conditions.

  // Here's the weather data: ${weather}.

  // Based on this weather data, provide specific and actionable clothing recommendations with a focus on comfort, style, and practicality. Break down your suggestions into the categories listed, and consider factors such as temperature fluctuations, high humidity, cloud cover, and wind speed when giving your advice.
  // `;

  const response = await generateText({ model: openai('gpt-4o-mini'), prompt });

  return response.text;
};
