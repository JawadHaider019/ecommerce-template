// OtherTab.jsx
import React from "react";

const OtherTab = ({
  deliverySettings,
  setDeliverySettings,
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-6">

      {/* Delivery Settings */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Delivery Settings</h3>

        {/* Delivery Mode Toggle */}
        <div className="flex items-center gap-4 mb-4">
          {["fixed", "api"].map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="deliveryMode"
                value={mode}
                checked={deliverySettings.mode === mode}
                onChange={() => setDeliverySettings({ ...deliverySettings, mode })}
              />
              {mode === "fixed" ? "Fixed Charges" : "From API"}
            </label>
          ))}
        </div>

        {/* Mode-specific Input */}
        {deliverySettings.mode === "fixed" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fixed Delivery Charges
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              value={deliverySettings.fixedCharge}
              onChange={(e) =>
                setDeliverySettings({ ...deliverySettings, fixedCharge: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL to fetch delivery charge
            </label>
            <input
              type="text"
              placeholder="https://api.example.com/delivery-charge"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              value={deliverySettings.apiUrl}
              onChange={(e) =>
                setDeliverySettings({ ...deliverySettings, apiUrl: e.target.value })
              }
            />
          </div>
        )}

        {/* Free Delivery Above */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Free Delivery Above
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
            value={deliverySettings.freeDeliveryAbove}
            onChange={(e) =>
              setDeliverySettings({ ...deliverySettings, freeDeliveryAbove: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* Save Button */}
      <button className="px-4 py-2 bg-black text-white hover:bg-black">
        Save
      </button>
    </div>
  );
};

export default OtherTab;
