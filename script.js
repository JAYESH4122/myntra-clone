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
                <span class="arrow-left"></span> Previousf
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

  //mobile-view js

  document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.getElementById("filter-btn");
  const filterSection = document.getElementById("filter-section");
  const closeBtn = document.getElementById('close-btn');
  const overlay = document.getElementById("overlay");
  const filterCategories = document.querySelectorAll(".filter-category");
  const filterValuesContainer = document.querySelector(".filter-values");
  const applyBtn = document.getElementById("apply-btn");
  const productList = document.getElementById("mobile-product-list");

  let allProducts = [];
  let filters = {
    gender: [],
    categories: [],
    size: [],
    price: [],
    brand: [],
    color: [],
    discount: [],
  };

  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      allProducts = Array.isArray(data.products) ? data.products : [data];
      renderProducts(allProducts);
      populateFilters();
    });

  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      const headerMainTitle = document.getElementById("header-main-title");
      headerMainTitle.innerHTML = `
        <span>${data.nav.mainTitle}</span><br>
        <span>${data.nav.subTitle}</span>
      `;
    });

  filterBtn.addEventListener("click", () => {
    filterSection.classList.add("show");
    overlay.classList.add("show");
  });

  const closeFilter = () => {
    filterSection.classList.remove("show");
    overlay.classList.remove("show");
  };

  
  closeBtn.addEventListener('click', closeFilter)
  overlay.addEventListener("click", closeFilter);

  filterCategories.forEach((category) => {
    category.addEventListener("click", () => {
      filterCategories.forEach((c) => c.classList.remove("active"));
      category.classList.add("active");
      const filterType = category.dataset.filter;
      renderFilterValues(filterType);
    });
  });

  const populateFilters = () => {
    const gender = [...new Set(allProducts.map((p) => p.gender))];
    const categories = [...new Set(allProducts.map((p) => p.category))];
    const size = [...new Set(allProducts.flatMap((p) => p.sizes))];
    const brand = [...new Set(allProducts.map((p) => p.brand))];
    const color = [...new Set(allProducts.map((p) => p.color))];

    filters.gender = gender;
    filters.categories = categories;
    filters.size = size;
    filters.brand = brand;
    filters.color = color;

    renderFilterValues("gender");
  };

  const renderFilterValues = (filterType) => {
    filterValuesContainer.innerHTML = "";
    if (filters[filterType]) {
      filters[filterType].forEach((value) => {
        const checkbox = document.createElement("label");
        checkbox.innerHTML = `
          <input type="checkbox" value="${value}" data-filter-type="${filterType}">
          ${value}
        `;
        filterValuesContainer.appendChild(checkbox);
      });
    }
  };

  applyBtn.addEventListener("click", () => {
    const selectedFilters = {
      gender: [],
      categories: [],
      size: [],
      price: [],
      brand: [],
      color: [],
      discount: [],
    };

    document
      .querySelectorAll('.filter-values input[type="checkbox"]:checked')
      .forEach((input) => {
        const filterType = input.dataset.filterType;
        selectedFilters[filterType].push(input.value);
      });

    const filteredProducts = allProducts.filter((product) => {
      return (
        (selectedFilters.gender.length === 0 ||
          selectedFilters.gender.includes(product.gender)) &&
        (selectedFilters.categories.length === 0 ||
          selectedFilters.categories.includes(product.category)) &&
        (selectedFilters.size.length === 0 ||
          product.sizes.some((s) => selectedFilters.size.includes(s))) &&
        (selectedFilters.brand.length === 0 ||
          selectedFilters.brand.includes(product.brand)) &&
        (selectedFilters.color.length === 0 ||
          selectedFilters.color.includes(product.color))
      );
    });

    renderProducts(filteredProducts);
    closeFilter();
  });
  const renderProducts = (products) => {
    productList.innerHTML = "";
    products.forEach((product) => {
      const li = document.createElement("li");
      li.className = "list-item-common right-border";
      li.innerHTML = `
      <div class="list-item-wrapper">
      <div class="product-image-container">
        <picture class="img-responsive" style="width: 100%;">
          <source srcset="${product.image}" type="image/webp">
          <img src="${product.image}" class="img-responsive preLoad loaded" alt="${product.alt}" title="${product.alt}" style="width: 100%;">
        </picture>
      </div>
      <div class="mobile-rating-container">
        <span class="rating-text">${product.rating}</span>
        <span></span>
        <span>|</span>
        <span class="rating-text">${product.ratingCount}</span>
      </div>
      <div class="mobile-product-container">
        <div class="mobile-product-wrapper">
          <h3>${product.brand}</h3>
          <h4>${product.name}</h4>
          <div class="price-container">
            <span class="price">
              <svg width="17" height="17" viewBox="0 0 24 24" class="rupees" fill="#282C3F">
                <g fill="none" fill-rule="evenodd">
                  <path d="M0 0h24v24H0z" opacity="0"></path>
                  <path fill="#282C3F" d="M7 6.215h4.962v2.43H7.505L7.13 9.858h4.764a3.05 3.05 0 01-.827 1.539 2.99 2.99 0 01-2.022.895l-1.361-.003a.304.304 0 00-.214.519l6.717 6.779 1.697-.004-6.107-6.16a4.193 4.193 0 002.14-1.167 4.256 4.256 0 001.198-2.398h2.474l.376-1.215h-2.799v-2.43h3.496V5H7v1.215z"></path>
                </g>
              </svg>
              <span>${product.price}</span>
            </span>
            <span class="offer-price">
              <svg width="10" height="10" viewBox="0 0 9 10" class="strike-rupees">
                <g fill="#282C3F">
                  <path d="M1.951 5.845l3.91 3.602-.902.376L.7 5.845l.452-.711c.186-.005.392-.02.615-.048a5.2 5.2 0 001.347-.356c.218-.09.42-.201.604-.331.185-.13.345-.281.479-.455.134-.173.231-.371.29-.594H.865v-.841h3.644a1.759 1.759 0 00-.284-.667 1.826 1.826 0 00-.567-.512 2.964 2.964 0 00-.865-.332A5.22 5.22 0 001.63.882H.864V0h6.2v.882H4.18c.173.077.33.174.468.29a2.09 2.09 0 01.612.848c.064.162.11.325.137.489h1.668v.84H5.383a2.38 2.38 0 01-.43 1.03 3.095 3.095 0 01-.8.748 4.076 4.076 0 01-1.043.482 6.15 6.15 0 01-1.159.236z"></path>
                  <path d="M0 6.104v-.792h8.14v.792z"></path>
                </g>
              </svg>
              <span>${product.originalPrice}</span>
            </span>
            <span class="offer-percentage">(${product.discountPercentage}% OFF)</span>
          </div>
          <div class="space-between"></div>
        </div>
        <div class="favorite-div">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g fill="#3E4152">
                <path d="M8.1703,4.473425 C6.9537,4.473425 5.8134,4.946625 4.95975,5.805525 C4.10435,6.666175 3.63325,7.815575 3.63325,9.042675 C3.63325,10.269775 4.10435,11.419525 4.95975,12.280175 L12,19.362425 L19.0406,12.279825 C19.89565,11.419525 20.36675,10.270125 20.36675,9.042675 C20.36675,7.815575 19.89565,6.665825 19.0406,5.805875 C19.0406,5.805875 19.0406,5.805525 19.04025,5.805525 C18.1866,4.946625 17.0463,4.473425 15.8297,4.473425 C14.6138,4.473425 13.4742,4.946275 12.62055,5.804475 C12.29225,6.134525 11.70845,6.134875 11.3798,5.804475 C10.5258,4.946275 9.3862,4.473425 8.1703,4.473425 L8.1703,4.473425 Z M12.02835,21.276575 L11.972,21.276575 C11.6304,21.276575 11.2965,21.137625 11.05605,20.895075 L3.71865,13.513925 C2.53495,12.323225 1.88325,10.735275 1.88325,9.042675 C1.88325,7.350075 2.53495,5.762475 3.71865,4.571775 C4.9034,3.379675 6.48435,2.723425 8.1703,2.723425 C9.5759,2.723425 10.90905,3.179825 12,4.022625 C13.0913,3.179825 14.4241,2.723425 15.8297,2.723425 C17.516,2.723425 19.09695,3.379675 20.2817,4.572125 C21.46505,5.762475 22.11675,7.350075 22.11675,9.042675 C22.11675,10.735625 21.46505,12.323225 20.2817,13.513925 L12.94325,20.895775 C12.6993,21.141475 12.3745,21.276575 12.02835,21.276575 L12.02835,21.276575 Z"></path>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
      `;
      productList.appendChild(li);
    });
  };
});
