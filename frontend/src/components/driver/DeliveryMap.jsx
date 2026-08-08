import { useEffect, useState } from "react";

const DeliveryMap = ({ delivery }) => {
  const [driverPos, setDriverPos] = useState(null);
  const [error, setError] = useState("");

  // Status ke hisaab se destination decide karo
  const isPickupPhase = delivery.status === "ASSIGNED";
  const destCoords = isPickupPhase
    ? delivery.pickupLocation?.coordinates // [lng, lat] — farmer
    : delivery.dropLocation?.coordinates;  // [lng, lat] — buyer
     console.log("Delivery status:", delivery.status);
  console.log("isPickupPhase:", isPickupPhase);
  console.log("pickupLocation (farmer):", delivery.pickupLocation);
  console.log("dropLocation (buyer):", delivery.dropLocation);
  console.log("destCoords being used:", destCoords);

  const destLat = destCoords?.[1];
  const destLng = destCoords?.[0];
  const destLabel = isPickupPhase ? "Pickup Location (Farmer)" : "Drop Location (Buyer)";

  // Driver ki live location track karo
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setDriverPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Unable to fetch your live location"),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!destLat || !destLng) {
    return <p className="text-sm text-gray-500">Destination location not available.</p>;
  }

  // Embed URL — agar driver location mil gayi to route (direction) dikhao, warna sirf destination pin
  const embedSrc = driverPos
    ? `https://maps.google.com/maps?saddr=${driverPos.lat},${driverPos.lng}&daddr=${destLat},${destLng}&output=embed`
    : `https://maps.google.com/maps?q=${destLat},${destLng}&output=embed`;

  // External navigation link (Google Maps app/website)
  const navigateUrl = driverPos
    ? `https://www.google.com/maps/dir/?api=1&origin=${driverPos.lat},${driverPos.lng}&destination=${destLat},${destLng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">📍 {destLabel}</span>
        {!driverPos && !error && (
          <span className="text-xs text-gray-400">Detecting your location...</span>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="rounded-lg overflow-hidden border" style={{ height: "300px" }}>
        <iframe
          title="delivery-map"
          src={embedSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>

      <a
        href={navigateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700"
      >
        Open in Google Maps for Navigation
      </a>
    </div>
  );
};

export default DeliveryMap;