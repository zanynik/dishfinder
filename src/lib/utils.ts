import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const buildApiQuery = (search: {
  dish: string;
  city: string;
  restaurant: string;
}): string => {
  const { dish, city, restaurant } = search;
  let query = "SELECT name, restaurant_name, identifier, price_usd FROM `menu_items` WHERE 1=1";

  if (dish) {
    query += ` AND name LIKE '%${dish}%'`;
  }
  if (city) {
    query += ` AND identifier LIKE '%${city}%'`;
  }
  if (restaurant) {
    query += ` AND restaurant_name LIKE '%${restaurant}%'`;
  }

  query += ` LIMIT 10`;
  return encodeURIComponent(query);
};

export const toTitleCase = (str: string): string => {
  // Remove special characters and numbers
  const strippedStr = str.replace(/[^a-zA-Z\s]/g, "");

  // Convert to title case
  return strippedStr.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
  });
};