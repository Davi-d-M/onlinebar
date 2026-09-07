"use strict";
import React from "react";

export default function ReturnsAndExchangesPage() {
  const lastUpdated = "August 2026";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Header Section */}
        <div className="border-b pb-6 mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Returns & Exchanges Policy</h1>
          <p className="text-sm text-slate-400 mt-2">Last Updated: {lastUpdated}</p>
          <p className="text-slate-600 mt-4 leading-relaxed font-medium">
            Thank you for shopping at <strong>Online Bar</strong>. To maintain our commitment to offering highly competitive local pricing, rapid dispatch turnarounds, and authentic beverages, we operate under a strict policy regarding order modifications.
          </p>
        </div>

        {/* Core Policy Highlight */}
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl mb-8 text-left">
          <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider mb-2">⚠️ Final Sale Agreement</h2>
          <p className="text-rose-900 font-bold bg-white border border-rose-100 p-4 rounded-lg italic text-base">
            &quot;All transactions processed on Online Bar are absolute and final. We do not offer cash refunds, store credit refunds, or exchanges under any circumstances once an order has been completed and dispatched. Goods once sold cannot be returned.&quot;
          </p>
          <p className="text-rose-800 text-xs mt-3 leading-relaxed font-medium">
            By confirming your M-Pesa or alternative payment checkout sequence, you formally acknowledge and agree that you have checked your selection and quantities thoroughly. Must be 18+.
          </p>
        </div>

        {/* Policy Body Layout */}
        <div className="space-y-8 text-sm text-slate-600 leading-relaxed text-left">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">1. Why We Enforce a No-Return Policy</h2>
            <p className="font-medium text-slate-500">
              Beverage logistics demand immense care to ensure absolute quality and authenticity. By enforcing a strict final-sale policy, we guarantee that every single bottle arriving at a patron&apos;s doorstep is 100% genuine and untouched. Additionally, this allows us to avoid the operational overhead of reverse shipping, passing those savings on to you in the form of lower local prices.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">2. How to Ensure the Perfect Choice</h2>
            <p className="mb-3 font-medium text-slate-500">
              We highly recommend taking the following preventative steps before finalizing your cart checkout:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-medium text-slate-500">
              <li>Verify the brand and volume of your selection.</li>
              <li>Check the quantities in your bag.</li>
              <li>Review the specific product description panels for flavor profiles and notes.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">3. Exceptions for Order Errors</h2>
            <p className="font-medium text-slate-500">
              We stand firmly behind our fulfillment workflows. The absolute only exception to this policy is if an error was explicitly made by the Online Bar dispatch center.
            </p>
            <p className="mt-2 font-medium text-slate-500">
              If we inadvertently dispatch the completely wrong beverage variant compared to what is explicitly listed on your digital invoice.ce receipt, please flag it with our team within <strong>24 hours</strong> of delivery. The product must remain completely sealed, unused, and in its original packaging to qualify for a corrective replacement.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">4. Order Cancellation</h2>
            <p className="font-medium text-slate-500">
              Our automated backend hands over dispatch data to delivery riders almost immediately after payment verification. Because of this high-speed setup, orders cannot be cancelled, adjusted, or reassigned once payment confirmation is finalized.
            </p>
          </section>

        </div>

        {/* Footer Section */}
        <div className="border-t mt-10 pt-6 text-center">
          <p className="text-xs font-black text-slate-400 tracking-wider uppercase">
            © {new Date().getFullYear()} Online Bar™. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
