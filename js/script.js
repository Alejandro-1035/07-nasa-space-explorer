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

// Function to preload all images before showing them
async function preloadAllImages(items) {
  const imageItems = items.filter(item => 
    (item.media_type === 'image' || !item.media_type) && 
    (item.url || item.hdurl) &&
    item.title && 
    item.date
  );

  const imagePromises = imageItems.map(item => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`Loaded: ${item.title}`);
        resolve(item);
      };
      
      img.onerror = () => {
        if (item.url && img.src !== item.url) {
          img.src = item.url;
        } else {
          console.log(`Failed to load: ${item.title}`);
          resolve(item);
        }
      };
      
      img.src = item.hdurl || item.url;
    });
  });

  try {
    await Promise.all(imagePromises);
    console.log('All images preloaded successfully!');
  } catch (error) {
    console.log('Some images failed to preload, but continuing...');
  }
}

document.querySelector("button").addEventListener("click", async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Get a random space fact to display during loading
  let currentFactIndex = Math.floor(Math.random() * facts.length);

  gallery.innerHTML = `
    <div class="loading-screen">
      <img src="img/NASA-Logo.png" alt="NASA Logo" class="loading-logo" />
      <div class="loading-content">
        <h3>Loading NASA Space Images...</h3>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
        <p class="loading-text">Fetching images from NASA's archives...</p>
        <div class="loading-fact">
          <h4> Did you know?</h4>
          <p id="fact-text">${facts[currentFactIndex]}</p>
        </div>
      </div>
    </div>
  `;

  // Cycle through facts every 5 seconds
  const factInterval = setInterval(() => {
    currentFactIndex = (currentFactIndex + 1) % facts.length;
    
    const factElement = document.getElementById('fact-text');
    if (factElement) {
      factElement.style.opacity = '0.5';
      setTimeout(() => {
        factElement.textContent = facts[currentFactIndex];
        factElement.style.opacity = '1';
      }, 250);
    } else {
      clearInterval(factInterval);
    }
  }, 5000);

  try {
    // Fetch data from NASA's APOD API
    const response = await fetch(`https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_KEY}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();

    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = 'Processing and loading images...';
    }

    await preloadAllImages(data);

    clearInterval(factInterval);

    displayGallery(data);
  } catch (error) {
    console.error('Error fetching images:', error);
    clearInterval(factInterval);
    gallery.innerHTML = `
      <div class="error-screen">
        <img src="img/nasa-worm-logo.png" alt="NASA Logo" class="error-logo" />
        <p>Error loading images. Please try again later.</p>
      </div>
    `;
  }
});

//Display image and video cards - Handles all APOD entry types
function displayGallery(items) {
  // Clear 
  gallery.innerHTML = '';
  
  if (!items || items.length === 0) {
    gallery.innerHTML = '<p class="no-results">No space images found for this date range. Try a different date range!</p>';
    return;
  }
  
  // Loops through each item and create a card
  items.forEach(item => {
    if (!item.title || !item.date) {
      console.log('Skipping incomplete APOD entry:', item);
      return;
    }
    
    // Creates the card container
    const card = document.createElement('div');
    card.classList.add('card');
    // Video and image handling
    let mediaElement;
    if (item.media_type === 'video') {
      mediaElement = document.createElement('iframe');
      mediaElement.src = item.url;
      mediaElement.setAttribute('frameborder', '0');
      mediaElement.setAttribute('allowfullscreen', 'true');
    } else if (item.media_type === 'image' || !item.media_type) {
      mediaElement = document.createElement('img');
      mediaElement.src = item.hdurl || item.url;
      mediaElement.alt = item.title;
      
      // Handles image loading errors
      mediaElement.onerror = function() {
        if (this.src !== item.url && item.url) {
          this.src = item.url;
        } else {
          this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSIxNTAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OTk5OSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
          this.alt = 'Image not available';
        }
      };
    } else {
      mediaElement = document.createElement('div');
      mediaElement.classList.add('unknown-media');
      mediaElement.textContent = `Media type: ${item.media_type || 'Unknown'}`;
    }
    
    mediaElement.title = item.title;
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = item.title;
    titleElement.classList.add('card-title');
    

    const dateElement = document.createElement('p');

    const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    dateElement.textContent = formattedDate;
    dateElement.classList.add('card-date');
    
    if (item.copyright) {
      const copyrightElement = document.createElement('p');
      copyrightElement.textContent = `© ${item.copyright}`;
      copyrightElement.classList.add('card-copyright');
    }
    

    card.appendChild(mediaElement);
    card.appendChild(titleElement);
    card.appendChild(dateElement);
    
    card.addEventListener('click', () => {
      openModal(item);
    });
    
    // Add the card to the gallery
    gallery.appendChild(card);
  });
}

function openModal(item) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });


  let mediaContent = '';
  if (item.media_type === 'video') {
    mediaContent = `<iframe src="${item.url}" frameborder="0" allowfullscreen></iframe>`;
  } else {

    const imageSrc = item.hdurl || item.url;
    mediaContent = `<img src="${imageSrc}" alt="${item.title}">`;
  }

  const copyrightSection = item.copyright ? 
    `<p class="modal-copyright"><strong>Copyright:</strong> ${item.copyright}</p>` : '';

  // Set the modal content using the item data
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <h2>${item.title}</h2>
      ${mediaContent}
      <div class="modal-text-content">
        <p class="modal-date"><strong>Date:</strong> ${formattedDate}</p>
        ${copyrightSection}
        <p class="modal-explanation">${item.explanation || 'No description available.'}</p>
      </div>
    </div>
  `;

  // Add modal to the body
  document.body.appendChild(modal);

  modal.querySelector('.close-button').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
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