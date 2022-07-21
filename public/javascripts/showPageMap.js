mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/outdoors-v11',
center: campground.geometry.coordinates,
zoom: 8
});

map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({})
			.setHTML(`
				<h5>${campground.title}</h5>
				<p>- ${campground.location}</p>
			`)
	)
	.addTo(map);