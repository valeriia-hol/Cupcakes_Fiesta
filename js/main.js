$(document).ready(() => {
	const $slider = $("#slider1");

	// The number of times you want to duplicate all slides
	const duplicateTimes = 1;
	// Get original slides
	const $slides = $slider.children().clone();
	// Duplicate slides
	for (let i = 0; i < duplicateTimes; i++) {
		$slides.clone().appendTo($slider);
	}

	// Initialize the slider with specified settings
	$slider.slick({
		slidesToShow: 5,         // Number of slides to display at once
		slidesToScroll: 1,       // Number of slides to scroll per navigation
		centerMode: false,       // Disable default centered slide mode
		autoplay: true,          // Disable automatic slide playback
		autoplaySpeed: 2000,     // Speed of autoplay in milliseconds (unused since autoplay is false)
		speed: 800,              // Transition animation speed in milliseconds
		infinite: true,          // Enable infinite scrolling of slides
		arrows: false,           // Disable navigation arrows
	});

	/**
	 * Function to set the 'slick-center-slide' class on the central slide.
	 * @param {Object} slick - The Slick slider instance.
	 * @param {number} currentSlideIndex - The index of the current or next slide.
	 **/
	const setCenterClass = (slick, currentSlideIndex) => {
		// Remove the 'slick-center-slide' class from all slides before setting the new one
		$slider.find(".slick-slide").removeClass("slick-center-slide");

		const slidesToShow = slick.options.slidesToShow; // Number of slides displayed at once
		const totalSlides = slick.slideCount; // Total number of slides (excluding clones)

		// Array to store indices of slides that will be active after the change
		const activeIndices = [];
		for (let i = 0; i < slidesToShow; i++) {
			// Calculate the index of the active slide, considering infinite scrolling
			const index = (currentSlideIndex + i) % totalSlides;
			activeIndices.push(index);
		}

		// Determine the index of the central slide among active slides
		const centerIndex = activeIndices[Math.floor(slidesToShow / 2)];

		// Iterate over all slides to set the class on the central slide
		$slider.find(".slick-slide").each(function () {
			const slideIndex = $(this).data("slick-index"); // Get the slide's data-slick-index attribute
			// Normalize the slide index for correct comparison in infinite scrolling
			const normalizedIndex = ((slideIndex % totalSlides) + totalSlides) % totalSlides;

			// Check if the current slide is the central one
			if (normalizedIndex === centerIndex) {
				$(this).addClass("slick-center-slide"); // Add the class to the central slide
			}
		});
	};

	// Event handler for 'setPosition', which triggers after each slide position update
	$slider.on("setPosition", (event, slick) => {
		setCenterClass(slick, slick.currentSlide); // Set the class on initialization and position updates
	});

	// Event handler for 'beforeChange', which triggers before the slide changes
	$slider.on("beforeChange", (event, slick, currentSlide, nextSlide) => {
		setCenterClass(slick, nextSlide); // Set the class before the slide changes for immediate update
	});
});
