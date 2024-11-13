window.CupcakeFiestaApp = window.CupcakeFiestaApp || {};

window.CupcakeFiestaApp.initializeSliders = (context = document || {}) => {
	const $context = $(context);

	$context.find(".owl-carousel").each(function () {
		const $currCarousel = $(this);
		if (!$currCarousel.hasClass("owl-loaded")) {
			initializeSlider($currCarousel);
		}
	});
};

const initializeSlider = ($currCarousel) => {
	const $parentSlider = $currCarousel.closest(".slider-module"); // Find the parent container
	const sliderDefaultItems = $currCarousel.data("slider-default-items");
	const isAutoplay = $currCarousel.data("slider-autoplay") === true;
	const isScrolling = $currCarousel.data("slider-scrolling") === true;

	const syncDescription = (event) => {
		const carousel = event.relatedTarget;
		const targetSlideIndex =
			(event.type === "initialized")
				? carousel.relative(carousel.current()) + 1
				: carousel.relative(event.item.index) + 1;

		const $parentSlider = $currCarousel.closest(".slider-module");
		const $descriptions = $parentSlider.find(".slide-description__item");

		$descriptions.removeClass("slide-description__item_show");

		const $activeDescription = $descriptions.filter(`[data-slide-index="${targetSlideIndex}"]`);

		if ($activeDescription.length) $activeDescription.addClass("slide-description__item_show");
		else console.warn(`Description with data-slide-index="${targetSlideIndex}" not found.`);
	};

	$currCarousel.owlCarousel({
		items: Math.min(sliderDefaultItems, $currCarousel.find(".slider__slide").length),
		center: true,
		loop: true,
		autoplay: isAutoplay,
		autoplayTimeout: 2000,
		autoplaySpeed: 1000,
		mouseDrag: isScrolling,
		touchDrag: isScrolling,
		responsiveClass: true,
		// responsive: { // Define responsive breakpoints
		// 	0: { items: 1 },
		// 	576: { items: 3 },
		// 	992: { items: 5 },
		// },
		dots: false,
		onInitialized: syncDescription,
		onTranslate: syncDescription
	});

	// Add event listeners to the navigation buttons for the current carousel
	$parentSlider.find(".owl-prev-slide").click(() => $currCarousel.trigger("prev.owl.carousel"));
	$parentSlider.find(".owl-next-slide").click(() => $currCarousel.trigger("next.owl.carousel"));
};



