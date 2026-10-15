(() => {
  const element = document.getElementById('office-map');
  if (!element || !window.L) return;
  const office = [55.968348, 37.174514];
  const map = L.map(element, {
    zoomControl: false,
    scrollWheelZoom: false,
    minZoom: 12,
    maxZoom: 19,
    attributionControl: true,
  }).setView(office, 15);
  map.attributionControl.setPrefix(false);
  L.control.zoom({
    position: 'topright',
    zoomInTitle: 'Приблизить карту',
    zoomOutTitle: 'Отдалить карту',
    zoomOutText: '−',
  }).addTo(map);
  const fallback = element.querySelector('.map-fallback');
  const tiles = L.tileLayer(element.dataset.tileUrl, {
    maxZoom: 19,
    keepBuffer: 1,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  });
  tiles.on('load', () => {
    if (element.querySelector('.leaflet-tile-loaded')) fallback.hidden = true;
  });
  tiles.addTo(map);
  const icon = L.divIcon({
    className: 'office-pin',
    iconSize: [42, 48],
    iconAnchor: [21, 46],
    tooltipAnchor: [0, -46],
    html: '<span class="office-pin-shape"><svg aria-hidden="true"><use href="#scale"/></svg></span>',
  });
  const marker = L.marker(office, {icon, title: 'Офис: Георгиевский проспект, 25, стр. 1'}).addTo(map);
  marker.bindTooltip('<strong>НАШ ОФИС</strong><span>Георгиевский проспект, 25, стр. 1</span>', {
    permanent: true,
    direction: 'top',
    className: 'office-map-label',
    opacity: 1,
  });
  const markerElement = marker.getElement();
  markerElement.setAttribute('aria-label', 'Показать офис: Георгиевский проспект, 25, стр. 1');
  markerElement.addEventListener('click', () => map.panTo(office));
  const centerButton = element.querySelector('.map-center-button');
  L.DomEvent.disableClickPropagation(centerButton);
  centerButton.addEventListener('click', () => map.setView(office, 15));
  // Keep the marker correctly positioned when the responsive grid changes size.
  new ResizeObserver(() => map.invalidateSize({pan: false})).observe(element);
})();
