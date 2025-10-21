import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faComment,
  faBookOpen,
  faReply,
  faCog,
  faImages,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

// Import tab components
import CategoriesTab from "./Tabs/CategoriesTab.jsx";
import TestimonialsTab from "./Tabs/TestimonialsTab.jsx";
import BlogsTab from "./Tabs/BlogsTab.jsx";
import CommentsTab from "./Tabs/CommentsTab.jsx";
import OtherTab from "./Tabs/OtherTab.jsx";
import { BannerManager } from "./Tabs/BannerTab.jsx";
import TeamsTab from "./Tabs/TeamsTab.jsx"; 

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("categories");

  // All data states (initially empty)
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [teams, setTeams] = useState([]); // New state for teams

  const [deliverySettings, setDeliverySettings] = useState({
    mode: "fixed",
    fixedCharge: 0,
    apiUrl: "",
    freeDeliveryAbove: 0,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const previewUrlsRef = useRef([]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
    };
  }, []);

  // Future: Fetch all data from backend APIs
  useEffect(() => {
    // Example API fetch (uncomment and adjust later)
    /*
    fetch("http://localhost:4000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));

    fetch("http://localhost:4000/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(data));

    fetch("http://localhost:4000/api/comments")
      .then((res) => res.json())
      .then((data) => setComments(data));

    fetch("http://localhost:4000/api/testimonials")
      .then((res) => res.json())
      .then((data) => setTestimonials(data));

    // Fetch teams data
    fetch("http://localhost:4000/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data));
    */
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "categories":
        return (
          <CategoriesTab categories={categories} setCategories={setCategories} />
        );
      case "blogs":
        return (
          <BlogsTab
            blogs={blogs}
            setBlogs={setBlogs}
            categories={categories}
          />
        );
      case "banner":
        return <BannerManager />;
      case "testimonials":
        return (
          <TestimonialsTab
            testimonials={testimonials}
            setTestimonials={setTestimonials}
          />
        );
      case "comments":
        return (
          <CommentsTab comments={comments} setComments={setComments} />
        );
      case "teams": // New case for teams
        return (
          <TeamsTab teams={teams} setTeams={setTeams} />
        );
      case "other":
        return (
          <OtherTab
            deliverySettings={deliverySettings}
            setDeliverySettings={setDeliverySettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-md md:shadow-lg border border-gray-100 mt-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        Content Management
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        {[
          { id: "categories", name: "Categories", icon: faFolder },
          { id: "blogs", name: "Blogs", icon: faBookOpen },
          { id: "banner", name: "Banner", icon: faImages },
          { id: "testimonials", name: "Testimonials", icon: faComment },
          { id: "comments", name: "Comments", icon: faReply },
          { id: "teams", name: "Teams", icon: faUsers }, // New tab
          { id: "other", name: "Other", icon: faCog },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium flex items-center ${
              activeTab === tab.id
                ? "text-black border-b-2 border-black"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <FontAwesomeIcon icon={tab.icon} className="mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default ContentManagement;