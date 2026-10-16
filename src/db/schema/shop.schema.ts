import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { patients } from './patient.schema';

/** Wellbeing Shop products catalogue. Food supplements and herbal remedies; NOT prescription medicines! */
export const shopProducts = pgTable('shop_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // 'vitamins_supplements' | 'herbal_remedies' | 'sleep_relaxation' | 'everyday_nutrition'
  description: text('description').notNull(),
  pricePence: integer('price_pence').notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(100),
  ingredients: text('ingredients'),
  usageInstructions: text('usage_instructions'),
  warnings: text('warnings'),
  productAdviceLink: text('product_advice_link'),
  imageUrl: text('image_url'),
  isPrescription: boolean('is_prescription').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Persistent shopping basket per patient. Survives navigation between service hubs. */
export const shopBaskets = pgTable('shop_baskets', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id')
    .notNull()
    .unique()
    .references(() => patients.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const shopBasketItems = pgTable('shop_basket_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  basketId: uuid('basket_id')
    .notNull()
    .references(() => shopBaskets.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => shopProducts.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export interface ShippingAddress {
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
}

/** Retail orders from the Wellbeing Shop ("My shop orders"). */
export const shopOrders = pgTable('shop_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  patientId: uuid('patient_id')
    .notNull()
    .references(() => patients.id, { onDelete: 'cascade' }),
  subtotalPence: integer('subtotal_pence').notNull(),
  deliveryPence: integer('delivery_pence').notNull().default(0),
  totalPence: integer('total_pence').notNull(),
  currency: text('currency').notNull().default('GBP'),
  status: text('status').notNull().default('pending'), // 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  paymentStatus: text('payment_status').notNull().default('paid'), // 'pending' | 'paid' | 'failed'
  paymentReference: text('payment_reference'),
  shippingAddress: jsonb('shipping_address').$type<ShippingAddress>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const shopOrderItems = pgTable('shop_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => shopOrders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => shopProducts.id, { onDelete: 'restrict' }),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPricePence: integer('unit_price_pence').notNull(),
  totalPricePence: integer('total_price_pence').notNull(),
});
