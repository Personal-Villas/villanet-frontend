import React from "react";
import { ArrowLeft } from "lucide-react";

const PrivacyContentSection: React.FC = () => {
  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We may collect:
          </p>
          
          <p className="text-base text-foreground font-medium leading-[1.8] mt-6">
            a) Information you provide
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-3">
            <li>• name</li>
            <li>• email address</li>
            <li>• phone number</li>
            <li>• travel dates</li>
            <li>• villa inquiry details</li>
            <li>• messaging interactions</li>
            <li>• agent association (if applicable)</li>
          </ul>

          <p className="text-base text-foreground font-medium leading-[1.8] mt-6">
            b) Technical data
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-3">
            <li>• browser type</li>
            <li>• device type</li>
            <li>• IP address</li>
            <li>• cookies</li>
            <li>• usage analytics</li>
          </ul>

          <p className="text-base text-foreground font-medium leading-[1.8] mt-6">
            c) Booking-related data
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6 mt-3">
            <li>• villa selected</li>
            <li>• reservation details</li>
            <li>• payment preferences (not full credit card numbers)</li>
          </ul>
        </>
      )
    },
    {
      title: "2. How We Use Information",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We use your information to:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6">
            <li>• connect you with property managers</li>
            <li>• communicate booking-related updates</li>
            <li>• enable concierge and advisory services</li>
            <li>• personalize recommendations</li>
            <li>• analyze platform usage</li>
            <li>• improve service quality</li>
            <li>• maintain security and fraud monitoring</li>
          </ul>
        </>
      )
    },
    {
      title: "3. Sharing of Information",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We may share necessary data with:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6">
            <li>• property managers (for booking purposes)</li>
            <li>• travel advisors (if part of the inquiry process)</li>
            <li>• payment processors</li>
            <li>• contracted service providers (e.g. IT infrastructure)</li>
          </ul>
          <p className="text-base text-foreground font-medium leading-[1.8] mt-6">
            We do not sell your data to third parties for advertising or unrelated marketing.
          </p>
        </>
      )
    },
    {
      title: "4. Data Security",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We apply industry-standard encryption, access controls, and organizational procedures to protect data.
          </p>
          <p className="text-base text-muted-foreground leading-[1.8]">
            No system is 100% secure, but we actively work to safeguard information.
          </p>
        </>
      )
    },
    {
      title: "5. Cookies & Tracking",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We use cookies for:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6">
            <li>• remembering preferences</li>
            <li>• analytics</li>
            <li>• user flow tracking</li>
          </ul>
          <p className="text-base text-muted-foreground leading-[1.8] mt-4">
            You may disable cookies in browser settings, though functionality may be affected.
          </p>
        </>
      )
    },
    {
      title: "6. Data Retention",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We retain user data:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6">
            <li>• for as long as needed to facilitate services</li>
            <li>• for compliance and auditing</li>
            <li>• for historical booking referencing</li>
          </ul>
          <p className="text-base text-muted-foreground leading-[1.8] mt-4">
            Users may request data deletion subject to legal and operational constraints.
          </p>
        </>
      )
    },
    {
      title: "7. EU / GDPR / UK Data Rights",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            If applicable, you have the right to:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6">
            <li>• access your data</li>
            <li>• correct your data</li>
            <li>• request deletion</li>
            <li>• restrict processing</li>
            <li>• portability</li>
            <li>• objection to automated decisioning</li>
          </ul>
          <p className="text-base text-muted-foreground leading-[1.8] mt-4">
            Contact:{" "}
            <a 
              href="mailto:privacy@villanet.com" 
              className="text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              privacy@villanet.com
            </a>
          </p>
        </>
      )
    },
    {
      title: "8. Children's Privacy",
      content: (
        <p className="text-base text-muted-foreground leading-[1.8]">
          Villa Net is not intended for individuals under 18, and we do not knowingly collect data from minors.
        </p>
      )
    },
    {
      title: "9. Data Transfer",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            Data may be stored or processed in:
          </p>
          <ul className="space-y-3 text-base text-muted-foreground leading-[1.8] pl-6">
            <li>• United States</li>
            <li>• Canada</li>
            <li>• EU</li>
            <li>• other jurisdictions where Villa Net operates partners or servers</li>
          </ul>
          <p className="text-base text-muted-foreground leading-[1.8] mt-4">
            We will ensure compliance with international data protection frameworks.
          </p>
        </>
      )
    },
    {
      title: "10. Changes to This Policy",
      content: (
        <>
          <p className="text-base text-muted-foreground leading-[1.8] mb-4">
            We may revise this Privacy Policy periodically.
          </p>
          <p className="text-base text-muted-foreground leading-[1.8]">
            The latest revision date will always be indicated at the top.
          </p>
        </>
      )
    }
  ];

  return (
    <section className="pb-24 px-6">
      <div className="container mx-auto max-w-3xl space-y-12">
        {sections.map((section, index) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {section.title}
            </h2>
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

export default PrivacyContentSection;