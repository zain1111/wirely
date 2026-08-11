export type ShowcaseItem = {
  id: string;
  kicker: string;
  title: string;
  titleAccent: string;
  description: string;
  video: string;
  buyHref: string;
  buyLabel: string;
};

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "iphone-charger",
    kicker: "iPhone charging",
    title: "40W iPhone Charger.",
    titleAccent: "Half charge in 30 minutes.",
    description:
      "Apple 40W USB-C Dynamic Power Adapter with 60W max output — fast, safe charging for iPhone 15/16 and MacBook Air.",
    video: "/videos/iphone-charger.mp4",
    buyHref: "/40w-charger",
    buyLabel: "Buy iPhone charger",
  },
  {
    id: "samsung-charger",
    kicker: "Samsung charging",
    title: "Samsung Super Fast Charger.",
    titleAccent: "Power for every Galaxy.",
    description:
      "Super-fast USB-C charging for Samsung Galaxy phones and tablets — genuine quality, delivered across Pakistan.",
    video: "/videos/samsung-charger.mp4",
    buyHref: "/shop",
    buyLabel: "Shop Samsung charger",
  },
  {
    id: "airpods",
    kicker: "Audio",
    title: "AirPods Pro 2.",
    titleAccent: "Silence the noise.",
    description:
      "Active Noise Cancellation, H2 chip, and spatial audio — immersive sound with up to 30 hours of battery with the case.",
    video: "/videos/airpods.mp4",
    buyHref: "/airpods-pro-2",
    buyLabel: "Buy AirPods",
  },
  {
    id: "data-cable",
    kicker: "Cables",
    title: "USB-C Data Cable.",
    titleAccent: "60W fast. Built to last.",
    description:
      "Durable USB-C to USB-C cable with 60W fast charging and high-speed data transfer — the everyday essential.",
    video: "/videos/type-c-cable.mp4",
    buyHref: "/usb-c-cable",
    buyLabel: "Buy data cable",
  },
];
