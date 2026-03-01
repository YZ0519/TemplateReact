import { useState } from "react";
import ProfilePhotos from "./ProfilePhotos";
import ProfileAbout from "./ProfileAbout";

const tabs = [
  { label: "About" },
  { label: "Photos" },
];

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 0: return <ProfileAbout />;
      case 1: return <ProfilePhotos />;
      default: return null;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg mt-4 flex min-h-96">
      <div className="flex flex-col border-r border-gray-200 min-w-44">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-3 text-left text-sm font-medium transition-colors
              ${activeTab === i
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
