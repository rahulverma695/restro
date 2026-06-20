"use client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface BillProps {
  order: {
    orderNumber: string;
    type: string;
    createdAt: string | Date;
    subtotal: number;
    taxAmount: number;
    discount: number;
    total: number;
    table?: { number: string } | null;
    payments: { method: string; amount: number }[];
    items: { quantity: number; price: number; menuItem: { name: string } }[];
  };
  restaurant: {
    name: string;
    address?: string | null;
    phone?: string | null;
    gstin?: string | null;
  };
}

export function BillPrint({ order, restaurant }: BillProps) {
  function print() {
    window.print();
  }

  const dividerStyle = { borderTop: "1px dashed #999", margin: "8px 0" };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #bill-content, #bill-content * { visibility: visible; }
          #bill-content { position: fixed; top: 0; left: 0; width: 80mm; background: #fff !important; color: #000 !important; }
          #print-btn { display: none !important; }
        }
      `}</style>

      <div id="bill-content" className="font-mono text-xs w-72 mx-auto p-4" style={{ background: "#fff", color: "#000" }}>
        {/* Header */}
        <div className="text-center mb-3">
          <p className="font-bold text-base">{restaurant.name}</p>
          {restaurant.address && <p style={{ color: "#555" }}>{restaurant.address}</p>}
          {restaurant.phone && <p style={{ color: "#555" }}>Ph: {restaurant.phone}</p>}
          {restaurant.gstin && <p style={{ color: "#555" }}>GSTIN: {restaurant.gstin}</p>}
        </div>

        <div style={dividerStyle} />

        {/* Order info */}
        <div className="flex justify-between mb-1">
          <span>Bill No:</span><span className="font-semibold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Date:</span><span>{format(new Date(order.createdAt), "dd/MM/yy hh:mm a")}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Type:</span><span>{order.type.replace("_", " ")}</span>
        </div>
        {order.table && (
          <div className="flex justify-between mb-1">
            <span>Table:</span><span>{order.table.number}</span>
          </div>
        )}

        <div style={dividerStyle} />

        {/* Items */}
        <div className="mb-2">
          <div className="flex justify-between font-semibold mb-1">
            <span>Item</span><span>Amt</span>
          </div>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between mb-0.5">
              <span className="flex-1 truncate pr-2">{item.quantity}x {item.menuItem.name}</span>
              <span className="flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div style={dividerStyle} />

        {/* Totals */}
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span><span>{formatCurrency(order.taxAmount)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between" style={{ color: "#16a34a" }}>
              <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 mt-1" style={{ borderTop: "1px dashed #999" }}>
            <span>TOTAL</span><span>{formatCurrency(order.total)}</span>
          </div>
          <div className="flex justify-between" style={{ color: "#555" }}>
            <span>Payment</span><span>{order.payments[0]?.method || "—"}</span>
          </div>
        </div>

        <div style={dividerStyle} />

        <p className="text-center" style={{ color: "#555" }}>Thank you for dining with us!</p>
        <p className="text-center text-xs mt-1" style={{ color: "#888" }}>Powered by RestroPOS</p>
      </div>

      <button
        id="print-btn"
        onClick={print}
        className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium"
      >
        🖨 Print Bill
      </button>
    </>
  );
}
