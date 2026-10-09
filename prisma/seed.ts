import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800';

const categoriesData = [
  { name: 'Engine Parts', desc: 'Pistons, valves, and engine blocks', img: DEFAULT_PLACEHOLDER },
  { name: 'Brake Parts', desc: 'Brake pads, rotors, and calipers', img: '/images/brake_caliper_1791466390763.jpg' },
  { name: 'Suspension Parts', desc: 'Shock absorbers, struts, and springs', img: '/images/shock_absorber_1791466413366.jpg' },
  { name: 'Steering Parts', desc: 'Steering racks and tie rods', img: '/images/steering_pump_1791466475284.jpg' },
  { name: 'Transmission Parts', desc: 'Gearboxes and transmission fluids', img: '/images/cv_joint_1791466226392.jpg' },
  { name: 'Clutch Parts', desc: 'Clutch plates and kits', img: '/images/clutch_kit_1791466499039.jpg' },
  { name: 'Electrical Parts', desc: 'Alternators, starters, and sensors', img: DEFAULT_PLACEHOLDER },
  { name: 'Filters', desc: 'Oil, air, cabin, and fuel filters', img: DEFAULT_PLACEHOLDER },
  { name: 'Batteries', desc: '12V Automotive batteries', img: DEFAULT_PLACEHOLDER },
  { name: 'Cooling System', desc: 'Radiators, water pumps, and thermostats', img: DEFAULT_PLACEHOLDER },
  { name: 'Fuel System', desc: 'Fuel pumps, injectors, and lines', img: '/images/fuel_injector_1791466246209.jpg' },
  { name: 'Exhaust System', desc: 'Mufflers, pipes, and catalytic converters', img: DEFAULT_PLACEHOLDER },
  { name: 'Body Parts', desc: 'Bumpers, fenders, and mirrors', img: DEFAULT_PLACEHOLDER },
  { name: 'Lighting', desc: 'Headlights, tail lights, and bulbs', img: DEFAULT_PLACEHOLDER },
  { name: 'Belts & Tensioners', desc: 'Timing belts and drive belts', img: '/images/timing_belt_1791466207397.jpg' },
  { name: 'Bearings', desc: 'Wheel bearings and hub assemblies', img: '/images/wheel_bearing_1791466185338.jpg' },
  { name: 'Spark Plugs', desc: 'Ignition parts and coils', img: '/images/spark_plug_1791466164055.jpg' },
  { name: 'Wipers', desc: 'Wiper blades and motors', img: '/images/wiper_blade_1791466144561.jpg' },
  { name: 'Automotive Accessories', desc: 'Car care, mats, and tools', img: DEFAULT_PLACEHOLDER }
];

