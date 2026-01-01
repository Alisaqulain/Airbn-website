// Seed script to add dummy listings with images
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const User = require("./models/user.js");

const dburl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/airbn";

const sampleListings = [
    {
        title: "Cozy Beachfront Cottage in Malibu",
        description: "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views, direct beach access, and a fully equipped kitchen. Perfect for couples or small families seeking tranquility.",
        image: {
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "beachfront-cottage"
        },
        price: 2500,
        location: "Malibu",
        country: "United States"
    },
    {
        title: "Modern Downtown Loft in Manhattan",
        description: "Stay in the heart of NYC in this stylish loft apartment. High ceilings, floor-to-ceiling windows, and modern amenities. Walking distance to Times Square, Central Park, and top restaurants.",
        image: {
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "downtown-loft"
        },
        price: 3200,
        location: "New York City",
        country: "United States"
    },
    {
        title: "Mountain Retreat Cabin in Aspen",
        description: "Unplug and unwind in this peaceful mountain cabin surrounded by nature. Features a fireplace, hot tub, and stunning mountain views. Perfect for skiing enthusiasts and nature lovers.",
        image: {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "mountain-cabin"
        },
        price: 1800,
        location: "Aspen",
        country: "United States"
    },
    {
        title: "Luxury Villa in Tuscany",
        description: "Experience Italian elegance in this historic villa. Features infinity pool, vineyard views, and authentic Italian architecture. Includes daily housekeeping and concierge service.",
        image: {
            url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "tuscany-villa"
        },
        price: 4500,
        location: "Tuscany",
        country: "Italy"
    },
    {
        title: "Beach House in Santorini",
        description: "Stunning white-washed villa with caldera views. Private pool, traditional architecture, and breathtaking sunsets. Steps away from local restaurants and beaches.",
        image: {
            url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "santorini-villa"
        },
        price: 3800,
        location: "Santorini",
        country: "Greece"
    },
    {
        title: "Tokyo Apartment in Shibuya",
        description: "Modern apartment in the heart of Shibuya. Compact but fully equipped with smart home features. Close to shopping, dining, and Tokyo's best attractions.",
        image: {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "tokyo-apartment"
        },
        price: 1500,
        location: "Tokyo",
        country: "Japan"
    },
    {
        title: "Bali Villa with Private Pool",
        description: "Tropical paradise with private infinity pool overlooking rice terraces. Open-air design, traditional Balinese architecture, and daily breakfast included.",
        image: {
            url: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "bali-villa"
        },
        price: 2200,
        location: "Ubud",
        country: "Indonesia"
    },
    {
        title: "Parisian Apartment near Eiffel Tower",
        description: "Charming studio apartment with Eiffel Tower views. Authentic Parisian decor, fully equipped kitchen, and walking distance to major attractions.",
        image: {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "paris-apartment"
        },
        price: 2800,
        location: "Paris",
        country: "France"
    },
    {
        title: "Beachfront Villa in Maldives",
        description: "Overwater villa with direct access to crystal-clear waters. Glass floor panels, private deck, and world-class diving. All-inclusive packages available.",
        image: {
            url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "maldives-villa"
        },
        price: 5500,
        location: "Maldives",
        country: "Maldives"
    },
    {
        title: "Cozy Cabin in Swiss Alps",
        description: "Traditional alpine cabin with mountain views. Wood-burning stove, modern amenities, and ski-in/ski-out access. Perfect for winter sports enthusiasts.",
        image: {
            url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            filename: "swiss-cabin"
        },
        price: 2100,
        location: "Zermatt",
        country: "Switzerland"
    }
];

async function seedListings() {
    try {
        await mongoose.connect(dburl);
        console.log("✓ Connected to MongoDB");

        // Find or create a demo user
        let demoUser = await User.findOne({ email: "demo@wanderlust.com" });
        if (!demoUser) {
            const demoUserData = new User({ 
                email: "demo@wanderlust.com",
                username: "demo_host"
            });
            demoUser = await User.register(demoUserData, "demo123");
            console.log("✓ Created demo user");
        }

        // Clear existing listings (optional - comment out if you want to keep existing)
        // await Listing.deleteMany({});
        // console.log("✓ Cleared existing listings");

        // Add owner to each listing
        const listingsWithOwner = sampleListings.map(listing => ({
            ...listing,
            owner: demoUser._id
        }));

        const inserted = await Listing.insertMany(listingsWithOwner);
        console.log(`✓ Successfully seeded ${inserted.length} listings`);

        process.exit(0);
    } catch (error) {
        console.error("✗ Error seeding listings:", error);
        process.exit(1);
    }
}

seedListings();

