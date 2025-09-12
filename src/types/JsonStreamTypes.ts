// TypeScript types for JSON stream data based on large-data.json structure

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  city: string;
  country: string;
  coordinates: Coordinates;
}

export interface Preferences {
  theme: 'dark' | 'light';
  notifications: boolean;
  language: string;
}

export interface Profile {
  age: number;
  location: Location;
  preferences: Preferences;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  orderId: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
}

export interface Activity {
  type: 'login' | 'purchase' | 'view' | 'logout';
  timestamp: string;
  ip?: string;
  amount?: number;
  productId?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile: Profile;
  orders: Order[];
  activity: Activity[];
}

export interface Review {
  userId: number;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSpecifications {
  batteryLife?: string;
  connectivity?: string[];
  weight?: string;
  colors?: string[];
  length?: string;
  connectors?: string[];
  powerDelivery?: string;
  dataTransfer?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  specifications: ProductSpecifications;
  reviews: Review[];
}

export interface TopCategory {
  name: string;
  count: number;
  revenue: number;
}

export interface MonthlyStats {
  month: string;
  users: number;
  orders: number;
  revenue: number;
}

export interface Analytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCategories: TopCategory[];
  monthlyStats: MonthlyStats[];
}

export interface Features {
  userRegistration: boolean;
  emailNotifications: boolean;
  socialLogin: boolean;
  twoFactorAuth: boolean;
}

export interface RateLimit {
  requests: number;
  window: string;
}

export interface Limits {
  maxFileSize: string;
  maxUsers: number;
  rateLimit: RateLimit;
}

export interface IntegrationConfig {
  apiKey: string;
  webhookSecret?: string;
  fromEmail?: string;
}

export interface Integration {
  name: string;
  type: string;
  enabled: boolean;
  config: IntegrationConfig;
}

export interface Config {
  features: Features;
  limits: Limits;
  integrations: Integration[];
}

export interface MetaData {
  version: string;
  generatedAt: string;
  description: string;
  totalRecords: number;
}

// Main JSON stream data type
export interface JsonStreamData {
  metaData: MetaData;
  metadata: MetaData; // Note: there's a duplicate in the JSON
  users: User[];
  products: Product[];
  analytics: Analytics;
  config: Config;
}

// Partial types for streaming scenarios
export type PartialJsonStreamData = Partial<JsonStreamData>;
export type StreamingUser = Partial<User>;
export type StreamingProduct = Partial<Product>;
export type StreamingAnalytics = Partial<Analytics>;
