import React from "react";
import { ArrowLeft } from "lucide-react";

const TermsContentSection: React.FC = () => {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            These Terms of Service ("Terms") govern your access to and use of the Villa Net website, platform, communications, and related services ("Services"). Villa Net International LLC ("Villa Net," "we," "our," "us") provides a marketplace connecting guests, travel advisors, and independent property managers.
          </p>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            By using Villa Net, you agree to these Terms.
          </p>
        </>
      )
    },
    {
      id: "nature-of-platform",
      title: "2. Nature of the Platform",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            Villa Net is not a property owner and does not operate or manage villas directly. We:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>curate property managers and listings</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>facilitate communication and inquiry</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>provide rating and ranking feedback</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>enable booking workflows</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>release funds to property hosts or administrators when applicable</span>
            </li>
          </ul>
          <p className="text-base text-muted-foreground leading-[1.8] mt-4">
            All villas within the marketplace are operated by independent providers ("Property Partners").
          </p>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            Villa Net is not a party to the rental agreement between guest and property manager.
          </p>
        </>
      )
    },
    {
      id: "relationship-with-managers",
      title: "3. Your Relationship with Property Managers",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            When booking a property:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>You enter into a direct contractual relationship with the property manager or villa owner.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>Their terms, policies, deposits, cancellation rules, and liability frameworks apply.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>Villa Net is not responsible for operational performance of villas.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>We act strictly as a facilitating intermediary.</span>
            </li>
          </ul>
        </>
      )
    },
    {
      id: "use-of-platform",
      title: "4. Use of the Platform",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            In using Villa Net, you agree to:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>provide accurate information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>not engage in fraudulent or abusive behavior</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>communicate respectfully</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>comply with applicable laws</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>not attempt to scrape data or reverse-engineer the platform</span>
            </li>
          </ul>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            We may suspend or restrict access at our discretion.
          </p>
        </>
      )
    },
    {
      id: "villa-net-rank",
      title: "5. Villa Net Rank™",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            Our proprietary ranking system is intended as a service-quality signal, not a guarantee. The scoring is based on:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>experience</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>service history</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>communication reliability</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>infrastructure</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>past guest feedback</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>operational stability</span>
            </li>
          </ul>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            You acknowledge that Villa Net Rank™ is an advisory quality indicator, not a warranty.
          </p>
        </>
      )
    },
    {
      id: "liability",
      title: "6. Liability & Disclaimers",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            Villa Net is not liable for:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>property condition discrepancies</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>misrepresented amenities by property managers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>cancellations, maintenance issues, or disruptions</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>incidents, injury, or theft occurring on-site</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>force majeure events (weather, illness, natural disasters, etc.)</span>
            </li>
          </ul>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            To the maximum extent allowed by law, Villa Net excludes liability for consequential, indirect, or punitive damages.
          </p>
        </>
      )
    },
    {
      id: "payments",
      title: "7. Payments & Fees",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            If payments are processed via Villa Net:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>transaction fees may apply</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>payment processing is conducted via secure third-party providers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-foreground mt-2">•</span>
              <span>refunds follow the policies of the specific property manager</span>
            </li>
          </ul>
          <p className="text-base text-muted-foreground leading-[1.8] mt-4">
            Villa Net does not hold final discretion on refunds unless acting explicitly as merchant of record.
          </p>
        </>
      )
    },
    {
      id: "modifications",
      title: "8. Modifications",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            We may update these Terms at any time. If material changes occur, revision dates will be updated and notices may be posted.
          </p>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            Continued use of the platform constitutes acceptance of new Terms.
          </p>
        </>
      )
    },
    {
      id: "governing-law",
      title: "9. Governing Law",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8]">
            These Terms are governed by Delaware, USA jurisdiction.
          </p>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-4">
            Disputes will be resolved through binding arbitration unless prohibited by law.
          </p>
        </>
      )
    }
  ];

  return (
    <section className="pb-20 px-6">
      <div className="container mx-auto max-w-3xl space-y-12">
        {sections.map((section, index) => (
          <div key={section.id} className="space-y-4">
            <div id={section.id}>
              <h2 className="text-2xl font-bold text-foreground">
                {section.title}
              </h2>
            </div>
            {section.content}
            {index < sections.length - 1 && (
              <div className="border-t border-border pt-8"></div>
            )}
          </div>
        ))}

        <div className="pt-8">
          <a 
            href="/trust-framework"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trust Framework
          </a>
        </div>
      </div>
    </section>
  );
};

export default TermsContentSection;