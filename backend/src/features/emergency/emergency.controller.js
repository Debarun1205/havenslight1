const asyncHandler = require("../../utils/asyncHandler");

// OSM's "amenity" tag values that map to each category we expose. Grouped
// this way so "clinic" in our UI covers both OSM's clinic and doctors tags
// — travelers looking for a walk-in clinic don't care about that distinction.
const CATEGORY_AMENITIES = {
  police: ["police"],
  hospital: ["hospital"],
  clinic: ["clinic", "doctors"],
  pharmacy: ["pharmacy"],
};

const ALL_CATEGORIES = Object.keys(CATEGORY_AMENITIES);

function amenityToCategory(amenity) {
  return Object.entries(CATEGORY_AMENITIES).find(([, values]) => values.includes(amenity))?.[0] || "other";
}

// Overpass API is free and keyless (no billing account required, unlike
// Google Places) — the tradeoff is it's a shared public instance with no
// uptime guarantee, so this is wrapped defensively rather than assumed
// always-available.
async function queryOverpass(latitude, longitude, radiusMeters, amenities) {
  const clauses = amenities
    .map(
      (a) =>
        `node["amenity"="${a}"](around:${radiusMeters},${latitude},${longitude});\n  way["amenity"="${a}"](around:${radiusMeters},${latitude},${longitude});`
    )
    .join("\n  ");
  const query = `[out:json][timeout:20];\n(\n  ${clauses}\n);\nout center tags;`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API responded with ${response.status}`);
  }
  const data = await response.json();
  return data.elements || [];
}

function normalizeElement(el) {
  const tags = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  const addressParts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);

  return {
    id: `${el.type}/${el.id}`,
    category: amenityToCategory(tags.amenity),
    name: tags.name || tags["name:en"] || "Unnamed",
    latitude: lat,
    longitude: lon,
    phone: tags.phone || tags["contact:phone"] || null,
    address: addressParts.length > 0 ? addressParts.join(", ") : null,
    openingHours: tags.opening_hours || null,
    emergency: tags.emergency === "yes",
  };
}

// @desc  Find nearby police stations, hospitals, clinics, and pharmacies,
//        categorized. Powers the standalone emergency-services map.
// @route GET /api/emergency/nearby?longitude=&latitude=&radius=&category=
const getNearbyServices = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.query;
  const radius = Number(req.query.radius) || 5000;
  const categoryParam = req.query.category;

  if (longitude === undefined || latitude === undefined) {
    return res.status(400).json({ message: "longitude and latitude query params are required" });
  }

  const categories =
    !categoryParam || categoryParam === "all"
      ? ALL_CATEGORIES
      : categoryParam.split(",").filter((c) => ALL_CATEGORIES.includes(c));

  if (categories.length === 0) {
    return res.status(400).json({ message: `category must be one of: ${ALL_CATEGORIES.join(", ")}, or "all"` });
  }

  const amenities = categories.flatMap((c) => CATEGORY_AMENITIES[c]);

  let elements;
  try {
    elements = await queryOverpass(latitude, longitude, radius, amenities);
  } catch (err) {
    // Overpass is a shared free instance — fail gracefully rather than 500ing,
    // since "the map is briefly slow" shouldn't look like our server is broken.
    return res.status(502).json({
      message: "Couldn't reach the emergency-services data source right now. Please try again shortly.",
    });
  }

  const services = elements.map(normalizeElement).filter(Boolean);

  res.json({ services, count: services.length });
});

module.exports = { getNearbyServices };
