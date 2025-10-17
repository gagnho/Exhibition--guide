function showHome() {
  document.getElementById('scroll-container').style.display = 'none';
  document.getElementById('homepage').style.display = 'block';
  fetchParentInfo();
  initMap();
}

function fetchParentInfo() {
  fetch('/api/visitors', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      document.getElementById('parent-count').textContent = 'Parents: ' + data.count;
      document.getElementById('parent-number').textContent = 'Your Parent Number: ' + data.count;
    })
    .catch(() => {
      document.getElementById('parent-count').textContent = 'Parents: N/A';
      document.getElementById('parent-number').textContent = 'Your Parent Number: N/A';
    });
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 28.6139, lng: 77.2090 }, // Example: New Delhi
    zoom: 14
  });
  var marker = new google.maps.Marker({
    position: { lat: 28.6139, lng: 77.2090 },
    map: map,
    title: 'Exhibition Location'
  });
}
