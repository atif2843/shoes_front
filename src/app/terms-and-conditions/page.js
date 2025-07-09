import Footer from "@/app/components/Footer";
export default function TermsAndConditions() {
  return (
    <div>
    <div className="mx-auto py-10 px-4">
      <h1 className="font-bold mb-4">Terms & Conditions</h1>
      <p className="mb-4">Welcome to Kicksneak! By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully before using our services.</p>
      <ul className="list-disc pl-6 mb-4">
        <li>All content on this site is for informational purposes only.</li>
        <li>We reserve the right to update or change these terms at any time.</li>
        <li>Users are responsible for maintaining the confidentiality of their account information.</li>
        <li>Unauthorized use of this website may give rise to a claim for damages.</li>
      </ul>
      <p>If you have any questions about our Terms & Conditions, please contact us.</p>
    </div>
    <Footer />
         </div>
  );
}
