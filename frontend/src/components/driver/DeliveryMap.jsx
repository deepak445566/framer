import { useEffect, useState } from "react";
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react";

const DeliveryMap = ({ delivery }) => {
  const [driverPos, setDriverPos] = useState(null);
  const [error, setError] = useState("");

  const isPickupPhase = delivery.status === "ASSIGNED";
  const destCoords = isPickupPhase
    ? delivery.pickupLocation?.coordinates
    : delivery.dropLocation?.coordinates;

  const destLat = destCoords?.[1];
  const destLng = destCoords?.[0];
  const destLabel = isPickupPhase ? "Pickup Location (Farmer)" : "Drop Location (Buyer)";

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
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <AlertCircle size={16} />
        Destination location not available.
      </div>
    );
  }

  const embedSrc = driverPos
    ? `https://maps.google.com/maps?saddr=${driverPos.lat},${driverPos.lng}&daddr=${destLat},${destLng}&output=embed`
    : `https://maps.google.com/maps?q=${destLat},${destLng}&output=embed`;

  const navigateUrl = driverPos
    ? `https://www.google.com/maps/dir/?api=1&origin=${driverPos.lat},${driverPos.lng}&destination=${destLat},${destLng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;

  return (
    <div className="mt-3 bg-white border border-green-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-50 to-white border-b border-green-100">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white">
            <MapPin size={14} />
          </span>
          <span className="text-sm font-semibold text-gray-800">{destLabel}</span>
        </div>

        {!driverPos && !error && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <Loader2 size={12} className="animate-spin" />
            Detecting your location...
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-4 py-2 border-b border-red-100">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div style={{ height: "300px" }}>
        <iframe
          title="delivery-map"
          src={embedSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
        />
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-green-100">
        <a
          href={navigateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-md shadow-green-200 hover:shadow-lg hover:from-green-700 hover:to-green-600 transition-all duration-200"
        >
          <Navigation size={14} />
          Open in Google Maps for Navigation
        </a>
      </div>
    </div>
  );
};

export default DeliveryMap;