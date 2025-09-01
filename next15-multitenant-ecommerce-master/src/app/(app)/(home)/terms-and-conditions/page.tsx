import React from "react";

export const metadata = {
  title: "Terms & Conditions - Obazaar",
  description: "Terms and conditions for using Obazaar",
};

export default function TermsPage() {
  return (
    <main
      className="relative min-h-[60vh] bg-cover bg-center py-24"
      style={{ backgroundImage: `url('/about-bg.png')` }}
    >
  {/* light white overlay so background appears lighter while text stays readable */}
  <div className="absolute inset-0 bg-white/80" aria-hidden />

      <div className="relative max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-semibold mb-4">Terms & Conditions</h1>
        <section className="prose max-w-none text-justify text-black">
        <h2>1. Agreement</h2>
        <p>By registering, listing, or selling on Obazaar, you agree to follow these Terms covering listings, orders, payments, returns, marketing, and communication.</p>
        <br/>
        <h2>2. Vendor Eligibility</h2>
        <p>Vendors must:</p>
        <ul>
          <li>- Be 18+ and legally able to contract.</li>
          <li>- Operate a valid business/home-based/freelance in Oman.</li>
          <li>- Provide ID, license (if required), and proof of product ownership.</li>
          <li>- Have an Omani bank account.</li>
          <li>- Follow Omani laws.</li>
        </ul>
        <p>Obazaar may suspend or reject vendors not meeting requirements.</p>
        <br/>
        <h2>3. Account Rules</h2>
        <ul>
          <li>- Keep account secure; you’re responsible for all actions under it.</li>
          <li>- Provide a valid email/phone.</li>
          <li>- Accounts can’t be shared or transferred without approval.</li>
        </ul>
        <br/>
        <h2>4. Product Listings</h2>
        <ul>
          <li>- Accurate titles, descriptions, prices, stock, and clear images.</li>
          <li>- Mention size, weight, instructions, warranty/return info.</li>
          <li>- No illegal, fake, offensive, or adult items.</li>
          <li>- Obazaar may remove violating listings.</li>
        </ul>
        <br/>
        <h2>5. Inventory &amp; Fulfillment</h2>
        <ul>
          <li>- Keep stock/pricing accurate and fair (incl. VAT).</li>
          <li>- Ship within 3 days unless stated otherwise.</li>
          <li>- Package safely; update out-of-stock immediately.</li>
          <li>- Failure to fulfill can lead to suspension.</li>
        </ul>
        <br/>
        <h2>6. Plans &amp; Commissions</h2>
        <p><strong>Free Plan:</strong> unlimited listings, basic marketing, commission per sale (15% &lt;10 OMR, 10% 10–30 OMR, 5% &gt;30 OMR).</p>
        <p><strong>Paid Plan (35 OMR/month):</strong> added visibility, marketing boosts, seminars, consultation, resources. Auto-renews unless canceled.</p>
        <br/>
        <h2>7. Orders &amp; Customer Service</h2>
        <ul>
          <li>- Process orders promptly, mark fulfilled, give tracking.</li>
          <li>- Respond to customers within 24 hrs.</li>
          <li>- Excessive cancellations or complaints may lead to penalties.</li>
        </ul>
        <br/>
        <h2>8. Returns &amp; Refunds</h2>
        <ul>
          <li>- Accept returns (within 7 days unless stated otherwise) for wrong, damaged, undelivered, or misdescribed items.</li>
          <li>- Issue refunds and handle disputes professionally.</li>
          <li>- Cover return shipping if fault is yours.</li>
        </ul>
        <br/>
        <h2>9. Payments</h2>
        <ul>
          <li>- Obazaar deducts fees/commission before payout.</li>
          <li>- Payouts weekly/bi-weekly (min. 5 OMR).</li>
          <li>- Vendors are responsible for correct bank info.</li>
        </ul>
        <br/>
        <h2>10. Marketing</h2>
        <ul>
          <li>- Obazaar may promote your products.</li>
          <li>- Vendors need written approval to use Obazaar’s name/logo.</li>
        </ul>
        <br/>
        <h2>11. Intellectual Property</h2>
        <ul>
          <li>- You grant Obazaar rights to use your uploaded content for promotion.</li>
          <li>- You confirm ownership/permission for all content used.</li>
        </ul>
        <br/>
        <h2>12. Code of Conduct</h2>
        <ul>
          <li>- Be respectful to customers/Obazaar staff.</li>
          <li>- No fake orders, reviews, or manipulative practices.</li>
        </ul>
        <br/>
        <h2>13. Termination</h2>
        <ul>
          <li>- Accounts may be suspended/terminated for fraud, policy breaches, complaints, or unethical behavior.</li>
          <li>- Vendors can request account deletion if dues/orders are cleared.</li>
        </ul>
        <br/>
        <h2>14. Updates to Terms</h2>
        <p>- Terms may change; vendors will be notified. Continued use = acceptance.</p>
        <br/>
        <h2>15. Legal Jurisdiction</h2>
        <p>- Governed by Omani law; disputes handled in Omani courts.</p>

        <p className="mt-8">📧 Questions? Contact: <a href="mailto:info@obazaar.om">info@obazaar.om</a></p>
        </section>
      </div>
    </main>
  );
}
