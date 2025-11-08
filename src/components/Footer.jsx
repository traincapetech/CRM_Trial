import React from "react";
import { Link } from "react-router-dom";
import {
  FaLinkedin,
  FaFacebook,
  FaEnvelope,
  FaRocket,
  FaChartLine,
  FaTasks,
  FaChartBar,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-footer-deep-blue-black text-white dark:text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {/* Branding */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              TrainCape CRM
            </h3>
            <p className=" dark:text-white text-sm">
              Empowering sales teams with intelligent CRM solutions.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-4 mr-12  dark:text-white">
              Features
            </h4>
            <ul className="space-y-3  dark:text-white text-sm">
              <li>
                <Link
                  to="/leads"
                  className="hover:opacity-80 transition flex items-center"
                >
                  <FaRocket className="mr-2 text-sm" /> Lead Management
                </Link>
              </li>
              <li>
                <Link
                  to="/sales"
                  className="hover:opacity-80 transition flex items-center"
                >
                  <FaChartLine className="mr-2 text-sm" /> Sales Pipeline
                </Link>
              </li>
              <li>
                <Link
                  to="/tasks"
                  className="hover:opacity-80 transition flex items-center"
                >
                  <FaTasks className="mr-2 text-sm" /> Task Management
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/reports"
                  className="hover:opacity-80 transition flex items-center"
                >
                  <FaChartBar className="mr-2 text-sm" /> Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4  dark:text-white">
              Resources
            </h4>
            <ul className="space-y-3  dark:text-white text-sm">
              <li>
                <a href="#" className="hover:opacity-80 transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-80 transition">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#tutorials" className="hover:opacity-80 transition">
                  Tutorials
                </a>
              </li>
              <li>
                <a href="#countries" className="hover:opacity-80 transition">
                  Countries
                </a>
              </li>
            </ul>
          </div>

          {/* Company + Connect */}
          <div>
            <div className="flex flex-row items-start justify-between">
              {/* Left: Company Links */}
              <div className="mr-6">
                <h4 className="text-lg font-semibold mb-4  dark:text-white">
                  Company
                </h4>
                <ul className="space-y-3 text-white dark:text-white text-sm">
                  <li>
                    <a href="#" className="hover:opacity-80 transition">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:opacity-80 transition">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#management-contacts"
                      className="hover:opacity-80 transition"
                    >
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              {/* Right: Social */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-white dark:text-white">
                  Connect
                </h4>
                <div className="flex flex-col ml-2">
                  <a
                    href="#"
                    className="text-white dark:text-white hover:text-blue-400 transition p-2 rounded-full w-fit"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin />
                  </a>
                  <a
                    href="#"
                    className="text-white dark:text-white hover:text-blue-600 transition p-2 rounded-full w-fit"
                    aria-label="Facebook"
                  >
                    <FaFacebook />
                  </a>
                  <a
                    href="mailto:support@traincapecrm.com"
                    className="text-white dark:text-white hover:text-red-600 transition p-2 rounded-full w-fit"
                    aria-label="Email"
                  >
                    <FaEnvelope />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-10 pt-6 text-center text-sm text-white dark:text-white">
          &copy; {new Date().getFullYear()} TrainCape CRM. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;