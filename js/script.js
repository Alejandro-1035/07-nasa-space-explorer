// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
// Use NASA's API key to call NASA's Astronomy Picture of the Day (APOD) API and get image data
const NASA_KEY = "9lqF0l3pYLhNGCMSzne7yiyjthkZq9uz1Kkod5bW";

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const gallery = document.getElementById('gallery');

document.querySelector("button").addEventListener("click", async () => { const startDate = startInput.value;
  const endDate = endInput.value;

  gallery.innerHTML = '<p> Loading space images...';

  try {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_KEY}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    gallery.innerHTML = ''; // Clear previous images

    data.forEach(item => {
      const imgElement = document.createElement('img');
      imgElement.src = item.url;
      imgElement.alt = item.title;
      imgElement.title = item.title;
      gallery.appendChild(imgElement);
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    gallery.innerHTML = '<p>Error loading images. Please try again later.</p>';
  }
});


