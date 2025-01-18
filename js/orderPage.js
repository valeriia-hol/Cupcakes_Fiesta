// Structured product data
const productData = {
	flavour: [
		{ id: 1, name: "Maple Bacon Bliss", imagePath: "images/common/slider-items/flavor/item-1.png" },
		{ id: 2, name: "Peach Paradise Cupcake", imagePath: "images/common/slider-items/flavor/item-2.png" },
		{ id: 3, name: "Lavender Honey Cupcake", imagePath: "images/common/slider-items/flavor/item-3.png" },
		{ id: 4, name: "Blue Cheese & Fig Fantasy", imagePath: "images/common/slider-items/flavor/item-4.png" },
		{ id: 5, name: "Raspberry Rosewater", imagePath: "images/common/slider-items/flavor/item-5.png" }
	],
	topping: [
		{ id: 1, name: "Caramel Drizzle", imagePath: "images/common/slider-items/toppings/item-1.png" },
		{ id: 2, name: "Chocolate Ganache", imagePath: "images/common/slider-items/toppings/item-2.png" },
		{ id: 3, name: "Whipped Cream", imagePath: "images/common/slider-items/toppings/item-3.png" }
	],
	decoration: [
		{ id: 1, name: "Sprinkles", imagePath: "images/common/slider-items/decorations/item-1.png" },
		{ id: 2, name: "Edible Flowers", imagePath: "images/common/slider-items/decorations/item-2.png" },
		{ id: 3, name: "Gold Leaf", imagePath: "images/common/slider-items/decorations/item-3.png" }
	],
	presentation: [
		{ id: 1, name: "Standard Cupcakes", imagePath: "images/common/presentation-box/item-1.jpg" },
		{ id: 2, name: "Mini Cupcakes", imagePath: "images/common/presentation-box/item-2.jpg" },
		{ id: 3, name: "Cupcake Bouquet", imagePath: "images/common/presentation-box/item-3.jpg" }
	],
	quantity: [
		{ id: 1, name: "6" },
		{ id: 2, name: "12" },
		{ id: 3, name: "16" },
		{ id: 4, name: "20" },
		{ id: 5, name: "24" },
	],
	delivery: [
		{ id: 1, name: "Pickup method" },
		{ id: 2, name: "Delivery method" },
	],
	payment: [
		{ id: 1, name: "Cash" },
		{ id: 2, name: "Online by a credit card" },
		{ id: 3, name: "Online by Apple Pay" },
		{ id: 4, name: "Online via Pryvat 24" },
	],
};

// The OrderProcess class handles the entire ordering workflow, including step navigation, user selections, and submission
class OrderProcess {
	#userSelection = {};
	#currentStep = 1;
	#totalSteps = 7;
	#nextButton = document.getElementById("nextStepButton");
	#backButton = document.getElementById("backStepButton");

	constructor () {
		this.#initNavigationButtons();
		this.#initStepConfig();
		this.#toggleStep(this.#currentStep, true);
	}