const exactProducts = [
  // Engine
  { name: 'Piston Ring Set', cat: 'Engine Parts', img: DEFAULT_PLACEHOLDER },
  { name: 'Cylinder Head Gasket', cat: 'Engine Parts', img: DEFAULT_PLACEHOLDER },
  // Brakes
  { name: 'Ceramic Brake Pad Set', cat: 'Brake Parts', img: '/images/brake_pad_1791466269161.jpg' },
  { name: 'Vented Brake Disc Rotor', cat: 'Brake Parts', img: '/images/brake_disc_1791466289639.jpg' },
  { name: 'Brake Caliper Assembly', cat: 'Brake Parts', img: '/images/brake_caliper_1791466390763.jpg' },
  // Suspension
  { name: 'Gas-Charged Shock Absorber', cat: 'Suspension Parts', img: '/images/shock_absorber_1791466413366.jpg' },
  { name: 'Lower Control Arm', cat: 'Suspension Parts', img: '/images/control_arm_1791466455073.jpg' },
  // Steering
  { name: 'Power Steering Rack', cat: 'Steering Parts', img: '/images/steering_pump_1791466475284.jpg' },
  { name: 'Tie Rod End', cat: 'Steering Parts', img: '/images/steering_pump_1791466475284.jpg' }, // Reuse
  // Transmission & Clutch
  { name: 'CV Joint Kit', cat: 'Transmission Parts', img: '/images/cv_joint_1791466226392.jpg' },
  { name: 'Drive Shaft Assembly', cat: 'Transmission Parts', img: '/images/cv_joint_1791466226392.jpg' },
  { name: 'Clutch Plate & Pressure Plate', cat: 'Clutch Parts', img: '/images/clutch_kit_1791466499039.jpg' },
  // Electrical
  { name: 'High-Output Alternator', cat: 'Electrical Parts', img: DEFAULT_PLACEHOLDER },
  { name: 'Starter Motor Assembly', cat: 'Electrical Parts', img: DEFAULT_PLACEHOLDER },
  // Filters
  { name: 'Premium Oil Filter', cat: 'Filters', img: DEFAULT_PLACEHOLDER },
  { name: 'High-Flow Air Filter', cat: 'Filters', img: DEFAULT_PLACEHOLDER },
  // Batteries
  { name: '12V AGM Automotive Battery', cat: 'Batteries', img: DEFAULT_PLACEHOLDER },
  // Cooling
  { name: 'Aluminum Radiator', cat: 'Cooling System', img: DEFAULT_PLACEHOLDER },
  { name: 'Engine Water Pump', cat: 'Cooling System', img: DEFAULT_PLACEHOLDER },
  // Fuel System
  { name: 'High-Pressure Fuel Pump', cat: 'Fuel System', img: '/images/fuel_injector_1791466246209.jpg' },
  { name: 'Fuel Injector Nozzle', cat: 'Fuel System', img: '/images/fuel_injector_1791466246209.jpg' },
  // Exhaust
  { name: 'Stainless Steel Exhaust Muffler', cat: 'Exhaust System', img: DEFAULT_PLACEHOLDER },
  // Lighting
  { name: 'LED Headlight Assembly', cat: 'Lighting', img: DEFAULT_PLACEHOLDER },
  { name: 'Rear Tail Light Cluster', cat: 'Lighting', img: DEFAULT_PLACEHOLDER },
  // Belts & Tensioners
  { name: 'Engine Timing Belt', cat: 'Belts & Tensioners', img: '/images/timing_belt_1791466207397.jpg' },
  // Bearings
  { name: 'Front Wheel Bearing', cat: 'Bearings', img: '/images/wheel_bearing_1791466185338.jpg' },
  // Spark Plugs
  { name: 'Iridium Spark Plug', cat: 'Spark Plugs', img: '/images/spark_plug_1791466164055.jpg' },
  // Wipers
  { name: 'Aerodynamic Wiper Blade', cat: 'Wipers', img: '/images/wiper_blade_1791466144561.jpg' },
];

async function main() {
  console.log('Clearing old categories and products to enforce exact demo catalogue matching...');
  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Seeding comprehensive demo catalogue with Wikimedia imagery...');

  // Create categories
  const categoryMap = new Map();
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: { name: cat.name, description: cat.desc, imageUrl: cat.img }
    });
    categoryMap.set(cat.name, createdCat.id);
  }

  // Create products
  let skuCounter = 1000;
  for (const prod of exactProducts) {
    const catId = categoryMap.get(prod.cat);
    if (!catId) {
      console.warn(`Category not found for: ${prod.cat}`);
      continue;
    }

    const sku = `NG-${prod.cat.replace(/\\s/g, '').substring(0, 4).toUpperCase()}-${skuCounter++}`;
    
    const createdProd = await prisma.product.create({
      data: {
        name: prod.name,
        SKU: sku,
        partNumber: `PT-${skuCounter}`,
        brand: 'Standard Replacement',
        description: `Premium ${prod.name}. Designed for exact fitment and reliable performance.`,
        categoryId: catId,
        featured: true,
        stockQuantity: Math.floor(Math.random() * 50) + 5,
        compatibility: JSON.stringify(['Universal Fit', 'Standard Replacement']),
        specifications: JSON.stringify({ Quality: 'Standard', Condition: 'New' })
      }
    });

    await prisma.productImage.create({
      data: {
        productId: createdProd.id,
        url: prod.img,
        isPrimary: true,
        order: 0
      }
    });
  }

  console.log('Comprehensive Exact Demo Catalogue seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
