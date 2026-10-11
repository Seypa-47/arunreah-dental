import { check, index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { timestamps } from './common';

/** Reusable image framing metadata, scoped to a CMS content owner and image slot. */
export const imagePresentations = sqliteTable('image_presentations', {
  id: text('id').primaryKey(),
  ownerType: text('owner_type').notNull(),
  ownerId: text('owner_id').notNull(),
  slot: text('slot').notNull().default('PRIMARY'),
  positionX: integer('position_x').notNull().default(50),
  positionY: integer('position_y').notNull().default(50),
  zoom: real('zoom').notNull().default(1),
  ...timestamps(),
}, (table) => [
  uniqueIndex('image_presentations_owner_slot_unique').on(table.ownerType, table.ownerId, table.slot),
  index('image_presentations_owner_idx').on(table.ownerType, table.ownerId),
  check('image_presentations_position_x_check', sql`${table.positionX} >= 0 and ${table.positionX} <= 100`),
  check('image_presentations_position_y_check', sql`${table.positionY} >= 0 and ${table.positionY} <= 100`),
  check('image_presentations_zoom_check', sql`${table.zoom} >= 1 and ${table.zoom} <= 2`),
]);
