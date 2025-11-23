import game1 from "@/assets/game-1.jpg";
import game2 from "@/assets/game-2.jpg";
import game3 from "@/assets/game-3.jpg";

export interface Game {
  id: string;
  title: string;
  genre: string;
  description: string;
  longDescription: string;
  image: string;
  price: string;
  features: string[];
  screenshots: string[];
}

export const gamesData: Game[] = [
  {
    id: "enchanted-realms",
    title: "Enchanted Realms",
    genre: "Fantasy RPG",
    description: "Explore a magical world filled with mythical creatures and ancient mysteries.",
    longDescription: "Embark on an epic journey through the Enchanted Realms, where magic flows through every living thing. Discover hidden temples, befriend mystical creatures, and uncover the secrets of an ancient civilization. Your choices shape the world around you in this immersive fantasy adventure.",
    image: game1,
    price: "$29.99",
    features: [
      "Open-world exploration with 50+ hours of gameplay",
      "Dynamic magic system with 100+ spells",
      "Branching storyline with multiple endings",
      "Rich character customization",
      "Epic boss battles",
    ],
    screenshots: [game1, game1, game1],
  },
  {
    id: "skybound-adventures",
    title: "Skybound Adventures",
    genre: "Action Adventure",
    description: "Sail the skies in your airship and discover floating cities and ancient treasures.",
    longDescription: "Take to the skies in Skybound Adventures, where floating islands hold countless secrets and dangers. Command your own airship, assemble a crew of unique characters, and navigate through treacherous sky storms. Engage in thrilling aerial combat and uncover the mystery of the fallen civilization.",
    image: game2,
    price: "$34.99",
    features: [
      "Airship customization and combat",
      "Explore 20+ unique floating islands",
      "Recruit and manage crew members",
      "Trading and crafting systems",
      "Co-op multiplayer mode",
    ],
    screenshots: [game2, game2, game2],
  },
  {
    id: "shadow-warrior",
    title: "Shadow Warrior",
    genre: "Dark Fantasy",
    description: "Master the ancient arts and fight through hordes of darkness in this epic saga.",
    longDescription: "In a world consumed by shadows, you are the last warrior capable of wielding the ancient runes. Battle through hordes of dark creatures, master powerful combat techniques, and restore light to the realm. Every victory brings you closer to uncovering the truth behind the darkness.",
    image: game3,
    price: "$39.99",
    features: [
      "Intense hack-and-slash combat",
      "Rune-based power system",
      "Dark fantasy atmosphere",
      "New Game+ mode with additional challenges",
      "Boss rush mode",
    ],
    screenshots: [game3, game3, game3],
  },
];
