import { Link } from "react-router-dom";

const COLORS = {
  primary: "#75464A",
  accent: "#E6DCEB",
  hover: "#D85E79",
};

export default function Footer() {
  return (
    <footer
      className="mt-16 border-t bg-gradient-to-b from-pink-50 to-purple-50"
      style={{ borderColor: COLORS.accent }}
    >
      {/* main content */}
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-8 md:grid-cols-3">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-[#75464A]">AURAMATCH</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-sm">
            AI Beauty Advisor ที่ช่วยค้นหาโทนสีและสไตล์ที่เหมาะกับคุณ
            เพื่อความสวยมั่นใจทุกวัน ✨
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-[#75464A] mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><Link to="/" className="hover:text-[#D85E79]">Home</Link></li>
            <li><Link to="/analysis" className="hover:text-[#D85E79]">Analysis</Link></li>
            <li><Link to="/advisor" className="hover:text-[#D85E79]">Advisor</Link></li>
            <li><Link to="/cosmetics" className="hover:text-[#D85E79]">Cosmetics</Link></li>
            <li><a href="#about" className="hover:text-[#D85E79]">About Us</a></li>
          </ul>
        </div>

        {/* Contact / Social */}
        <div>
          <h3 className="text-lg font-semibold text-[#75464A] mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              Email:{" "}
              <a href="mailto:support@auramatch.com" className="hover:text-[#D85E79]">
                support@auramatch.com
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href="tel:+66000000000" className="hover:text-[#D85E79]">
                +66 00 000 0000
              </a>
            </li>
          </ul>
          <div className="mt-4 flex gap-4 text-gray-500 text-sm">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#D85E79]">
              Facebook
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#D85E79]">
              Instagram
            </a>
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div
        className="border-t py-4 text-center text-xs text-gray-500"
        style={{ borderColor: COLORS.accent }}
      >
        © {new Date().getFullYear()} AuraMatch. All rights reserved.
      </div>
    </footer>
  );
}
