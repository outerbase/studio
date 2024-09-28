import WebsiteLayout from "@/components/website-layout";
import { WEBSITE_NAME } from "@/const";

export default function PrivacyPage() {
  return (
    <WebsiteLayout>
      <div className="container mx-auto my-12 flex flex-col gap-4">
        <h1 className="font-bold text-3xl">PRIVACT NOTICE</h1>
        <p>Effective Date: 2024-06-23</p>
        <p>
          {`
          Welcome to ${WEBSITE_NAME} ("we," "our," or "us"). We are committed to protecting your privacy and ensuring
          that your personal information is handled in a safe and responsible manner. This Privacy Policy explains how we
          collect, use, and protect your information when you use our tool.
        `}
        </p>
        <h2 className="font-bold text-lg">1. Information We Collect</h2>
        <p>
          You can authenticate through social media platforms to access
          additional features. We collect the following information from your
          social media profile:
        </p>
        <ul className="list-disc ml-6">
          <li>Name</li>
          <li>Email address</li>
          <li>Profile picture</li>
          <li>Social media ID</li>
        </ul>
        <p>
          We collect data on how you interact with the Tool to understand user
          behavior and improve our services
        </p>
        <ul className="list-disc ml-6">
          <li>Features you use</li>
          <li>Actions you take within the Tool</li>
          <li>Time spent on the Tool</li>
          <li>Error and crash reports</li>
        </ul>
        <h2 className="font-bold text-lg">2. How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul className="list-disc ml-6">
          <li>To authenticate your access to the Tool</li>
          <li>To personalize your experience</li>
          <li>
            To analyze usage patterns and improve the functionality and
            performance of the Tool
          </li>
        </ul>
        <h2 className="font-bold text-lg">3. Data Sharing and Disclosure</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information
          to outside parties except as described below:
        </p>
        <h3 className="font-bold text-md">3.1 Service Providers</h3>
        <p>
          We may share your information with third-party service providers who
          assist us in operating the Tool and analyzing usage data. These
          service providers are bound by contractual obligations to keep your
          information confidential and use it only for the purposes for which we
          disclose it to them.
        </p>
        <h3 className="font-bold text-md">3.2 Legal Requirements</h3>
        <p>
          We may disclose your information if required to do so by law or in
          response to valid requests by public authorities.
        </p>
        <h2 className="font-bold text-lg">4. Data Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of
          your personal information. These measures include encryption, access
          controls, and regular security assessments.
        </p>
        <h2 className="font-bold text-lg">5. Data Retention</h2>
        <p>
          We retain your personal information for as long as necessary to
          fulfill the purposes outlined in this Privacy Policy unless a longer
          retention period is required or permitted by law.
        </p>
        <h2 className="font-bold text-lg">6. Your Rights</h2>
        <p>
          You have the following rights regarding your personal information:
        </p>

        <ul className="list-disc ml-6">
          <li>Access: You can request access to your personal information.</li>
          <li>Access: You can request access to your personal information</li>
          <li>
            Deletion: You can request the deletion of your personal information.
          </li>
          <li>
            Objection: You can object to the processing of your personal
            information,
          </li>
        </ul>

        <h2 className="font-bold text-lg">7. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on our website.
          You are advised to review this Privacy Policy periodically for any
          changes.
        </p>

        <p>
          By using the Tool, you acknowledge that you have read and understood
          this Privacy Policy and agree to its terms.
        </p>
      </div>
    </WebsiteLayout>
  );
}
