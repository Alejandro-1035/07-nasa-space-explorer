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

document.querySelector("button").addEventListener("click", async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show loading message
  gallery.innerHTML = '<p class="loading">Loading space images...</p>';

  try {
    // Fetch data from NASA's APOD API
    const response = await fetch(`https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_KEY}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    // Display the images in cards using the displayGallery function
    displayGallery(data);
  } catch (error) {
    console.error('Error fetching images:', error);
    gallery.innerHTML = '<p class="error">Error loading images. Please try again later.</p>';
  }
});

//Display image and video cards
function displayGallery(items) {
  // Clear previous content
  gallery.innerHTML = '';
  
  // Loop through each item and create a card
  items.forEach(item => {
    // Create the card container
    const card = document.createElement('div');
    card.classList.add('card');
    
    // Create the media element (image or video)
    const mediaElement = document.createElement(item.media_type === 'video' ? 'iframe' : 'img');
    mediaElement.src = item.url;
    mediaElement.alt = item.title;
    mediaElement.title = item.title;
    
    // Create title element
    const titleElement = document.createElement('h3');
    titleElement.textContent = item.title;
    titleElement.classList.add('card-title');
    
    // Create date element
    const dateElement = document.createElement('p');
    dateElement.textContent = item.date;
    dateElement.classList.add('card-date');
    
    // Add elements to the card
    card.appendChild(mediaElement);
    card.appendChild(titleElement);
    card.appendChild(dateElement);
    
    // Add click event to open modal
    card.addEventListener('click', () => {
      openModal(item);
    });
    
    // Add the card to the gallery
    gallery.appendChild(card);
  });
}

//create and display modal view
function openModal(item) {
  // Create a modal div
  const modal = document.createElement("div");
  modal.classList.add("modal");

  // Set the modal content using the item data
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <h2>${item.title}</h2>
      ${item.media_type === 'video' 
        ? `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`
        : `<img src="${item.url}" alt="${item.title}">`
      }
      <p>${item.explanation}</p>
    </div>
  `;

  // Add modal to the body
  document.body.appendChild(modal);

  // Close modal when close button is clicked
  modal.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}

const facts = [
  "The universe is about 13.8 billion years old.",
  "There are more stars in the universe than grains of sand on all the Earth's beaches.",
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars are so dense that a sugar-cube-sized amount of material from one would weigh about as much as all of humanity.",
  "The footprints on the Moon will remain there for millions of years because there is no wind or water to erode them."]

const factElement = document.getElementById('fact');
factElement.textContent = "Did you know? " + facts[Math.floor(Math.random() * facts.length)];
factElement.style.textAlign = 'center';
factElement.style.marginBottom = '20px';
document.queryCommandState