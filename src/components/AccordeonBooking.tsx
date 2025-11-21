import { useState } from 'react';

interface AccordionItem {
  title: string;
  description: string;
  content: JSX.Element;
}

export default function AccordionBooking() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionItems: AccordionItem[] = [
    {
      title: "Villa Guidelines",
      description: "Quiet hours, smoking policy, pets, and visitor guidelines.",
      content: (
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>No smoking inside the villa.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>No parties or events without prior written approval.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Maximum occupancy is limited to the confirmed guest list.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>No unregistered overnight guests.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Pets permitted only with prior approval and/or pet fee.</span>
          </li>
        </ul>
      )
    },
    {
      title: "What's Included in Your Stay",
      description: "Daily housekeeping, linens, WiFi, and concierge services.",
      content: (
        <>
          <ul className="space-y-2 text-gray-700 mb-3">
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Daily housekeeping (except Sundays and local holidays)</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Pre-arrival concierge support</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>Premium linens, towels, and basic bathroom amenities</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>High-speed WiFi</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span>On-call villa or property manager support</span>
            </li>
          </ul>
          <p className="text-gray-600 text-xs">*Additional concierge-arranged services available at cost.</p>
        </>
      )
    },
    {
      title: "Rates, Fees & Local Taxes",
      description: "Nightly rates, taxes, and optional service fees.",
      content: (
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Rates quoted in USD unless noted otherwise.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Local taxes and service fees apply and vary by destination.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Staff gratuity is not included. Tipping guidelines provided by villa manager.</span>
          </li>
        </ul>
      )
    },
    {
      title: "Payments, Deposits & Cancellations",
      description: "Reservation structure and travel protection.",
      content: (
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>All bookings are non-refundable. Travel insurance recommended.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Some villas offer flexible cancellation; confirmed by villa manager.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>A signed rental agreement is required.</span>
          </li>
        </ul>
      )
    },
    {
      title: "Guest Registration & Security Deposit",
      description: "ID requirements and damage coverage.",
      content: (
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Lead guest passport/ID required.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Full guest list submitted before arrival.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Credit card authorization hold OR damage waiver ($99–$199 per stay).</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span>Guests responsible for damage beyond normal wear and tear.</span>
          </li>
        </ul>
      )
    }
  ];

  return (
    <section className="py-12 px-6 border-t border-[#E5E5E5] bg-accent/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center">
          <h3 className="text-[24px] font-semibold tracking-[-0.3px] text-gray-900 mb-3">Booking & Stay Details</h3>
          <p className="text-sm text-gray-600 max-w-3xl mx-auto mb-6">
            Everything you need to know for a seamless stay.
          </p>
          <div className="border-t border-[#E8E8E8] max-w-4xl mx-auto mb-8"></div>
        </div>
        <div className="space-y-0 bg-white rounded-lg border border-[#E9E9E9]">
          {accordionItems.map((item, index) => (
            <div 
              key={index} 
              className="border-b border-[#E9E9E9] last:border-b-0"
            >
              <h3 className="flex">
                <button 
                  type="button" 
                  aria-expanded={openIndex === index}
                  onClick={() => toggleAccordion(index)}
                  className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:no-underline px-6 w-full text-left hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-[15px] mb-1">{item.title}</div>
                    <div className="text-xs text-gray-500 font-normal">{item.description}</div>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              </h3>
              <div 
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-4 px-6 pt-2">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes accordion-down {
          from {
            height: 0;
            opacity: 0;
          }
          to {
            height: var(--radix-accordion-content-height);
            opacity: 1;
          }
        }

        @keyframes accordion-up {
          from {
            height: var(--radix-accordion-content-height);
            opacity: 1;
          }
          to {
            height: 0;
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}