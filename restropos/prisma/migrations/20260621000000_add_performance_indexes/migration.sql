-- Performance indexes migration
-- Generated from: prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script
-- This migration adds indexes and unique constraints to frequently queried columns.
-- It is additive only — no existing indexes, constraints, or field definitions are changed.

-- Order: time-series listing per restaurant, and status filtering
CREATE INDEX "Order_restaurantId_createdAt_idx" ON "Order"("restaurantId", "createdAt" DESC);
CREATE INDEX "Order_restaurantId_status_idx" ON "Order"("restaurantId", "status");

-- MenuItem: menu page queries filter by restaurant + category + availability
CREATE INDEX "MenuItem_restaurantId_categoryId_isAvailable_idx" ON "MenuItem"("restaurantId", "categoryId", "isAvailable");

-- Customer: lookup by phone within a restaurant (also enforces uniqueness)
CREATE INDEX "Customer_restaurantId_phone_idx" ON "Customer"("restaurantId", "phone");
CREATE UNIQUE INDEX "Customer_restaurantId_phone_key" ON "Customer"("restaurantId", "phone");

-- OrderItem: FK join from Order to its items
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- StaffProfile: active staff listing per restaurant
CREATE INDEX "StaffProfile_restaurantId_isActive_idx" ON "StaffProfile"("restaurantId", "isActive");

-- Reservation: upcoming reservations per restaurant ordered by dateTime
CREATE INDEX "Reservation_restaurantId_dateTime_idx" ON "Reservation"("restaurantId", "dateTime");

-- InventoryItem: all inventory for a restaurant
CREATE INDEX "InventoryItem_restaurantId_idx" ON "InventoryItem"("restaurantId");

-- Offer: active offers per restaurant
CREATE INDEX "Offer_restaurantId_isActive_idx" ON "Offer"("restaurantId", "isActive");

-- Category: enforce unique category names within a restaurant
CREATE UNIQUE INDEX "Category_restaurantId_name_key" ON "Category"("restaurantId", "name");
