import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { IColor } from "react-color-palette";
export function cn(...inputs: any[]): string {
  return twMerge(clsx(inputs));
}
import { open } from "@tauri-apps/api/shell";

export const openExternal = (url: string) => {
  open(url).catch(console.error);
};

export const modifyLinks = (html: string) => {
  if (!window) return "";
  // Define handleClick as a separate function and assign it to the window object
  (window as any).handleClick = function (event: MouseEvent) {
    event.preventDefault(); // Prevent the default action
    const url = (event.target as HTMLAnchorElement).href; // Get the URL from the clicked element
    openExternal(url); // Use your custom function to open the link
  };

  return html.replace(/<a href="(.*?)"/g, (match, url) => {
    // Return the modified <a> tag with an event listener for 'click'
    return `<a href="${url}" onclick="window.handleClick(event)" `;
  });
};
