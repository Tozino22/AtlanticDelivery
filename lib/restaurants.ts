export type Restaurant = {
    id: string;
    name: string;
    tagline: string;
    category: string;
    rating: number;
    deliveryTime: string;
    gradient: string;   // CSS inline gradient value
    accent: string;    // text-colour for sub-labels
    emoji: string;
};

export type MenuItemLocal = {
    id: string;
    restaurantId: string;
    restaurantName: string;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
    image_url?: string;
};

export const restaurants: Restaurant[] = [
    {
        id: 'moes-kitchen',
        name: "MOE'S Kitchen",
        tagline: 'Home-style West African classics',
        category: 'African Cuisine',
        rating: 4.8,
        deliveryTime: '25–35 min',
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
        accent: '#93c5fd',
        emoji: '🍲',
    },
    {
        id: 'great-delight',
        name: 'Great Delight',
        tagline: 'Fresh flavours, every single day',
        category: 'African Cuisine',
        rating: 4.6,
        deliveryTime: '20–30 min',
        gradient: 'linear-gradient(135deg, #475569 0%, #2563eb 100%)',
        accent: '#bfdbfe',
        emoji: '🌿',
    },
    {
        id: 'lollys-cake-haven',
        name: "Lolly's Cake Haven",
        tagline: "Atlantic's finest handcrafted cakes & bakes",
        category: 'Bakery & Cakes',
        rating: 4.9,
        deliveryTime: '30–45 min',
        gradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 60%, #f9a8d4 100%)',
        accent: '#fce7f3',
        emoji: '🎂',
    },
];

export const menuItems: MenuItemLocal[] = [
    // MOE'S Kitchen
    {
        id: 'moes-jollof',
        restaurantId: 'moes-kitchen',
        restaurantName: "MOE'S Kitchen",
        name: 'Jollof Rice',
        description: 'Smoky, party-style Jollof rice cooked in a rich tomato base with fried plantains and grilled chicken.',
        price: 18.99,
        category: 'Main',
        available: true,
        image_url: '/images/jollof.png',
    },
    {
        id: 'moes-amala',
        restaurantId: 'moes-kitchen',
        restaurantName: "MOE'S Kitchen",
        name: 'Amala',
        description: 'Smooth and velvety Amala swallow served with hearty Egusi soup and a generous helping of assorted meats.',
        price: 22.50,
        category: 'Main',
        available: true,
        image_url: '/images/amala.png',
    },
    // Great Delight
    {
        id: 'gd-jollof',
        restaurantId: 'great-delight',
        restaurantName: 'Great Delight',
        name: 'Jollof Rice',
        description: "Great Delight's signature Jollof — slow-cooked with secret spices, served with coleslaw and fried fish.",
        price: 17.50,
        category: 'Main',
        available: true,
        image_url: '/images/jollof.png',
    },
    {
        id: 'gd-amala',
        restaurantId: 'great-delight',
        restaurantName: 'Great Delight',
        name: 'Amala',
        description: 'Classic Amala swallow paired with our signature Gbegiri and Ewedu soup, topped with ponmo and shaki.',
        price: 20.00,
        category: 'Main',
        available: true,
        image_url: '/images/amala.png',
    },
    // Lolly's Cake Haven
    {
        id: 'lollys-celebration-cake',
        restaurantId: 'lollys-cake-haven',
        restaurantName: "Lolly's Cake Haven",
        name: 'Celebration Layer Cake',
        description: 'A stunning 5-layer vanilla sponge cake with silky white buttercream, fresh strawberries, blueberries and edible gold leaf. Perfect for any occasion.',
        price: 54.99,
        category: 'Cakes',
        available: true,
        image_url: '/images/lollys_celebration_cake.png',
    },
    {
        id: 'lollys-chocolate-cake',
        restaurantId: 'lollys-cake-haven',
        restaurantName: "Lolly's Cake Haven",
        name: 'Dark Chocolate Velvet Cake',
        description: 'Indulgent dark chocolate velvet cake with glossy ganache drip, raspberry coulis, chocolate shavings and a touch of gold dust. Pure luxury in every slice.',
        price: 49.99,
        category: 'Cakes',
        available: true,
        image_url: '/images/lollys_chocolate_cake.png',
    },
];
