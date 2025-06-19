fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
        const navbar = document.getElementById("desktop-navbar");

        navbar.innerHTML = data.navbarItems
            .map((item, index) => {
                const isLast = index === data.navbarItems.length - 1;
                return `<a href="#">${item}${isLast ? "<span>new</span>" : ""}</a>`;
            })
            .join("");

        const labels = data.desktopActions;
        const menuItems = document.querySelectorAll(".menu-item");

        menuItems.forEach((item, index) => {
            const textSpan = item.querySelectorAll("span")[1];
            if (textSpan) {
                textSpan.textContent = labels[index];
            }
        });

        const SectionsList = document.getElementById("section-list");
        const Sections = data.sections;

        SectionsList.innerHTML = Sections.map((item, index) => {
            const isLast = index === Sections.length - 1;
            return `<li>${item}${!isLast ? "<span>/</span>" : ""}</li>`;
        }).join("");

        const titleData = data.dressSectionTitle;

        document.getElementById("section-title").textContent = titleData.title;
        document.getElementById(
            "item-count"
        ).textContent = ` - ${titleData.count} items`;

        document.getElementById("filter-heading").textContent = data.filterText;

        const genderDiv = document.getElementById("gender-div");

        const genderHTML = `
  <ul>
    ${data.genders
      .map(
        (gender) => `
      <li>
        <label class="gender-label">
          <input type="radio" name="gender">${gender}
          <div class="common-radio"></div>
        </label>
      </li>
    `
      )
      .join("")}
  </ul>
`;

        genderDiv.innerHTML = genderHTML;

        document.getElementById("category-heading").textContent =
            data.filterHeading[0];

        const categoryList = document.getElementById("categories-list");

        categoryList.innerHTML = data.categoriesList
            .map(
                (cat) => `
        <li>
          <label class="gender-label label-common">
            <input type="checkbox" />
            ${cat.label}
            <span>(${cat.count})</span>
            <div class="common-checkbox"></div>
          </label>
        </li>
      `
            )
            .join("");

        document.getElementById("brand-heading").textContent =
            data.filterHeading[1];

        const brandsList = document.getElementById("brandsList");
        brandsList.innerHTML = data.brandsList
            .map(
                (brand) => `
        <li>
          <label class="gender-label label-common">
            <input type="checkbox" />
            ${brand.label}
            <span>(${brand.count})</span>
            <div class="common-checkbox"></div>
          </label>
        </li>
      `
            )
            .join("");

        document.getElementById("brandMore").textContent = data.countOfBrands;

        document.getElementById("priceHeading").textContent = data.filterHeading[2];

        const thumbLeft = document.getElementById("thumbLeft");
        const thumbRight = document.getElementById("thumbRight");
        const sliderRange = document.getElementById("sliderRange");
        const sliderRail = document.getElementById("sliderRail");
        const priceSliderCount = document.getElementById("priceSliderCount");

        const MIN_PRICE = 100;
        const MAX_PRICE = 10100;
        const SLIDER_WIDTH = 200;

        let isDraggingLeft = false;
        let isDraggingRight = false;

        const railRect = () => sliderRail.getBoundingClientRect();

        thumbLeft.addEventListener("mousedown", () => (isDraggingLeft = true));
        thumbRight.addEventListener("mousedown", () => (isDraggingRight = true));

        document.addEventListener("mouseup", () => {
            isDraggingLeft = false;
            isDraggingRight = false;
        });

        document.addEventListener("mousemove", (e) => {
            const rail = railRect();
            const min = 0;
            const max = rail.width;
            let x = e.clientX - rail.left;

            if (isDraggingLeft) {
                x = Math.max(
                    min,
                    Math.min(x, parseInt(thumbRight.style.left || max + "px"))
                );
                thumbLeft.style.left = x + "px";
            }

            if (isDraggingRight) {
                x = Math.min(
                    max,
                    Math.max(x, parseInt(thumbLeft.style.left || min + "px"))
                );
                thumbRight.style.left = x + "px";
            }

            updateRange();
        });

        function updateRange() {
            const left = parseInt(thumbLeft.style.left || "0");
            const right = parseInt(thumbRight.style.left || SLIDER_WIDTH + "px");

            const min = Math.min(left, right);
            const max = Math.max(left, right);

            sliderRange.style.left = min + "px";
            sliderRange.style.width = max - min + "px";

            const priceMin = Math.round(
                (min / SLIDER_WIDTH) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE
            );
            const priceMax = Math.round(
                (max / SLIDER_WIDTH) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE
            );

            priceSliderCount.textContent = `₹${priceMin.toLocaleString()} - ₹${
        priceMax >= MAX_PRICE
          ? MAX_PRICE.toLocaleString() + "+"
          : priceMax.toLocaleString()
      }`;
        }

        thumbLeft.style.left = "0px";
        thumbRight.style.left = SLIDER_WIDTH + "px";
        updateRange();

        document.getElementById("colorHeading").textContent = data.filterHeading[3];

        const colorList = document.getElementById("colorList");

        colorList.innerHTML = data.colorList
            .map(
                (color) => `
    <li>
      <label class="gender-label label-common">
        <span class="color-span" style="background-color: ${color.bgcolor}"></span>
        ${color.label}
        <span class="color-count-span">(${color.count})</span>
        <input type="checkbox" />
        <div class="common-checkbox"></div>
      </label>
    </li>
  `
            )
            .join("");

        document.getElementById("discountHeading").textContent =
            data.filterHeading[4];

        const discountList = document.getElementById("discount-list");

        discountList.innerHTML = data.discountRange
            .map(
                (range) => `
      <li>
      <label class="gender-label label-common">
        <input type="checkbox" />
        ${range}
        <div class="common-radio"></div>
      </label>
      </li>`
            )
            .join("");

        document.getElementById("sortByText").textContent = data.sortBy;

        const topFiltersList = document.getElementById("topFiltersList");
        topFiltersList.innerHTML = data.topFilters
            .map(
                (filter) => `
        <li>
          <label>
            <h4>${filter}</h4>
            <span></span>
          </label>
        </li>
      `
            )
            .join("");

        const productList = document.getElementById("productList");

        productList.innerHTML = data.products
            .map(
                (product) => `
        <li>
          <div class="product-slide"></div>
          <div class="rating-container">
            <span>${product.rating}</span>
            <span></span>
            <div class="rating-count">
              <div class="rating-seperator">|</div>
              ${product.ratingCount}
            </div>
          </div>
          <a class="card-container">
            <div class="product-image-slider-container">
              <div class="product-image-slider-wrapper">
                <div class="image-slider-bg">
                  <img
                    draggable="false"
                    src="${product.image}"
                    alt="${product.alt}"
                    title="${product.alt}"
                    class="img-responsive"
                    style="width: 100%; height: 100%; display: block"
                  />
                </div>
              </div>
            </div>
            <div class="product-info-container">
              <h3 class="product-common-brand">${product.brand}</h3>
              <h4 class="product-name">${product.name}</h4>
              <h4 class="product-sizes">
                Sizes: <span>${product.sizes.join(", ")}</span>
              </h4>
              <div class="product-rate-container">
                <span class="price-and-discount-span">
                  <span>Rs. ${product.price}</span>
                  <span>Rs. ${product.originalPrice}</span>
                </span>
                <span class="discount">(Rs. ${product.discount} OFF)</span>
              </div>
            </div>
          </a>
        </li>
      `
            )
            .join("");

        const leftSection = document.querySelector(".left-section-wrapper");
        const rightContainer = document.querySelector(".right-container");

        leftSection.style.width = "252px";
        leftSection.style.minWidth = "252px";
        leftSection.style.zIndex = "4";
        leftSection.style.marginBottom = "10px";

        const fixedTopPosition = 420;
        const releasePosition = 3136;

        function handleScroll() {
            const scrollY = window.scrollY || window.pageYOffset;

            if (scrollY >= fixedTopPosition && scrollY < releasePosition) {
                leftSection.style.position = "fixed";
                leftSection.style.top = "-120px";
                leftSection.style.bottom = "auto";
            } else if (scrollY >= releasePosition) {
                leftSection.style.position = "absolute";
                leftSection.style.top = releasePosition + "px";
                leftSection.style.bottom = "auto";
            } else {
                leftSection.style.position = "relative";
                leftSection.style.top = "auto";
                leftSection.style.bottom = "auto";
            }
        }

        window.addEventListener("scroll", handleScroll);

        handleScroll();
    })

    .catch((err) => console.error("Error loading data:", err));