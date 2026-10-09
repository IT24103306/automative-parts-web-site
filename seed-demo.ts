import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesData = [
  { name: 'Engine Parts', products: [
    { name: 'Timing Belt Kit', img: '/images/timing_belt_1791466207397.jpg' },
    { name: 'Engine Gasket Set', img: '/images/timing_belt_1791466207397.jpg' },
    { name: 'Piston Ring Set', img: '/images/timing_belt_1791466207397.jpg' }
  ]},
  { name: 'Brake Parts', products: [
    { name: 'Premium Brake Pad Set', img: '/images/brake_pad_1791466269161.jpg' },
    { name: 'Vented Brake Disc', img: '/images/brake_disc_1791466289639.jpg' },
    { name: 'Brake Caliper Assembly', img: '/images/brake_caliper_1791466390763.jpg' }
  ]},
  { name: 'Suspension Parts', products: [
    { name: 'Gas Shock Absorber', img: '/images/shock_absorber_1791466413366.jpg' },
    { name: 'Control Arm Bushing', img: '/images/control_arm_1791466455073.jpg' }
  ]},
  { name: 'Steering Parts', products: [
    { name: 'Power Steering Pump', img: '/images/steering_pump_1791466475284.jpg' },
    { name: 'Tie Rod End', img: '/images/steering_pump_1791466475284.jpg' }
  ]},
  { name: 'Transmission & Clutch', products: [
    { name: 'Complete Clutch Kit', img: '/images/clutch_kit_1791466499039.jpg' },
    { name: 'CV Joint Kit', img: '/images/cv_joint_1791466226392.jpg' }
  ]},
  { name: 'Fuel System', products: [
    { name: 'Fuel Injector', img: '/images/fuel_injector_1791466246209.jpg' }
  ]},
  { name: 'Wipers', products: [
    { name: 'Aerodynamic Wiper Blade', img: '/images/wiper_blade_1791466144561.jpg' }
  ]},
  { name: 'Spark Plugs', products: [
    { name: 'Iridium Spark Plug Set', img: '/images/spark_plug_1791466164055.jpg' },
    { name: 'Platinum Spark Plug', img: '/images/spark_plug_1791466164055.jpg' }
  ]},
  { name: 'Bearings', products: [
    { name: 'Front Wheel Bearing', img: '/images/wheel_bearing_1791466185338.jpg' },
    { name: 'Rear Hub Bearing Assembly', img: '/images/wheel_bearing_1791466185338.jpg' }
  ]}
];

async function seed() {
  console.log('Clearing existing database to apply comprehensive demo seed...');
  
  // Clear existing items using transaction to avoid foreign key issues
  await prisma.$transaction([
    prisma.productImage.deleteMany({}),
    prisma.orderItem.deleteMany({}),
    prisma.product.deleteMany({}),
    prisma.category.deleteMany({})
  ]);

  console.log('Database cleared. Seeding comprehensive demo automotive products...');
  
  let pnCounter = 1000;
  
  for (const catData of categoriesData) {
    // Create category
    const category = await prisma.category.create({
      data: {
        name: catData.name,
        description: `Premium automotive ${catData.name.toLowerCase()} for all vehicle makes.`,
        isActive: true,
        imageUrl: catData.products[0].img // Use first product image as category image
      }
    });

    console.log(`Created Category: ${category.name}`);

    // Create products for this category
    for (let i = 0; i < catData.products.length; i++) {
      const prodData = catData.products[i];
      const pn = `DEMO-PN-${pnCounter++}`;
      
      const product = await prisma.product.create({
        data: {
          name: prodData.name,
          partNumber: pn,
          SKU: pn,
          brand: 'Premium Autoparts',
          categoryId: category.id,
          description: `High-quality ${prodData.name.toLowerCase()} designed for durability and optimal performance. These are premium demo parts for the storefront presentation.`,
          availability: 'AVAILABLE',
          stockQuantity: 50,
          active: true,
          featured: i === 0, // Feature the first product of each category
        }
      });
      
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: prodData.img,
          isPrimary: true
        }
      });
      
      console.log(`  Created Product: ${product.name}`);
    }
  }

  console.log('Comprehensive Demo seed completed successfully!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
