import Footer from "@/app/components/Footer";
export default function PrivacyPolicy() {
  return (
    <div>
    <div className="mx-auto py-10 px-4">
      <h1 className="font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">At Kicksneak, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.</p>
      <ul className="list-disc pl-6 mb-4">
        <li>We collect information you provide when you register, place an order, or subscribe to our newsletter.</li>
        <li>Your data is used to process orders, improve our services, and communicate with you.</li>
        <li>We do not sell or share your personal information with third parties except as required by law.</li>
        <li>You may request to access, update, or delete your personal data at any time.</li>
      </ul>
      <p>For more details or questions about our privacy practices, please contact us.</p>
    </div>
     <Footer />
     </div>
  );
}
