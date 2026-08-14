import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menuItems = [
  {
    name: 'Classic Margherita Pizza',
    description: 'Fresh mozzarella, vine-ripened tomatoes, sweet basil, and extra virgin olive oil on our hand-tossed sourdough crust.',
    price: 12.99,
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Signature Double Cheeseburger',
    description: 'Two grass-fed beef patties, double cheddar cheese, butter lettuce, tomato, pickles, and house burger sauce on a toasted brioche bun.',
    price: 14.99,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Traditional Roman pasta with crispy guanciale, egg yolks, Pecorino Romano cheese, and freshly cracked black pepper.',
    price: 16.49,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Crisp Caesar Salad',
    description: 'Crisp romaine hearts, garlic herb croutons, shaved Parmigiano-Reggiano, and our creamy house-made Caesar dressing.',
    price: 10.99,
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Butter Chicken & Garlic Naan',
    description: 'Tender tandoori grilled chicken simmered in a velvety spiced tomato-butter gravy, served with freshly baked garlic naan.',
    price: 18.99,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Premium Sushi Platter',
    description: 'Chef\'s daily selection of 4 pieces of fresh nigiri, 4 pieces of sashimi, and a signature Spicy Tuna roll with pickled ginger.',
    price: 22.99,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Vegan Buddha Bowl',
    description: 'Warm organic quinoa, roasted sweet potatoes, fresh avocado, steamed broccoli, spiced chickpeas, and tahini-lemon drizzle.',
    price: 13.99,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Decadent Chocolate Lava Cake',
    description: 'Rich chocolate cake with a warm, gooey molten chocolate center. Served with a scoop of premium vanilla bean ice cream.',
    price: 7.99,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Street Tacos Trio',
    description: 'Three soft corn tortillas with your choice of grilled chicken or carne asada, topped with onions, cilantro, salsa, and lime.',
    price: 11.49,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Crispy Buffalo Chicken Wings',
    description: 'Ten jumbo chicken wings tossed in our signature tangy buffalo sauce, served with celery sticks and house blue cheese dip.',
    price: 13.49,
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Garlic Parmesan Truffle Fries',
    description: 'Golden, crispy thin-cut French fries tossed in white truffle oil, minced garlic, fresh parsley, and aged parmesan cheese.',
    price: 6.49,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    isAvailable: false, // marked unavailable to test availability logic!
  },
  {
    name: 'Fresh Strawberry Lemonade',
    description: 'House-squeezed Meyer lemons blended with fresh sweet strawberries, served over crushed ice with mint garnish.',
    price: 4.49,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'BBQ Pulled Pork Sandwich',
    description: 'Slow-smoked pulled pork tossed in our signature BBQ sauce, topped with creamy coleslaw on a toasted brioche bun.',
    price: 13.99,
    imageUrl: 'https://images.unsplash.com/photo-1527666466760-f6a7a2b31176?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Vegetarian Bean Quesadilla',
    description: 'Grilled flour tortilla loaded with Monterey Jack cheese, black beans, roasted sweet corn, bell peppers, served with fresh sour cream.',
    price: 12.49,
    imageUrl: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Truffle Wild Mushroom Risotto',
    description: 'Creamy Arborio rice slowly simmered with wild forest mushrooms, white truffle oil, and aged shaved Parmesan cheese.',
    price: 17.99,
    imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
  {
    name: 'Mango Sticky Rice Dessert',
    description: 'Sweet glutinous rice infused with coconut milk syrup, served with fresh sweet mango slices and toasted sesame seeds.',
    price: 6.99,
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
  },
];

async function main() {
  console.log('Clearing database...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItem.deleteMany({});

  console.log('Seeding menu items...');
  for (const item of menuItems) {
    const createdItem = await prisma.menuItem.create({
      data: item,
    });
    console.log(`Created menu item: ${createdItem.name} (${createdItem.id})`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
