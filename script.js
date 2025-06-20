fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    const PRODUCTS_PER_PAGE = 50;
    let currentPage = 1;
    const allProducts = data.products;
    let filteredProducts = [...allProducts];
    let totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const activeFilters = {
      gender: null,
      categories: [],
      brands: [],
      colors: [],
      price: { min: 100, max: 10100, isDefault: true },
      discount: null,
    };

    const navbar = document.getElementById("desktop-navbar");
    const menuItems = document.querySelectorAll(".menu-item");
    const sectionsList = document.getElementById("section-list");
    const productList = document.getElementById("productList");
    const paginationContainer = document.getElementById("paginationContainer");

    function applyFiltersAndRender() {
      let result = [...allProducts];

      if (activeFilters.gender) {
        result = result.filter((p) => p.gender === activeFilters.gender);
      }

      if (activeFilters.categories.length > 0) {
        result = result.filter((p) =>
          activeFilters.categories.includes(p.category)
        );
      }

      if (activeFilters.brands.length > 0) {
        result = result.filter((p) => activeFilters.brands.includes(p.brand));
      }

      if (activeFilters.colors.length > 0) {
        result = result.filter((p) => activeFilters.colors.includes(p.color));
      }

      if (!activeFilters.price.isDefault) {
        result = result.filter(
          (p) =>
            p.price >= activeFilters.price.min &&
            p.price <= activeFilters.price.max
        );
      }

      if (activeFilters.discount) {
        result = result.filter((p) => {
          const discount = Math.round(
            ((p.originalPrice - p.price) / p.originalPrice) * 100
          );
          return discount >= activeFilters.discount;
        });
      }

      filteredProducts = result;
      document.getElementById("item-count").textContent = ` - ${filteredProducts.length} items`;
      totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
      currentPage = 1;

      renderProducts();
      renderPagination();
      updateActiveFiltersUI();
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    function renderProducts() {
      const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const endIndex = Math.min(
        startIndex + PRODUCTS_PER_PAGE,
        filteredProducts.length
      );
      const productsToShow = filteredProducts.slice(startIndex, endIndex);

      if (productsToShow.length === 0) {
        productList.innerHTML = `<div class="no-results"><h3>No products found matching your criteria.</h3><p>Try removing some filters.</p></div>`;
        return;
      }

      productList.innerHTML = productsToShow
        .map(
          (product) => `
            <li>
                <div class="product-slide"></div>
                <div class="rating-container">
                    <span>${product.rating}</span><span></span>
                    <div class="rating-count"><div class="rating-seperator">|</div>${product.ratingCount}</div>
                </div>
                <a class="card-container">
                    <div class="product-image-slider-container">
                        <div class="image-slider-bg">
                            <img draggable="false" src="${product.image}" alt="${product.alt}" title="${product.alt}" class="img-responsive" style="width: 100%; height: 100%; display: block"/>
                        </div>
                    </div>
                    <div class="product-info-container">
                        <h3 class="product-common-brand">${product.brand}</h3>
                        <h4 class="product-name">${product.name}</h4>
                        <h4 class="product-sizes">Sizes: <span>${product.sizes.join(", ")}</span></h4>
                        <div class="product-rate-container">
                            <span class="price-and-discount-span">
                                <span>Rs. ${product.price}</span>
                                <span>Rs. ${product.originalPrice}</span>
                            </span>
                            <span class="discount">(${Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100
                            )}% OFF)</span>
                        </div>
                    </div>
                </a>
            </li>`
        )
        .join("");
    }

    function renderPagination() {
      if (totalPages <= 1) {
        paginationContainer.innerHTML = "";
        return;
      }

      paginationContainer.innerHTML = `
            <li class="page-no-switch-div ${currentPage === 1 ? "disabled" : ""}" id="firstPageBtn">
                <span class="left-arrow-span"></span> Page 1
            </li>
            <li class="previous-switch page-no-switch-div ${currentPage === 1 ? "disabled" : ""}" id="prevPageBtn">
                <span class="arrow-left"></span> Previous
            </li>
            <li class="page-nos">Page ${currentPage} of ${totalPages}</li>
            <li class="next-div ${currentPage === totalPages ? "disabled" : ""}" id="nextPageBtn">
                Next <span class="right-arrow"></span>
            </li>`;

      const firstPageBtn = document.getElementById("firstPageBtn");
      const prevPageBtn = document.getElementById("prevPageBtn");
      const nextPageBtn = document.getElementById("nextPageBtn");

      if (firstPageBtn && !firstPageBtn.classList.contains("disabled")) {
        firstPageBtn.addEventListener("click", goToFirstPage);
      }
      if (prevPageBtn && !prevPageBtn.classList.contains("disabled")) {
        prevPageBtn.addEventListener("click", goToPreviousPage);
      }
      if (nextPageBtn && !nextPageBtn.classList.contains("disabled")) {
        nextPageBtn.addEventListener("click", goToNextPage);
      }
    }

    function updateActiveFiltersUI() {
      const container = document.getElementById("activeFiltersContainer");
      container.innerHTML = "";

      const filterTextDiv = document.querySelector(".filter-text-div");
      let clearAllBtn = filterTextDiv.querySelector(".clear-all-btn");

      if (hasActiveFilters()) {
        container.style.display = "flex";

        if (!clearAllBtn) {
          clearAllBtn = document.createElement("button");
          clearAllBtn.className = "clear-all-btn";
          clearAllBtn.textContent = "CLEAR ALL";
          clearAllBtn.addEventListener("click", () => {
            clearAllFilters();
            updateActiveFiltersUI();
          });
          filterTextDiv.appendChild(clearAllBtn);
        }
      } else if (clearAllBtn) {
        clearAllBtn.remove();
      } else {
        container.style.display = "none";
      }

      if (activeFilters.gender) {
        createFilterTag("Gender", activeFilters.gender, () => {
          const radio = document.querySelector(
            `#gender-div input[value="${activeFilters.gender}"]`
          );
          if (radio) radio.checked = false;
          activeFilters.gender = null;
          applyFiltersAndRender();
        });
      }

      activeFilters.categories.forEach((category) => {
        createFilterTag("Category", category, () => {
          const checkbox = document.querySelector(
            `#categories-list input[value="${category}"]`
          );
          if (checkbox) checkbox.checked = false;
          activeFilters.categories = activeFilters.categories.filter(
            (c) => c !== category
          );
          applyFiltersAndRender();
        });
      });

      activeFilters.brands.forEach((brand) => {
        createFilterTag("Brand", brand, () => {
          const checkbox = document.querySelector(
            `#brandsList input[value="${brand}"]`
          );
          if (checkbox) checkbox.checked = false;
          activeFilters.brands = activeFilters.brands.filter(
            (b) => b !== brand
          );
          applyFiltersAndRender();
        });
      });

      activeFilters.colors.forEach((color) => {
        createFilterTag("Color", color, () => {
          const checkbox = document.querySelector(
            `#colorList input[value="${color}"]`
          );
          if (checkbox) checkbox.checked = false;
          activeFilters.colors = activeFilters.colors.filter(
            (c) => c !== color
          );
          applyFiltersAndRender();
        });
      });

      if (!activeFilters.price.isDefault) {
        const priceText = `₹${activeFilters.price.min} - ₹${
          activeFilters.price.max === Infinity
            ? "10000+"
            : activeFilters.price.max
        }`;
        createFilterTag("Price", priceText, () => {
          resetPriceFilter();
        });
      }

      if (activeFilters.discount) {
        createFilterTag(
          "Discount",
          `${activeFilters.discount}% and above`,
          () => {
            const radio = document.querySelector(
              `#discount-list input[value="${activeFilters.discount}"]`
            );
            if (radio) radio.checked = false;
            activeFilters.discount = null;
            applyFiltersAndRender();
          }
        );
      }
    }

    function createFilterTag(label, value, onClick) {
      const container = document.getElementById("activeFiltersContainer");
      const tag = document.createElement("div");
      tag.className = "active-filter-tag";
      tag.innerHTML = `
            <span> ${value}</span>
            <span class="clear-filter">×</span>
        `;
      tag.querySelector(".clear-filter").addEventListener("click", onClick);
      container.appendChild(tag);
    }

    function hasActiveFilters() {
      return (
        activeFilters.gender !== null ||
        activeFilters.categories.length > 0 ||
        activeFilters.brands.length > 0 ||
        activeFilters.colors.length > 0 ||
        !activeFilters.price.isDefault ||
        activeFilters.discount !== null
      );
    }

    function clearAllFilters() {
      document
        .querySelectorAll('#gender-div input[type="radio"]')
        .forEach((radio) => {
          radio.checked = false;
        });
      document
        .querySelectorAll('#categories-list input[type="checkbox"]')
        .forEach((cb) => {
          cb.checked = false;
        });
      document
        .querySelectorAll('#brandsList input[type="checkbox"]')
        .forEach((cb) => {
          cb.checked = false;
        });
      document
        .querySelectorAll('#colorList input[type="checkbox"]')
        .forEach((cb) => {
          cb.checked = false;
        });
      document
        .querySelectorAll('#discount-list input[type="radio"]')
        .forEach((radio) => {
          radio.checked = false;
        });

      activeFilters.gender = null;
      activeFilters.categories = [];
      activeFilters.brands = [];
      activeFilters.colors = [];
      activeFilters.discount = null;

      const thumbLeft = document.getElementById("thumbLeft");
      const thumbRight = document.getElementById("thumbRight");
      const sliderRange = document.getElementById("sliderRange");
      const priceSliderCount = document.getElementById("priceSliderCount");

      thumbLeft.style.left = "0px";
      thumbRight.style.left = "200px";
      sliderRange.style.left = "0px";
      sliderRange.style.width = "200px";
      activeFilters.price = { min: 100, max: 10100, isDefault: true };
      priceSliderCount.textContent = "₹100 - ₹10100";

      applyFiltersAndRender();
      resetPriceFilter();
    }

    function setupPriceSlider() {
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

      const handleDragEnd = () => {
        if (isDraggingLeft || isDraggingRight) {
          isDraggingLeft = false;
          isDraggingRight = false;
          if (
            parseInt(thumbLeft.style.left) !== 0 ||
            parseInt(thumbRight.style.left) !== SLIDER_WIDTH
          ) {
            activeFilters.price.isDefault = false;
          }
          applyFiltersAndRender();
        }
      };

      thumbLeft.addEventListener("mousedown", () => (isDraggingLeft = true));
      thumbRight.addEventListener("mousedown", () => (isDraggingRight = true));
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("mouseleave", handleDragEnd);

      document.addEventListener("mousemove", (e) => {
        if (!isDraggingLeft && !isDraggingRight) return;

        const rail = railRect();
        const min = 0;
        const max = rail.width;
        let x = e.clientX - rail.left;

        if (isDraggingLeft) {
          const rightPos = parseInt(thumbRight.style.left || max + "px");
          x = Math.max(min, Math.min(x, rightPos));
          thumbLeft.style.left = x + "px";
        }

        if (isDraggingRight) {
          const leftPos = parseInt(thumbLeft.style.left || min + "px");
          x = Math.min(max, Math.max(x, leftPos));
          thumbRight.style.left = x + "px";
        }

        updateRange();
      });

      function updateRange() {
        const left = parseInt(thumbLeft.style.left || "0");
        const right = parseInt(thumbRight.style.left || SLIDER_WIDTH + "px");

        const minPos = Math.min(left, right);
        const maxPos = Math.max(left, right);

        sliderRange.style.left = minPos + "px";
        sliderRange.style.width = maxPos - minPos + "px";

        const priceMin = Math.round(
          (minPos / SLIDER_WIDTH) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE
        );
        const priceMax = Math.round(
          (maxPos / SLIDER_WIDTH) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE
        );

        activeFilters.price.min = priceMin;
        activeFilters.price.max = priceMax >= MAX_PRICE ? Infinity : priceMax;

        priceSliderCount.textContent = `₹${priceMin.toLocaleString()} - ₹${
          priceMax >= MAX_PRICE
            ? MAX_PRICE.toLocaleString() + "+"
            : priceMax.toLocaleString()
        }`;
      }

      function resetPriceFilter() {
        thumbLeft.style.left = "0px";
        thumbRight.style.left = SLIDER_WIDTH + "px";
        activeFilters.price = { min: 100, max: 10100, isDefault: true };
        priceSliderCount.textContent = "₹100 - ₹10100";
        updateRange();
        applyFiltersAndRender();
      }

      thumbLeft.style.left = "0px";
      thumbRight.style.left = SLIDER_WIDTH + "px";
      updateRange();
    }

    function goToFirstPage() {
      if (currentPage > 1) {
        currentPage = 1;
        updatePage();
      }
    }

    function goToPreviousPage() {
      if (currentPage > 1) {
        currentPage--;
        updatePage();
      }
    }

    function goToNextPage() {
      if (currentPage < totalPages) {
        currentPage++;
        updatePage();
      }
    }

    function updatePage() {
      renderProducts();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function initializeUI() {
      navbar.innerHTML = data.navbarItems
        .map((item, index) => {
          const isLast = index === data.navbarItems.length - 1;
          return `<a href="#">${item}${isLast ? "<span>new</span>" : ""}</a>`;
        })
        .join("");

      const labels = data.desktopActions;
      menuItems.forEach((item, index) => {
        const textSpan = item.querySelectorAll("span")[1];
        if (textSpan) textSpan.textContent = labels[index];
      });

      sectionsList.innerHTML = data.sections
        .map((item, index) => {
          const isLast = index === data.sections.length - 1;
          return `<li>${item}${!isLast ? "<span>/</span>" : ""}</li>`;
        })
        .join("");

      const titleData = data.dressSectionTitle;
      document.getElementById("section-title").textContent = titleData.title;
      document.getElementById("item-count").textContent = ` - ${filteredProducts.length} items`;
      document.getElementById("filter-heading").textContent = data.filterText;
      document.getElementById("category-heading").textContent = data.filterHeading[0];
      document.getElementById("brand-heading").textContent = data.filterHeading[1];
      document.getElementById("priceHeading").textContent = data.filterHeading[2];
      document.getElementById("colorHeading").textContent = data.filterHeading[3];
      document.getElementById("discountHeading").textContent = data.filterHeading[4];

      const genderDiv = document.getElementById("gender-div");
      genderDiv.innerHTML = `<ul>${data.genders
        .map(
          (gender) => `
                <li><label class="gender-label">
                    <input type="radio" name="gender" value="${gender}">${gender}
                    <div class="common-radio"></div>
                </label></li>`
        )
        .join("")}</ul>`;

      const categoryList = document.getElementById("categories-list");
      categoryList.innerHTML = data.categoriesList
        .map(
          (cat) => `
                <li><label class="gender-label label-common">
                    <input type="checkbox" value="${cat.label}"/>
                    ${cat.label} <span>(${cat.count})</span>
                    <div class="common-checkbox"></div>
                </label></li>`
        )
        .join("");

      const brandsList = document.getElementById("brandsList");
      brandsList.innerHTML = data.brandsList
        .map(
          (brand) => `
                <li><label class="gender-label label-common">
                    <input type="checkbox" value="${brand.label}"/>
                    ${brand.label} <span>(${brand.count})</span>
                    <div class="common-checkbox"></div>
                </label></li>`
        )
        .join("");

      document.getElementById("brandMore").textContent = data.countOfBrands;

      setupPriceSlider();

      const colorList = document.getElementById("colorList");
      colorList.innerHTML = data.colorList
        .map(
          (color) => `
                <li><label class="gender-label label-common">
                    <span class="color-span" style="background-color: ${color.bgcolor}"></span>
                    ${color.label} <span class="color-count-span">(${color.count})</span>
                    <input type="checkbox" value="${color.label}"/>
                    <div class="common-checkbox"></div>
                </label></li>`
        )
        .join("");

      const discountList = document.getElementById("discount-list");
      discountList.innerHTML = data.discountRange
        .map(
          (range) => `
                <li><label class="gender-label label-common">
                    <input type="radio" name="discount" value="${parseInt(range)}"/>
                    ${range}
                    <div class="common-radio"></div>
                </label></li>`
        )
        .join("");

      document.getElementById("sortByText").textContent = data.sortBy;
      const topFiltersList = document.getElementById("topFiltersList");
      topFiltersList.innerHTML = data.topFilters
        .map(
          (filter) => `
                <li><label><h4>${filter}</h4><span></span></label></li>`
        )
        .join("");

      setupFilterEventListeners();
      setupStickySidebar();

      renderProducts();
      renderPagination();
      updateActiveFiltersUI();
    }

    function setupFilterEventListeners() {
      document
        .querySelectorAll('#gender-div input[name="gender"]')
        .forEach((radio) => {
          radio.addEventListener("change", (e) => {
            activeFilters.gender = e.target.checked ? e.target.value : null;
            applyFiltersAndRender();
          });
        });

      document
        .querySelectorAll('#categories-list input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
              activeFilters.categories.push(e.target.value);
            } else {
              activeFilters.categories = activeFilters.categories.filter(
                (cat) => cat !== e.target.value
              );
            }
            applyFiltersAndRender();
          });
        });

      document
        .querySelectorAll('#brandsList input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
              activeFilters.brands.push(e.target.value);
            } else {
              activeFilters.brands = activeFilters.brands.filter(
                (brand) => brand !== e.target.value
              );
            }
            applyFiltersAndRender();
          });
        });

      document
        .querySelectorAll('#colorList input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
              activeFilters.colors.push(e.target.value);
            } else {
              activeFilters.colors = activeFilters.colors.filter(
                (color) => color !== e.target.value
              );
            }
            applyFiltersAndRender();
          });
        });

      document
        .querySelectorAll('#discount-list input[name="discount"]')
        .forEach((radio) => {
          radio.addEventListener("change", (e) => {
            activeFilters.discount = e.target.checked
              ? parseInt(e.target.value)
              : null;
            applyFiltersAndRender();
          });
        });
    }

    function setupStickySidebar() {
      const leftSection = document.querySelector(".left-section-wrapper");
      const header = document.querySelector("header");
      const rightTopRow = document.querySelector(".right-top-row");

      function handleScroll() {
        const headerHeight = header.offsetHeight;
        const rightTopRowHeight = rightTopRow.offsetHeight;
        const fixedTopPosition = headerHeight + rightTopRowHeight;

        const footer = document.querySelector(".footer-container");
        const footerPosition = footer.offsetTop;
        const leftSectionHeight = leftSection.offsetHeight;

        const scrollY = window.scrollY || window.pageYOffset;

        if (scrollY >= fixedTopPosition) {
          const stopPosition = footerPosition - leftSectionHeight - 20;
          if (scrollY < stopPosition) {
            leftSection.style.position = "fixed";
            leftSection.style.top = `${rightTopRowHeight}px`;
          } else {
            leftSection.style.position = "absolute";
            leftSection.style.top = `${stopPosition}px`;
          }
        } else {
          leftSection.style.position = "relative";
          leftSection.style.top = "auto";
        }
      }
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    initializeUI();
  })
  .catch((err) => console.error("Error loading data:", err));