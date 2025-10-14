import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faPlus,
  faList,
  faShoppingCart,
  faTachometerAlt,
  faBars,
  faTimes,
    faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { assets } from "../assets/assets";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header with Logo + Settings + Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 p-3 shadow-sm">
        <div className="flex justify-between items-center">
          {/* Logo links to login by default */}
          <Link to="/" className="p-1">
            <img
              src={assets.logo}
              alt="Logo"
              className="w-20 h-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            {/* Settings (Mobile) */}
            <Link to="/settings" className="p-2">
              <FontAwesomeIcon
                icon={faCog}
                className="text-gray-600 text-xl hover:text-black-600 transition"
              />
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon
                icon={isMenuOpen ? faTimes : faBars}
                className="text-gray-700 text-xl"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-lg animate-slideDown">
          <div className="flex flex-col p-4 space-y-2">
            <NavLink
              to="/content-management"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "text-black-600 border-l-4 border-black-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faLayerGroup} />
              <span className="font-medium"> Content Management</span>
            </NavLink>

            <NavLink
              to="/add"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "text-black-600 border-l-4 border-black-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="font-medium">Add Items</span>
            </NavLink>

            <NavLink
              to="/list"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "text-black-600 border-l-4 border-black-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faList} />
              <span className="font-medium">List Items</span>
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "text-black-600 border-l-4 border-black-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              <span className="font-medium">Orders</span>
            </NavLink>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className="hidden md:block w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo links to login by default */}
            <div className="flex-shrink-0">
              <Link to="/" className="p-2 block">
                <img
                  src={assets.logo}
                  alt="Logo"
                  className="w-32 h-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              <NavLink
                to="/content-management"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-3 border-b-2 transition ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`
                }
              >
                <FontAwesomeIcon icon={ faLayerGroup} />
                <span className="font-medium"> Content Management</span>
              </NavLink>

              <NavLink
                to="/add"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-3 border-b-2 transition ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`
                }
              >
                <FontAwesomeIcon icon={faPlus} />
                <span className="font-medium">Add Items</span>
              </NavLink>

              <NavLink
                to="/list"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-3 border-b-2 transition ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`
                }
              >
                <FontAwesomeIcon icon={faList} />
                <span className="font-medium">List Items</span>
              </NavLink>

              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-6 py-3 border-b-2 transition ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`
                }
              >
                <FontAwesomeIcon icon={faShoppingCart} />
                <span className="font-medium">Orders</span>
              </NavLink>
            </nav>

            <Link to="/settings" className="flex-shrink-0 p-2">
              <FontAwesomeIcon
                icon={faCog}
                className="text-gray-500 text-xl hover:text-black transition"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Add padding for mobile header */}
      <div className="md:hidden h-14"></div>
    </>
  );
};

export default Navbar;