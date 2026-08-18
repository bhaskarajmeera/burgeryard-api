const express = require('express');

const router = express.Router();

const menu = [
  {
    id: 1,
    name: 'Yard Special',
    category: 'Signature Burgers',
    price: 15,
    description: 'Wagyu beef burger with lettuce, slaw, jalapenos and signature sauce.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    name: 'Backyard Classic',
    category: 'Signature Burgers',
    price: 15,
    description: 'Classic burger with cheddar, tomato, onion and truffle sauce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: 'Double Stack',
    category: 'Signature Burgers',
    price: 23,
    description: 'Double wagyu beef patty stacked with cheese and house sauce.',
    image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    name: 'Smokey BBQ Deluxe',
    category: 'Signature Burgers',
    price: 15,
    description: 'Loaded with onion rings, BBQ sauce and grilled flavour.',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'Aussie Mate',
    category: 'Signature Burgers',
    price: 20,
    description: 'Crispy chicken, cheese, slaw and smoky sauce in one stack.',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    name: 'Cheese Lover’s',
    category: 'Signature Burgers',
    price: 15,
    description: 'Double cheese, pickles and truffle sauce for a rich bite.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    name: 'Chicky Chook',
    category: 'Chicken',
    price: 15,
    description: 'Grilled chicken burger with fresh salad and signature sauce.',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    name: 'Crispy Firebird',
    category: 'Chicken',
    price: 15,
    description: 'Crispy chicken burger with onion rings and spicy peri sauce.',
    image: 'https://images.unsplash.com/photo-1565310022184-f23a884f29da?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    name: 'Green Yard Veggie',
    category: 'Veggie Picks',
    price: 15,
    description: 'Veggie patty with grilled peppers, lettuce, gherkins and peri sauce.',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 10,
    name: 'Veg Loaded Fries',
    category: 'Sides',
    price: 15,
    description: 'Loaded fries with cheese sauce, onion, jalapenos and spicy dressing.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 11,
    name: 'Milkshake',
    category: 'Milkshakes',
    price: 9.9,
    description: 'Creamy milkshake with a smooth, indulgent finish.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80',
  },
];

router.get('/', (req, res) => {
  res.json({ success: true, menu });
});

router.get('/categories', (req, res) => {
  const categories = [...new Set(menu.map((item) => item.category))];
  res.json({ success: true, categories });
});

module.exports = router;
