import { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import style from "./style.css?url";

export const links: LinksFunction = () => [
  // TailwindCSS
  { rel: "stylesheet", href: style },
  // Google Fonts | Poppins (300-700), Playfair Display (800)
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,800;1,800&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap",
  },
  // Google Material Symbols | Rounded
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main" className="absolute -left-full focus:left-0">
          Skip to main content
        </a>
        <div>
          <Link to="/arr">
            <h2 className="text-red-500">arrIgT</h2>
          </Link>
          <div className="flex flex-col place-items-center">
            <Outlet />
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
