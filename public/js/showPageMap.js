mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-v9", // stylesheet location
  center: photoplace.geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
})
map.addControl(new mapboxgl.NavigationControl(), "top-left")
new mapboxgl.Marker()
  .setLngLat(photoplace.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3 class="text-dark">${photoplace.title}</h3><p class="text-dark">${photoplace.location}</p>`
    )
  )
  .addTo(map)
