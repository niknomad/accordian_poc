document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("positions-container");
  const max = 6;
  let previewMode = false;

  function createAccordion(i) {
    return `
      <div class="position" data-index="${i}">
        <div class="position-header">
          <span class="position-title">Position ${i + 1}</span>
          <div>
            <button class="toggle-btn">Edit ▼</button>
            <button class="remove-btn">🗑</button>
          </div>
        </div>
        <div class="position-form" style="display: none;">
          <div class="field-columns">
            <div class="column">
              <label>Company Name</label>
              <input type="text" />
              <label>Job Title</label>
              <input type="text" />
              <label>Industry</label>
              <select><option>Technology</option><option>Finance</option></select>
              <label>Job Summary</label>
              <textarea maxlength="500" class="summary"></textarea>
              <div class="character-count">Remaining: 500</div>
            </div>
            <div class="column">
              <label>Employment Country</label>
              <select><option>USA</option><option>Canada</option></select>
              <label>Employment City</label>
              <input type="text" />
              <label>Employment State</label>
              <input type="text" />
            </div>
            <div class="column">
              <div class="checkbox-row">
                <input type="checkbox" class="current-role" id="current-${i}" />
                <label for="current-${i}">Currently working in this role</label>
              </div>
              <label>Year Started</label>
              <input type="text" />
              <label>Year Left</label>
              <input type="text" class="year-left" />
            </div>
          </div>
        </div>
      </div>`;
  }

  function bindEvents(section) {
    const toggle = section.querySelector(".toggle-btn");
    const remove = section.querySelector(".remove-btn");
    const yearLeft = section.querySelector(".year-left");
    const checkbox = section.querySelector(".current-role");
    const textarea = section.querySelector(".summary");
    const count = section.querySelector(".character-count");
    const form = section.querySelector(".position-form");

    toggle.addEventListener("click", () => {
      const isOpen = form.style.display === "block";
      document.querySelectorAll(".position-form").forEach(f => f.style.display = "none");
      document.querySelectorAll(".toggle-btn").forEach(btn => btn.textContent = "Edit ▼");
      if (!isOpen) {
        form.style.display = "block";
        toggle.textContent = "Collapse ▲";
      }
    });

    remove.addEventListener("click", () => {
      section.remove();
      renumberAll();
    });

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        yearLeft.disabled = true;
        yearLeft.value = "Present";
      } else {
        yearLeft.disabled = false;
        yearLeft.value = "";
      }
    });

    textarea.addEventListener("input", () => {
      const remaining = 500 - textarea.value.length;
      count.textContent = `Remaining: ${remaining}`;
    });
  }

  function renumberAll() {
    [...container.children].forEach((section, i) => {
      section.setAttribute("data-index", i);
      section.querySelector(".position-title").textContent = `Position ${i + 1}`;
      const checkbox = section.querySelector(".current-role");
      const label = section.querySelector("label[for]");
      const newId = `current-${i}`;
      checkbox.id = newId;
      if (label) label.setAttribute("for", newId);
    });
  }

  function addAccordion() {
    const count = container.children.length;
    if (count >= max) return;
    container.insertAdjacentHTML("beforeend", createAccordion(count));
    bindEvents(container.lastElementChild);
  }

  function validateForm() {
    let valid = true;
    document.querySelectorAll(".position").forEach(section => {
      const requiredFields = section.querySelectorAll("input:not([type='checkbox']), textarea, select");
      requiredFields.forEach(field => {
        if (field.offsetParent !== null && field.value.trim() === "") {
          field.style.borderColor = "red";
          valid = false;
        } else {
          field.style.borderColor = "#ccc";
        }
      });
    });
    return valid;
  }

  function collectPayload() {
    const data = [];
    document.querySelectorAll(".position").forEach(section => {
      const inputs = section.querySelectorAll("input, textarea, select");
      const entry = {};
      inputs.forEach(input => {
        const name = input.previousElementSibling?.innerText?.toLowerCase().replace(/\s+/g, "_");
        if (input.type === "checkbox") {
          entry["currently_working"] = input.checked;
        } else if (name) {
          entry[name] = input.value;
        }
      });
      data.push(entry);
    });
    console.log("Payload:", JSON.stringify(data, null, 2));
    return data;
  }

  document.querySelector(".btn-primary:last-of-type").addEventListener("click", () => {
    if (!validateForm()) {
      alert("Please fill all required fields.");
      return;
    }
    const payload = collectPayload();
    alert("Data saved successfully. Check console for JSON.");
  });

  document.getElementById("toggle-preview").addEventListener("click", () => {
    previewMode = !previewMode;
    document.querySelectorAll(".position-form").forEach(form => {
      form.style.display = previewMode ? "none" : "block";
    });
    document.querySelectorAll(".position").forEach(section => {
      const inputs = section.querySelectorAll("input, textarea, select");
      const previewBlocks = section.querySelectorAll(".preview-block");
      if (previewMode) {
        inputs.forEach(input => (input.style.display = "none"));
        if (previewBlocks.length === 0) {
          const previewHTML = [...inputs].map(input => {
            if (input.type === "checkbox") {
              return `<p><strong>${input.nextElementSibling?.innerText}:</strong> ${input.checked ? "Yes" : "No"}</p>`;
            }
            const label = input.previousElementSibling?.innerText || "";
            return `<p><strong>${label}:</strong> ${input.value}</p>`;
          }).join("");
          const div = document.createElement("div");
          div.className = "preview-block";
          div.innerHTML = previewHTML;
          section.querySelector(".position-form").appendChild(div);
        }
      } else {
        inputs.forEach(input => (input.style.display = ""));
        section.querySelector(".preview-block")?.remove();
      }
    });
  });

  document.getElementById("add-position-btn").addEventListener("click", addAccordion);
  addAccordion();
});
