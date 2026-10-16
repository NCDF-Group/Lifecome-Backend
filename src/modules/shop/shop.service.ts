import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, ilike } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

import { DRIZZLE, type Database } from '../../db/client';
import { shopBasketItems, shopBaskets, shopOrderItems, shopOrders, shopProducts } from '../../db/schema';
import { AppException, NotFoundAppException } from '../../common/errors/app-exception';
import { PatientService } from '../patient/patient.service';
import type { AddBasketItemDto, CheckoutOrderDto, ListProductsQueryDto } from './dto/shop.dto';

const nanoidOrder = customAlphabet('0123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

const DEFAULT_PRODUCTS = [
  {
    sku: 'SUP-MAG-500',
    name: 'High Absorption Magnesium Glycinate 500mg',
    slug: 'magnesium-glycinate-500mg',
    category: 'vitamins_supplements',
    description: 'Chelated magnesium glycinate formulated for optimal absorption and gentle digestion. Supports muscle relaxation, nervous system balance, and restful sleep.',
    pricePence: 1850,
    stockQuantity: 150,
    ingredients: 'Magnesium Bisglycinate Chelate, Vegetable Capsule Shell (Hydroxypropyl Methylcellulose), Rice Flour, Silicon Dioxide.',
    usageInstructions: 'Take 2 capsules daily with water, preferably with an evening meal.',
    warnings: 'Food supplements must not be used as a substitute for a varied and balanced diet. Consult a GP if pregnant or breastfeeding.',
    productAdviceLink: 'https://lifecome.co.uk/advice/magnesium-guide',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
    isPrescription: false,
    isActive: true,
  },
  {
    sku: 'SUP-VITD3-2000',
    name: 'Daily Vitamin D3 2000 IU + K2 MK-7',
    slug: 'vitamin-d3-2000iu-k2',
    category: 'vitamins_supplements',
    description: 'High-strength natural Vitamin D3 sourced from cholecalciferol, paired with Vitamin K2 (MK-7) to support calcium distribution, bone strength, and immune defences.',
    pricePence: 1400,
    stockQuantity: 200,
    ingredients: 'Vitamin D3 (Cholecalciferol), Vitamin K2 (Menaquinone-7 from Natto), Cold-Pressed Virgin Olive Oil, Softgel Shell (Bovine Gelatin, Glycerol).',
    usageInstructions: 'Take 1 softgel daily with your main meal for optimal fat-soluble absorption.',
    warnings: 'Do not exceed the recommended daily intake. Not suitable for children under 12.',
    productAdviceLink: 'https://lifecome.co.uk/advice/vitamin-d-facts',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&auto=format&fit=crop&q=80',
    isPrescription: false,
    isActive: true,
  },
  {
    sku: 'HRB-SLEEP-60',
    name: 'Organic Herbal Relaxation & Sleep Blend',
    slug: 'herbal-relaxation-sleep-blend',
    category: 'herbal_remedies',
    description: 'Synergistic herbal infusion combining Passionflower, Ashwagandha KSM-66, Chamomile extract, and Lemon Balm to soothe the mind and support circadian calm.',
    pricePence: 1600,
    stockQuantity: 95,
    ingredients: 'Organic Ashwagandha KSM-66, Organic Passionflower Extract (Passiflora incarnata), Organic Lemon Balm, Organic Chamomile Flower Powder.',
    usageInstructions: 'Take 2 capsules 45 minutes before bedtime with warm water.',
    warnings: 'May cause drowsiness. Do not drive or operate machinery after consumption.',
    productAdviceLink: 'https://lifecome.co.uk/advice/natural-sleep-hygiene',
    imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=500&auto=format&fit=crop&q=80',
    isPrescription: false,
    isActive: true,
  },
  {
    sku: 'SUP-OMG3-1000',
    name: 'Clean Marine Omega-3 Pure EPA/DHA',
    slug: 'clean-marine-omega-3',
    category: 'vitamins_supplements',
    description: 'Molecularly distilled pure marine fish oil with high concentrations of EPA (400mg) and DHA (300mg) per softgel. Supports heart, brain, and joint function.',
    pricePence: 2200,
    stockQuantity: 120,
    ingredients: 'Purified Wild Deep-Sea Fish Oil (Anchovy, Sardine), Natural Mixed Tocopherols (Vitamin E), Softgel Capsule (Gelatin, Glycerol, Purified Water).',
    usageInstructions: 'Take 1 to 2 softgels daily with meals.',
    warnings: 'Allergen Information: Contains Fish. Free from artificial colours, gluten, and heavy metals.',
    productAdviceLink: 'https://lifecome.co.uk/advice/omega-3-benefits',
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=80',
    isPrescription: false,
    isActive: true,
  },
  {
    sku: 'HRB-TEA-CHAM',
    name: 'Soothing Organic Chamomile & Lavender Infusion',
    slug: 'chamomile-lavender-tea',
    category: 'herbal_remedies',
    description: 'Hand-blended whole flower herbal tea bags. Naturally caffeine-free with gentle floral notes that relieve tension and promote digestive ease.',
    pricePence: 850,
    stockQuantity: 180,
    ingredients: '100% Organic Chamomile Flowers (Matricaria chamomilla), Organic French Lavender Blossoms (Lavandula angustifolia).',
    usageInstructions: 'Infuse 1 tea pyramid bag in freshly boiled water for 5-7 minutes. Enjoy any time of day.',
    warnings: 'Contains only natural herbs. Safe for everyday enjoyment.',
    productAdviceLink: 'https://lifecome.co.uk/advice/herbal-tea-rituals',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    isPrescription: false,
    isActive: true,
  },
];

@Injectable()
export class ShopService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly patients: PatientService,
  ) {}

  async listProducts(query: ListProductsQueryDto) {
    await this.ensureSeedData();

    const conditions = [eq(shopProducts.isActive, true), eq(shopProducts.isPrescription, false)];

    if (query.category) {
      conditions.push(eq(shopProducts.category, query.category));
    }
    if (query.search) {
      conditions.push(ilike(shopProducts.name, `%${query.search}%`));
    }

    const items = await this.db
      .select()
      .from(shopProducts)
      .where(and(...conditions))
      .orderBy(shopProducts.name);

    return items;
  }

  async getProductById(id: string) {
    await this.ensureSeedData();
    const [product] = await this.db.select().from(shopProducts).where(eq(shopProducts.id, id));
    if (!product || !product.isActive || product.isPrescription) {
      throw new NotFoundAppException('Product');
    }
    return product;
  }

  listCategories() {
    return [
      { id: 'vitamins_supplements', name: 'Vitamins & Supplements', description: 'Essential micronutrients, minerals, and targeted vitamin complexes' },
      { id: 'herbal_remedies', name: 'Herbal Remedies', description: 'Traditional botanicals, teas, and plant-based adaptogens' },
      { id: 'sleep_relaxation', name: 'Sleep & Relaxation', description: 'Calming formulations to support restorative sleep' },
      { id: 'everyday_nutrition', name: 'Everyday Nutrition', description: 'Everyday wellness essentials, fibre, and digestive care' },
    ];
  }

  // --- Persistent Basket ---

  async getOrCreateBasket(patientId: string) {
    const [existing] = await this.db.select().from(shopBaskets).where(eq(shopBaskets.patientId, patientId));
    if (existing) return existing;

    const [created] = await this.db.insert(shopBaskets).values({ patientId }).returning();
    return created;
  }

  async getBasket(accountId: string) {
    const patient = await this.patients.requireProfile(accountId);
    const basket = await this.getOrCreateBasket(patient.id);

    const items = await this.db
      .select({
        id: shopBasketItems.id,
        productId: shopProducts.id,
        name: shopProducts.name,
        sku: shopProducts.sku,
        pricePence: shopProducts.pricePence,
        imageUrl: shopProducts.imageUrl,
        stockQuantity: shopProducts.stockQuantity,
        quantity: shopBasketItems.quantity,
      })
      .from(shopBasketItems)
      .innerJoin(shopProducts, eq(shopBasketItems.productId, shopProducts.id))
      .where(eq(shopBasketItems.basketId, basket.id));

    const subtotalPence = items.reduce((sum, item) => sum + item.pricePence * item.quantity, 0);
    // Free delivery on orders over £40 (4000p), otherwise £3.95 (395p)
    const deliveryPence = subtotalPence === 0 || subtotalPence >= 4000 ? 0 : 395;
    const totalPence = subtotalPence + deliveryPence;

    return {
      basketId: basket.id,
      items,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
      subtotalPence,
      subtotalFormatted: `£${(subtotalPence / 100).toFixed(2)}`,
      deliveryPence,
      deliveryFormatted: deliveryPence === 0 ? 'Free' : `£${(deliveryPence / 100).toFixed(2)}`,
      totalPence,
      totalFormatted: `£${(totalPence / 100).toFixed(2)}`,
      currency: 'GBP',
    };
  }

  async addItemToBasket(accountId: string, input: AddBasketItemDto) {
    const patient = await this.patients.requireProfile(accountId);
    const basket = await this.getOrCreateBasket(patient.id);
    const product = await this.getProductById(input.productId);

    const [existingItem] = await this.db
      .select()
      .from(shopBasketItems)
      .where(and(eq(shopBasketItems.basketId, basket.id), eq(shopBasketItems.productId, product.id)));

    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      await this.db
        .update(shopBasketItems)
        .set({ quantity: newQuantity, updatedAt: new Date() })
        .where(eq(shopBasketItems.id, existingItem.id));
    } else {
      await this.db.insert(shopBasketItems).values({
        basketId: basket.id,
        productId: product.id,
        quantity: input.quantity,
      });
    }

    return this.getBasket(accountId);
  }

  async updateItemQuantity(accountId: string, productId: string, quantity: number) {
    const patient = await this.patients.requireProfile(accountId);
    const basket = await this.getOrCreateBasket(patient.id);

    if (quantity <= 0) {
      return this.removeItemFromBasket(accountId, productId);
    }

    await this.db
      .update(shopBasketItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(shopBasketItems.basketId, basket.id), eq(shopBasketItems.productId, productId)));

    return this.getBasket(accountId);
  }

  async removeItemFromBasket(accountId: string, productId: string) {
    const patient = await this.patients.requireProfile(accountId);
    const basket = await this.getOrCreateBasket(patient.id);

    await this.db
      .delete(shopBasketItems)
      .where(and(eq(shopBasketItems.basketId, basket.id), eq(shopBasketItems.productId, productId)));

    return this.getBasket(accountId);
  }

  async clearBasket(accountId: string) {
    const patient = await this.patients.requireProfile(accountId);
    const basket = await this.getOrCreateBasket(patient.id);

    await this.db.delete(shopBasketItems).where(eq(shopBasketItems.basketId, basket.id));
    return this.getBasket(accountId);
  }

  // --- Orders & Checkout ---

  async checkout(accountId: string, input: CheckoutOrderDto) {
    const patient = await this.patients.requireProfile(accountId);
    const basket = await this.getBasket(accountId);

    if (basket.items.length === 0) {
      throw new AppException('BASKET_EMPTY', 'Your basket is empty. Add products before checking out.', HttpStatus.BAD_REQUEST);
    }

    const orderNumber = `ORD-WB-${nanoidOrder()}`;

    const [order] = await this.db
      .insert(shopOrders)
      .values({
        orderNumber,
        patientId: patient.id,
        subtotalPence: basket.subtotalPence,
        deliveryPence: basket.deliveryPence,
        totalPence: basket.totalPence,
        currency: 'GBP',
        status: 'processing',
        paymentStatus: 'paid',
        paymentReference: input.paymentReference ?? `PAY-WB-${Date.now().toString(36).toUpperCase()}`,
        shippingAddress: input.shippingAddress,
      })
      .returning();

    // Insert order items
    for (const item of basket.items) {
      await this.db.insert(shopOrderItems).values({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPricePence: item.pricePence,
        totalPricePence: item.pricePence * item.quantity,
      });
    }

    // Clear basket
    await this.clearBasket(accountId);

    return {
      order,
      items: basket.items,
      message: 'Thank you for your order! Your items will be dispatched via Royal Mail Tracked 48.',
    };
  }

  async listOrders(accountId: string) {
    const patient = await this.patients.getByUserAccountId(accountId);
    if (!patient) return [];
    return this.db
      .select()
      .from(shopOrders)
      .where(eq(shopOrders.patientId, patient.id))
      .orderBy(desc(shopOrders.createdAt));
  }

  async getOrderById(accountId: string, id: string) {
    const patient = await this.patients.requireProfile(accountId);
    const [order] = await this.db
      .select()
      .from(shopOrders)
      .where(and(eq(shopOrders.id, id), eq(shopOrders.patientId, patient.id)));
    if (!order) throw new NotFoundAppException('Order');

    const items = await this.db
      .select()
      .from(shopOrderItems)
      .where(eq(shopOrderItems.orderId, order.id));

    return {
      ...order,
      items,
    };
  }

  private async ensureSeedData() {
    const count = await this.db.select().from(shopProducts).limit(1);
    if (count.length === 0) {
      await this.db.insert(shopProducts).values(DEFAULT_PRODUCTS);
    }
  }
}
