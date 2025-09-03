// Ensure dataLayer exists
window.dataLayer = window.dataLayer || [];

// Product interaction
document.querySelectorAll('.product').forEach(function(product) {
  let quantityEl = product.querySelector('.quantity');
  let qty = 0;
  product.querySelector('.plus').addEventListener('click', function() {
    qty++;
    quantityEl.textContent = qty;
  });
  product.querySelector('.minus').addEventListener('click', function() {
    if (qty > 0) qty--;
    quantityEl.textContent = qty;
  });
  product.querySelector('.add-to-cart').addEventListener('click', function() {
    if (qty > 0) {
      let item = {
        item_id: product.dataset.id,
        item_name: product.dataset.name,
        price: parseFloat(product.dataset.price),
        quantity: qty
      };
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      cart.push(item);
      localStorage.setItem('cart', JSON.stringify(cart));
      dataLayer.push({ event: "add_to_cart", ecommerce: { items: [item] } });
    }
  });
});

// Checkout logic
if (document.getElementById('cart-items')) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let container = document.getElementById('cart-items');
  if (cart.length > 0) {
    let total = 0;
    cart.forEach(item => {
      let p = document.createElement('p');
      p.textContent = `${item.item_name} (x${item.quantity}) - $${item.price}`;
      container.appendChild(p);
      total += item.price * item.quantity;
    });
    let totalEl = document.createElement('h3');
    totalEl.textContent = `Total: $${total.toFixed(2)}`;
    container.appendChild(totalEl);
    dataLayer.push({ event: "begin_checkout", ecommerce: { items: cart }, transport_type: "beacon" });
  }
  document.getElementById('proceed').addEventListener('click', function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    dataLayer.push({ event: "proceed_checkout", ecommerce: { items: cart }, transport_type: "beacon" });
    // Delay navigation just a bit
  setTimeout(() => {
    window.location.href = "thankyou.html";
  }, 1000); // 300ms = invisible to user, enough for GA
    // window.location.href = "thankyou.html";
  });
}

// Thank you page purchase event
if (document.title.includes("Thank You")) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length > 0) {
    dataLayer.push({ event: "purchase", ecommerce: { items: cart } });
    localStorage.removeItem('cart');
  }
}

// Video tracking
var videos = document.querySelectorAll('video');

videos.forEach(function(video, index) {
  var videoId = video.id || "video_" + (index + 1); 
  var milestones = [25, 50, 75];
  var milestonesTracked = {};
  var hasPlayed = false;
  var videoTitle = video.title || "Untitled Video";

  // Track play vs resume
  video.addEventListener('play', function() {
    if (!hasPlayed) {
      dataLayer.push({
        event: "video_play",
        video_id: videoId,
        video_title: videoTitle
      });
      hasPlayed = true;
    } else {
      dataLayer.push({
        event: "video_resume",
        video_id: videoId,
        video_title: videoTitle
      });
    }
  });

  // Track progress milestones
  video.addEventListener('timeupdate', function() {
    var percentPlayed = Math.floor((video.currentTime / video.duration) * 100);
    milestones.forEach(function(m) {
      if (percentPlayed >= m && !milestonesTracked[m]) {
        dataLayer.push({
          event: "video_progress",
          video_id: videoId,
          video_title: videoTitle,
          progress: m
        });
        milestonesTracked[m] = true;
      }
    });
  });

  // Track complete
  video.addEventListener('ended', function() {
    dataLayer.push({
      event: "video_complete",
      video_id: videoId,
      video_title: videoTitle
    });
  });
});

// Lead form submit
var leadForm = document.getElementById('leadForm');
if (leadForm) {
  leadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    dataLayer.push({
      event: "generate_lead",
      user: { name: document.getElementById('name').value, email: document.getElementById('email').value }
    });
    alert("Thanks for subscribing!");
    leadForm.reset();
  });
}

// Banner click
var banner = document.getElementById('newsletter-banner');
if (banner) {
  banner.addEventListener('click', function() {
    dataLayer.push({ event: "banner_click", banner: "newsletter_signup" });
  });
}

// Search box tracking
var searchBtn = document.getElementById('search-btn');
if (searchBtn) {
  searchBtn.addEventListener('click', function() {
    let query = document.getElementById('search-box').value;
    if (query.trim() !== "") {
      dataLayer.push({ event: "view_search_results", search_term: query });
      alert("Showing results for: " + query);
    }
  });
}

// Cart abandonment simulation: user adds but no checkout in 30s
if (document.querySelector('.product')) {
  setTimeout(function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length > 0 && !window.location.href.includes("checkout")) {
      dataLayer.push({ event: "cart_abandon", ecommerce: { items: cart } });
    }
  }, 30000);
}
