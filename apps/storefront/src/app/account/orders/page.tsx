"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { getOrders, type Order } from "@/lib/auth";
import { formatPrice } from "@/lib/medusa";

export default function OrdersPage() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getOrders(token)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-[10px] tracking-[0.3em] uppercase font-sans font-medium text-charcoal mb-6">
        Order History
      </h2>

      {loading ? (
        <p className="text-sm text-muted font-sans">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center border border-stone">
          <p className="text-sm text-muted mb-1 font-sans">No orders yet</p>
          <p className="text-xs text-muted/60 font-sans">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: "easeOut",
              }}
              className="border border-stone p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-sans font-medium text-charcoal">
                    Order #{order.display_id}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5 font-sans">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-sans font-medium text-charcoal">
                    {formatPrice(order.total, order.currency_code)}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] tracking-wider uppercase bg-stone text-muted font-sans">
                    {order.status}
                  </span>
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="border-t border-stone pt-4">
                  <ul className="flex flex-col gap-2">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-xs text-muted font-sans"
                      >
                        <span>
                          {item.title} x {item.quantity}
                        </span>
                        <span>
                          {formatPrice(
                            item.unit_price * item.quantity,
                            order.currency_code
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
