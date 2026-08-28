"use strict";
import React from "react";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Header Section */}
        <div className="border-b pb-6 mb-8 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
            Our Story
          </span>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mt-3 uppercase">
            About Online Bar
          </h1>
          <p className="text-slate-600 mt-4 leading-relaxed text-base">
            We believe that premium beverages are more than just drinks—they define the spirit of celebration. Online Bar was founded with a single, clear objective: to bring high-quality, authentic, and chilled wine, spirits, and snacks directly to your doorstep.
          </p>
        </div>

        {/* Quick Brand Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground">100%</div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Genuine</div>
          </div>
          <div className="border-x border-slate-200">
            <div className="text-xl sm:text-2xl font-black text-foreground">Ksh</div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Local Prices</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground">24/7</div>
            <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-medium mt-1">Fast Dispatch</div>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-8 text-sm text-slate-600 leading-relaxed text-left">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">The Cellar Standard</h2>
            <p>
              Every bottle and snack hosted in our inventory undergoes a rigorous curation process. We carefully select products that strike the perfect balance between quality and taste. Whether you are looking for rare Vintages, premium Whiskeys, or reliable late-night snacks, we have your celebration needs completely covered.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 uppercase tracking-tight">Our Core Values</h2>
            <p className="mb-3">
              We run our e-commerce operations based on three non-negotiable principles:
            </p>
            <ul className="list-none space-y-3 pl-1">
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">✔</span>
                <span><strong>No Compromise on Authenticity:</strong> What you see on our menu is precisely what drops at your doorstep. No fakes, no unexpected substitutions.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">✔</span>
                <span><strong>Transparent Operations:</strong> From straightforward pricing in Kenyan Shillings to clear stock counts, we eliminate the guesswork from online shopping.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">✔</span>
                <span><strong>Patron First:</strong> Optimized specifically for quick local mobile transactions and rapid runner dispatch lines to respect your time.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 - Final Sale Reminder for Context */}
          <section className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">Responsible Service</h3>
            <p className="text-xs text-slate-500 leading-normal italic">
              To keep our inventory moving quickly and sustain competitive, honest local pricing structures, Online Bar strictly operates on a final sale model. We encourage our patrons to verify their selections accurately before completing checkout sequences. Must be 18+.
            </p>
          </section>

        </div>

        {/* Footer Section */}
        <div className="border-t mt-10 pt-6 text-center">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            © {new Date().getFullYear()} Online Bar™. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
