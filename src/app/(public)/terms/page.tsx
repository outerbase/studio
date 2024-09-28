import WebsiteLayout from "@/components/website-layout";
import { WEBSITE_NAME } from "@/const";

export default function TermPage() {
  return (
    <WebsiteLayout>
      <div className="container mx-auto my-12 flex flex-col gap-4">
        <h1 className="font-bold text-3xl">Terms and Conditions</h1>

        <p>Effective Date: 2024-06-23</p>

        <p>{`
        Welcome to ${WEBSITE_NAME} ("we," "our," or "us"). 
        By accessing or using our tool, you agree to be bound by these Terms and Conditions ("Terms").
        If you do not agree to these Terms, please do not use the Tool.
      `}</p>

        <h2 className="font-bold text-lg">1. Use of the Tool</h2>

        <p>
          We grant you a non-exclusive, non-transferable, and revocable license
          to use the Tool. There are no age limits or restrictions on the use of
          the Tool.
        </p>

        <h2 className="font-bold text-lg">
          2. User Accounts and Authentication
        </h2>

        <p>
          To use the Tool, you must create an account and authenticate via
          supported social media platforms, including Google. You agree to
          provide accurate and current information during the registration
          process.
        </p>

        <h2 className="font-bold text-lg">3. Data Collection</h2>
        <p>
          We collect and analyze data on how you use the Tool to improve our
          services. By using the Tool, you consent to this data collection.
        </p>

        <h2 className="font-bold text-lg">4. Modifications to the Tool</h2>
        <p>
          We reserve the right to modify or discontinue the Tool at any time
          without notice. We are not liable for any modifications, suspensions,
          or discontinuations of the Tool.
        </p>

        <h2 className="font-bold text-lg">5. Termination</h2>
        <p>
          We may terminate or suspend your access to the Tool at our sole
          discretion, without prior notice or liability, for any reason.
        </p>

        <h2 className="font-bold text-lg">6. Limitation of Liability</h2>
        <p>{`${WEBSITE_NAME} is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Tool.`}</p>

        <p>
          By using the Tool, you acknowledge that you have read, understood, and
          agree to these Terms and Conditions.
        </p>
      </div>
    </WebsiteLayout>
  );
}
