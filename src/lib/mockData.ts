
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface PriceHistory {
  id: string;
  date: string; // ISO string
  price: number;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  currentPrice: number;
  stockQuantity: number;
  category: string;
  tags: string[];
  images: ProductImage[];
  priceHistory: PriceHistory[];
  createdAt: string;
  updatedAt: string;
}

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Professional Laptop XPS",
    description: "High-performance laptop with 16GB RAM and 512GB SSD storage.",
    sku: "LAPTOP-XPS-001",
    currentPrice: 1299.99,
    stockQuantity: 15,
    category: "Electronics",
    tags: ["laptop", "professional", "high-performance"],
    images: [
      {
        id: "img-1-1",
        url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200",
        alt: "Professional Laptop XPS",
        isPrimary: true
      },
      {
        id: "img-1-2",
        url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200",
        alt: "Laptop side view",
        isPrimary: false
      }
    ],
    priceHistory: [
      { id: "ph-1-1", date: "2023-01-15T00:00:00Z", price: 1399.99 },
      { id: "ph-1-2", date: "2023-03-20T00:00:00Z", price: 1349.99 },
      { id: "ph-1-3", date: "2023-06-10T00:00:00Z", price: 1299.99, note: "Summer sale discount" }
    ],
    createdAt: "2022-12-01T12:00:00Z",
    updatedAt: "2023-06-10T15:30:00Z"
  },
  {
    id: "prod-2",
    name: "Wireless Noise-Cancelling Headphones",
    description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    sku: "AUDIO-NC-002",
    currentPrice: 249.99,
    stockQuantity: 28,
    category: "Audio",
    tags: ["headphones", "wireless", "noise-cancelling"],
    images: [
      {
        id: "img-2-1",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200",
        alt: "Wireless Headphones",
        isPrimary: true
      }
    ],
    priceHistory: [
      { id: "ph-2-1", date: "2023-02-01T00:00:00Z", price: 299.99 },
      { id: "ph-2-2", date: "2023-04-15T00:00:00Z", price: 279.99 },
      { id: "ph-2-3", date: "2023-05-20T00:00:00Z", price: 249.99, note: "Competitor price match" }
    ],
    createdAt: "2023-01-20T09:15:00Z",
    updatedAt: "2023-05-20T11:45:00Z"
  },
  {
    id: "prod-3",
    name: "Smart Home Hub",
    description: "Central control unit for all your smart home devices with voice assistant integration.",
    sku: "SMARTHOME-HUB-003",
    currentPrice: 129.99,
    stockQuantity: 42,
    category: "Smart Home",
    tags: ["smart home", "hub", "voice control"],
    images: [
      {
        id: "img-3-1",
        url: "https://images.unsplash.com/photo-1558089687-f282ffcbc0d4?auto=format&fit=crop&w=1200",
        alt: "Smart Home Hub",
        isPrimary: true
      }
    ],
    priceHistory: [
      { id: "ph-3-1", date: "2023-01-10T00:00:00Z", price: 149.99 },
      { id: "ph-3-2", date: "2023-03-05T00:00:00Z", price: 139.99 },
      { id: "ph-3-3", date: "2023-07-01T00:00:00Z", price: 129.99, note: "New model release price adjustment" }
    ],
    createdAt: "2022-12-15T14:30:00Z",
    updatedAt: "2023-07-01T16:20:00Z"
  },
  {
    id: "prod-4",
    name: "4K Ultra HD Monitor",
    description: "32-inch 4K UHD monitor with HDR support for stunning visuals.",
    sku: "MONITOR-4K-004",
    currentPrice: 399.99,
    stockQuantity: 10,
    category: "Electronics",
    tags: ["monitor", "4k", "ultra hd", "hdr"],
    images: [
      {
        id: "img-4-1",
        url: "https://images.unsplash.com/photo-1527443060795-0d11735b0b08?auto=format&fit=crop&w=1200",
        alt: "4K Monitor",
        isPrimary: true
      }
    ],
    priceHistory: [
      { id: "ph-4-1", date: "2023-02-20T00:00:00Z", price: 449.99 },
      { id: "ph-4-2", date: "2023-05-15T00:00:00Z", price: 429.99 },
      { id: "ph-4-3", date: "2023-08-01T00:00:00Z", price: 399.99, note: "Back to school promotion" }
    ],
    createdAt: "2023-02-10T10:00:00Z",
    updatedAt: "2023-08-01T09:30:00Z"
  },
  {
    id: "prod-5",
    name: "Smart Fitness Tracker",
    description: "Advanced fitness tracker with heart rate monitoring and sleep analysis.",
    sku: "FITNESS-TRACK-005",
    currentPrice: 89.99,
    stockQuantity: 35,
    category: "Wearables",
    tags: ["fitness", "tracker", "wearable"],
    images: [
      {
        id: "img-5-1",
        url: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=1200",
        alt: "Fitness Tracker",
        isPrimary: true
      }
    ],
    priceHistory: [
      { id: "ph-5-1", date: "2023-03-10T00:00:00Z", price: 99.99 },
      { id: "ph-5-2", date: "2023-06-25T00:00:00Z", price: 89.99, note: "Summer fitness promotion" }
    ],
    createdAt: "2023-03-01T11:45:00Z",
    updatedAt: "2023-06-25T13:15:00Z"
  },
  {
    id: "prod-6",
    name: "Professional Camera Kit",
    description: "DSLR camera with two lenses and accessories for professional photography.",
    sku: "CAMERA-PRO-006",
    currentPrice: 1499.99,
    stockQuantity: 8,
    category: "Photography",
    tags: ["camera", "dslr", "professional", "photography"],
    images: [
      {
        id: "img-6-1",
        url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200",
        alt: "Professional Camera",
        isPrimary: true
      }
    ],
    priceHistory: [
      { id: "ph-6-1", date: "2023-01-05T00:00:00Z", price: 1599.99 },
      { id: "ph-6-2", date: "2023-04-20T00:00:00Z", price: 1549.99 },
      { id: "ph-6-3", date: "2023-07-15T00:00:00Z", price: 1499.99, note: "Seasonal discount" }
    ],
    createdAt: "2022-12-20T09:00:00Z",
    updatedAt: "2023-07-15T10:30:00Z"
  }
];

export function getProductById(id: string): Product | undefined {
  return mockProducts.find(product => product.id === id);
}

export function getCategoryList(): string[] {
  const categories = new Set<string>();
  mockProducts.forEach(product => {
    categories.add(product.category);
  });
  return Array.from(categories);
}
