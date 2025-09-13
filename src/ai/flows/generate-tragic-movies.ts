'use server';
/**
 * @fileOverview Suggests movies with tragic endings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TragicMoviesInputSchema = z.object({
  language: z.string().optional().describe('The language of the movies to suggest.'),
});
export type TragicMoviesInput = z.infer<typeof TragicMoviesInputSchema>;


// A curated list of movies with tragic endings.
// This is faster and more reliable than an AI call.
const tragicMovieList: {[key: string]: string[]} = {
    'en': [ // English
        "Requiem for a Dream",
        "Dancer in the Dark",
        "Million Dollar Baby",
        "Brokeback Mountain",
        "Atonement",
        "The Mist",
        "Grave of the Fireflies", // Japanese, but widely known in English
        "Bridge to Terabithia",
        "My Girl",
        "The Boy in the Striped Pyjamas"
    ],
    'hi': [ // Hindi
        "Devdas",
        "Aashiqui 2",
        "Lootera",
        "Tere Naam",
        "Ghajini",
        "Sadma",
        "Rang De Basanti",
        "Rockstar",
        "Kai Po Che!",
        "Masaan"
    ],
    'es': [ // Spanish
        "Biutiful",
        "The Sea Inside (Mar adentro)",
        "The Orphanage (El orfanato)",
        "Pan's Labyrinth (El laberinto del fauno)",
        "Talk to Her (Hable con ella)",
        "Open Your Eyes (Abre los ojos)",
        "The Secret in Their Eyes (El secreto de sus ojos)", // Bittersweet/tragic elements
        "Amores perros",
        "Y tu mamá también",
        "All About My Mother (Todo sobre mi madre)"
    ],
     'bn': ["Bisorjon", "Pather Panchali", "Meghe Dhaka Tara", "Apur Sansar", "Chokher Bali"],
    'zh': ["Farewell My Concubine", "To Live", "In the Mood for Love", "Lust, Caution", "Crouching Tiger, Hidden Dragon"],
    'fr': ["Amour", "Blue Is the Warmest Colour", "The Intouchables", "La Haine", "Portrait of a Lady on Fire"],
    'de': ["The Lives of Others", "Downfall", "Goodbye, Lenin!", "The White Ribbon", "Run Lola Run"],
    'it': ["Life Is Beautiful", "Cinema Paradiso", "The Great Beauty", "Bicycle Thieves", "La Dolce Vita"],
    'ja': ["Grave of the Fireflies", "Departures", "Harakiri", "Ikiru", "Tokyo Story"],
    'ko': ["Oldboy", "Parasite", "The Handmaiden", "A Moment to Remember", "Miracle in Cell No. 7"],
    'ml': ["Kumbalangi Nights", "Drishyam", "Bangalore Days", "Premam", "Uyare"],
    'mr': ["Sairat", "Natsamrat", "Court", "Fandry", "Killa"],
    'pt': ["City of God", "Central Station", "Elite Squad", "A Dog's Will", "The Second Mother"],
    'ru': ["Leviathan", "The Return", "Come and See", "Stalker", "Andrei Rublev"],
    'ta': ["Anbe Sivam", "Pariyerum Perumal", "Kaithi", "Vada Chennai", "96"],
    'te': ["Rangasthalam", "Mahanati", "Jersey", "C/o Kancharapalem", "Arjun Reddy"],
};


export async function getTragicMovies(input: TragicMoviesInput): Promise<string[]> {
  const lang = input.language || 'en';
  // Return the curated list for the given language, or default to English.
  return tragicMovieList[lang] || tragicMovieList['en'];
}