	// Initializes the 'Next' and 'Back' buttons and sets up their event listeners
	#initNavigationButtons () {
		if (this.#nextButton) {
			this.#nextButton.addEventListener("click", () => this.#navigateStep(1));
			this.#nextButton.disabled = true;
		}
		if (this.#backButton) {
			this.#backButton.addEventListener("click", () => this.#navigateStep(-1));
			this.#backButton.style.visibility = "hidden";
		}
	}

	//
	#initSubmitButton (init = true) {
		const submitButton = document.getElementById("submitOrderButton");
		if (submitButton) {
			submitButton[init ? "addEventListener" : "removeEventListener"]("click", () => this.#submitOrder());
			submitButton.style.display = init ? "block" : "none";
		}
	}

	// Navigates between order steps, updating the current step number and toggling visibility
	#navigateStep (stepIncrement) {
		if (this.#currentStep + stepIncrement > this.#totalSteps || this.#currentStep + stepIncrement < 1) {
			return;
		}
		this.#toggleStep(this.#currentStep, false);
		this.#currentStep += stepIncrement;
		this.#initStepConfig();
		this.#toggleStep(this.#currentStep, true);
	}

	// Shows or hides the specified order step. It also initializes sliders if needed and updates the 'Next' button state
	#toggleStep (stepNumber, visible) {
		const stepElement = document.querySelector(`.order-page__step[data-step="${stepNumber}"]`);

		if (stepElement) {
			stepElement.style.display = visible ? "block" : "none";

			if (visible) {
				const { initializeSliders } = window.CupcakeFiestaApp;

				if (typeof initializeSliders !== "function") {
					console.error("Function initializeSliders is not available.");
					return;
				}

				this.#backButton.style.visibility = stepNumber > 1 ? "visible" : "hidden";

				initializeSliders(stepElement);
				this.#updateNextButtonState();
			}
		} else {
			console.warn(`Step element with data-step="${stepNumber}" not found.`);
		}
	}

	// Initializes the current step by setting up the step configuration and updating the summary for step 6
	#initStepConfig () {
		const stepConfig = this.#getStepConfig();
		if (stepConfig) this.#setupStep(stepConfig);
		else console.warn(`Configuration for step ${this.#currentStep} is not defined.`);

		this.#hideElementsByStep(this.#currentStep);

		if (this.#currentStep === 6) {
			this.#updateSummary();
			this.#initPromoCodeInput();
			this.#initSubmitButton();

		} else {
			this.#initSubmitButton(false);
		}
	}

	// Returns the configuration for the current step, including categories, box numbers, and event types
	#getStepConfig () {
		const stepConfigs = {
			1: { categories: ["flavour"], boxNumbers: [1], eventType: "click" },
			2: { categories: ["topping", "decoration"], boxNumbers: [2, 3], eventType: "click" },
			3: { categories: ["presentation"], boxNumbers: [4], eventType: "click" },
			4: { categories: ["quantity", "delivery"], eventType: "change" },
			5: { categories: ["notes"], eventType: "input" },
			6: { categories: ["payment"], eventType: "change" },
		};
		return stepConfigs[this.#currentStep];
	}

	#setupStep ({ categories, boxNumbers, eventType }) {
		categories.forEach((category, index) => {
			const selector = eventType === "click" ? `.add-button_${category}` : `.select_${category}`;
			const elements = document.querySelectorAll(selector);
			const boxNumber = boxNumbers?.[index];

			elements.forEach(element => {
				this.#processUserSelection(element, category, boxNumber, eventType);
			});
		});
	}

	// Processes user interactions with selection elements, updating the user selection and UI accordingly
	#processUserSelection (element, type, boxNumber, eventType) {
		// Sets default fields
		if (eventType !== "click" && element.checked) {
			this.#updateUserSelection(element, type);
		}

		element.addEventListener(eventType, (event) => {
			if (eventType === "input" && element.value) {
				element.value = this.#userSelection[type] = element.value.slice(0, 251);
				element.classList.toggle("select_error", element.value.length > 250);
				return;
			}

			const currElement = element.tagName === "SELECT" ? event.target.options[event.target.selectedIndex] : element;
			this.#updateUserSelection(currElement, type, boxNumber);
			this.#updateNextButtonState();
		});
	}

	// Updates the user selection with the chosen item's details and updates the UI if needed
	#updateUserSelection (element, type, boxNumber) {
		const selectedId = element.dataset[`${type}Id`];
		const selectedItem = productData[type]?.find(item => item.id.toString() === selectedId);

		if (!selectedItem) {
			console.error(`Invalid ${type} selected.`);
			return;
		}

		this.#userSelection[`${type}Id`] = selectedItem.id;
		this.#userSelection[`${type}Name`] = selectedItem.name;

		if (boxNumber !== undefined) {
			this.#updateSelectionBox(boxNumber, selectedItem.imagePath, selectedItem.name);
		}
	}

	// Updates the display box with the selected product's image and name
	#updateSelectionBox (boxNumber, imagePath, productName) {
		const orderBoxItems = document.querySelectorAll(`.order-box-item[data-order-box="${boxNumber}"]`);

		if (orderBoxItems.length === 0) {
			console.error(`Order box item for box number ${boxNumber} not found.`);
			return;
		}

		orderBoxItems.forEach(orderBoxItem => {
			const plusIcon = orderBoxItem.querySelector(".default-box-item");
			if (plusIcon) plusIcon.style.display = "none";

			const existingImage = orderBoxItem.querySelector(".chosen-box-item img");
			if (existingImage) existingImage.remove();

			const chosenBox = orderBoxItem.querySelector(".chosen-box-item");

			chosenBox.innerHTML = `
        <img src="${imagePath}" alt="Selected Item" class="product-image">
        <div class="product-name">${productName}</div>
      `;
		});
	}

	// Hides elements based on the current step
	#hideElementsByStep = (currentStep) => {
		// Find all elements that have a "data-hide-on" attribute
		const elements = document.querySelectorAll(`[data-hide-on]`);

		if (elements.length > 0) {
			elements.forEach((element) => {
				// Hide the element if the current step matches the "data-hide-on" attribute
				element.style.display = element.dataset.hideOn === `step-${currentStep}` ? "none" : "";
			});
		}
	};

	// Updates the order summary based on the user's selections
	#updateSummary () {
		const { quantityId, deliveryId, notes = "" } = this.#userSelection;
		const getTextContent = (data, id) => data.find(item => item.id === id)?.name || "";

		document.getElementById("getSummary").textContent = getTextContent(productData.quantity, quantityId);
		document.getElementById("getDelivery").textContent = getTextContent(productData.delivery, deliveryId);
		document.getElementById("getNotes").textContent = notes;
		this.#updateTotalAmount();
	}

	// Initializes the promo code input field, allowing users to enter and apply promo codes
	#initPromoCodeInput () {
		document.getElementById("getPromo")?.addEventListener("input", ({ target }) => {
			this.#userSelection.promoCode = target.value.trim();
			this.#updateTotalAmount();
		});
	}

	// Calculates and updates the total amount for the order, considering any applied promo codes
	#updateTotalAmount () {
		const { presentationId, quantityId, promoCode } = this.#userSelection;
		const pricePerCupcake = presentationId === 2 ? 60 : 120; // id 2 - mini cupcakes
		const quantity = +productData.quantity.find(({ id }) => id === quantityId)?.name || 0;
		let total = pricePerCupcake * quantity;
		const promoCodes = {
			"DISCOUNT5": 0.05,
			"DISCOUNT10": 0.10
		};

		if (promoCodes[promoCode]) {
			total *= (1 - promoCodes[promoCode]);
		}

		document.getElementById("getTotalAmount").textContent = `${total.toFixed(2)} UAH`;
	}

	// Updates the 'Next' button state based on whether the current step's requirements are met
	#updateNextButtonState () {
		if (this.#nextButton) {
			this.#nextButton.disabled = !this.#checkStepCompletion();
		}
	}

	// Checks if the current step is complete based on predefined rules
	#checkStepCompletion () {
		const {
			flavourId,
			toppingId,
			decorationId,
			presentationId,
			quantityId,
			deliveryId,
			paymentId
		} = this.#userSelection;
		const completionRules = {
			1: () => !!flavourId,
			2: () => !!toppingId && !!decorationId,
			3: () => !!presentationId,
			4: () => !!quantityId && !!deliveryId,
			5: () => true,
			6: () => !!paymentId,
		};

		return completionRules[this.#currentStep]?.() ?? true;
	}

	// Checks if all steps in the order process have been completed
	#isAllStepsCompleted () {
		return [
			"flavourId",
			"toppingId",
			"decorationId",
			"presentationId",
			"quantityId",
			"deliveryId",
			"paymentId"
		].every(field => this.#userSelection[field]);
	}

	// Submits the order to the server if all steps are completed
	#submitOrder () {
		if (!this.#isAllStepsCompleted()) {
			alert("Будь ласка, завершіть всі кроки перед відправкою замовлення.");
			return;
		}

		console.log("Submitting order:", this.#userSelection);
		this.#navigateStep(1);
		return;

		// fetch("/submit-order", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json"
		// 	},
		// 	body: JSON.stringify(this.#userSelection)
		// })
		// 	.then(response => response.json())
		// 	.then(data => {
		// 		console.log("Server response:", data);
		// 	})
		// 	.catch(error => console.error("Error:", error));
	}
}

// Initializes the OrderProcess instance when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
	new OrderProcess();
});
