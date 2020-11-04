const reCaptchaSecret = window.secretKey;
const websiteKey = window.websiteKey;
let birthInitialHeight;
let genderInitialHeight;
let validNationalCEP = false;
let states = [];
let isVisiblePass = false
let previousCountry

jQuery(document).ready(function () {
  getCountry();
  getState();
  changeBorder()
  updateMap(
    jQuery(".step-board.relative-step.show-step").data("step"),
    jQuery(".step-board.relative-step.show-step").data("step")
  );

  jQuery('.vvale-svg').addClass('vvale-animate')

  let currentDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0];
  jQuery('#birth').attr('max', currentDate)

  const maskBehavior = function (val) {
      return val.replace(/\D/g, "").length === 11
        ? "(00) 0 0000-0000"
        : "(00) 0000-00009";
    },
    Options = {
      onKeyPress: function (val, e, field, options) {
        field.mask(maskBehavior.apply({}, arguments), options);
      },
    };

  jQuery("#phone").mask(maskBehavior, Options);
  jQuery("#cel").mask(maskBehavior, Options);

  birthInitialHeight = jQuery(".birth-container").outerHeight(true);
  genderInitialHeight = jQuery(".gender-container").outerHeight(true) + 25;
  changeFields();
});

// Toggle password visibility
{
  function togglePassword(element) {
    const label = element.attr("data-related");
    const field = jQuery(`.field#${label}`);
    if (field.attr("type") === "password") {
      field.attr("type", "text");
    } else {
      field.attr("type", "password");
    }
  }

  jQuery(".password-eye").on("click", function () {
    togglePassword(jQuery(this));
  });
}

// Check field status on keyup
{
  // Validate e-mail
  function validateEmail(field) {
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const content = field.value.toLowerCase();
    let isValid = false;

    if (pattern.test(content)) {
      isValid = true;
    }

    return isValid;
  }

  // Validate password
  function validatePassword(field, compareField) {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|< >.^*()%!-]{8,}$/;
    const content = field.value;
    let isValid = false;

    const charCheck = document.querySelector(
      `#${field.dataset.field} #tooltip-letter`
    );
    const numberCheck = document.querySelector(
      `#${field.dataset.field} #tooltip-number`
    );
    const lenghtCheck = document.querySelector(
      `#${field.dataset.field} #tooltip-lenght`
    );

    // Test number
    if (/\d/.test(content)) {
      numberCheck.classList.add("done");
    } else {
      numberCheck.classList.remove("done");
    }

    // Test char
    if (/[a-zA-Z]/.test(content)) {
      charCheck.classList.add("done");
    } else {
      charCheck.classList.remove("done");
    }

    // Test size
    if (content.length >= 8) {
      lenghtCheck.classList.add("done");
    } else {
      lenghtCheck.classList.remove("done");
    }

    // Comparison logic
    if (compareField != null) {
      const confirmPass = document.querySelector(
        "#tippy-second-pass #tooltip-compare"
      );
      const firstFieldValue = compareField.value;

      if (content === firstFieldValue && content.length > 0) {
        confirmPass.classList.remove("done");
        confirmPass.classList.add("done");
        if (pattern.test(content)) {
          isValid = true;
        }
      } else {
        confirmPass.classList.remove("done");
      }
    } else {
      if (pattern.test(content)) {
        isValid = true;
      }
    }

    return isValid;
  }

  // Validate user
  function validateUser(field) {
    let isValid = false;
    const pattern = /^[a-zA-z0-9]*$/;

    if (pattern.test(field.value)) {
      isValid = true;
    }

    return isValid;
  }

  // Validate first and last name
  function validateName(field) {
    let isValid = false;
    const pattern = /^[a-zA-Z0-9\u00C0-\u00FF\s -/.]*$/;

    if (field.value.length > 1 && pattern.test(field.value)) {
      isValid = true;
    }

    return isValid;
  }

  // Validate CPF of CNPJ
  function validateDocument(field) {
    let isValid = false;
    const pattern = /(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/;
    const content = field.value;

    if (pattern.test(content)) {
      isValid = true;
    }

    return isValid;
  }

  // Validate birth date
  function validateBirth(field) {
    let isValid = false;

    if(field.value !== '') {
      isValid = true
    }
    
    return isValid;
  }

  // Validate phone number
  function validatePhone(field) {
    let isValid = false;

    if (field.value.length >= 14) {
      isValid = true;
    }
    return isValid;
  }

  // Validate country
  function validateCountry(field, cep) {
    let isValid = false;
    const country = field.options[field.selectedIndex];
    let cepField = jQuery(cep)

    if (country.value !== "") {
      if (cepField !== null && cepField !== typeof undefined) {
        if (jQuery(cepField).attr("disabled") !== typeof undefined) {
          jQuery(cepField).removeAttr("disabled");
          if (country.value === "Brasil") {
            cepField.unmask();
            cepField.mask("00000000");
          } else {
            cepField.unmask();
            cepField.mask("0000999999");
          }
        }
      }
      isValid = true;
    }

    validateCep(cep, country.value);

    return isValid;
  }

  // Validate CEP
  function validateCep(field, countryValue) {
    let isValid = false;
    const state = document.querySelector("#state");
    const city = document.querySelector("#city");
    const neighborhood = document.querySelector("#neighborhood");
    const street = document.querySelector("#street");
    const number = document.querySelector("#number");
    const obs = document.querySelector("#obs");

    if (field.value !== undefined) {
      if (countryValue === "Brasil") {
        jQuery(field).mask('00000-000')
        let cep = field.value
        if (cep.length === 9) {
          cep = cep.replace('-', '')
          jQuery
            .ajax({
              url: `https://viacep.com.br/ws/${cep}/json/`,
              type: "GET",
              async: false,
              success: function (data) {
                if (data.erro === true) {
                  isValid = false;
                  validNationalCEP = false;
                } else {
                  if (data.uf !== "") {
                    states.forEach((e) => {
                      if (e.initials === data.uf) {
                        state.value = e.state;
                        checkLocationContent(state);
                      }
                    });
                  } else {
                    state.removeAttribute("disabled");
                  }

                  if (data.localidade !== "") {
                    city.value = data.localidade;
                    checkLocationContent(city);
                  } else {
                    city.removeAttribute("disabled");
                  }

                  if (data.bairro !== "") {
                    neighborhood.value = data.bairro;
                    checkLocationContent(neighborhood);
                  } else {
                    neighborhood.removeAttribute("disabled");
                  }

                  if (data.logradouro !== "") {
                    street.value = data.logradouro;
                    checkLocationContent(street);
                  } else {
                    street.removeAttribute("disabled");
                  }

                  number.removeAttribute("disabled");
                  obs.removeAttribute("disabled");

                  validNationalCEP = true;
                  isValid = true;
                }
              },
            })
            .fail((err) => {
              state.removeAttribute("disabled");
              city.removeAttribute("disabled");
              neighborhood.removeAttribute("disabled");
              street.removeAttribute("disabled");
              number.removeAttribute("disabled");
              obs.removeAttribute("disabled");

              console.error(err);

              validNationalCEP = true;
              isValid = true;
            });
        }
      } else {
        jQuery(field).unmask()
        let content = field.value;
        if (content.length >= 4) {
          state.removeAttribute("disabled");
          city.removeAttribute("disabled");
          neighborhood.removeAttribute("disabled");
          street.removeAttribute("disabled");
          number.removeAttribute("disabled");
          obs.removeAttribute("disabled");

          validNationalCEP = true;
          isValid = true;
        }
      }
    }

    if (isValid === false) {
      state.value = "";
      state.setAttribute = "disabled";
      checkLocationContent(state);

      city.value = "";
      city.setAttribute = "disabled";
      checkLocationContent(city);

      neighborhood.value = "";
      neighborhood.setAttribute = "disabled";
      checkLocationContent(neighborhood);

      street.value = "";
      street.setAttribute = "disabled";
      checkLocationContent(street);

      number.value = "";
      number.setAttribute = "disabled";
      checkLocationContent(number);

      obs.value = "";
      obs.setAttribute = "disabled";
      checkLocationContent(obs);
    }
    return isValid;
  }

  // Validate location content

  function validateLocationContent(field) {
    let isValid = false;

    let fieldValue = field.value;
    if (fieldValue.length > 1) {
      isValid = true;
    }

    return isValid;
  }

  // Return something
  function feedback(target, status) {
    const elementType = $(target).prop("nodeName");
    if (elementType !== "SELECT") {
      if (target.getAttribute('type') !== 'date') {
        if (target.value === "") {
          target.classList.remove("invalid");
          target.classList.remove("valid");
          return false;
        }
      }
    }

    if (status === true) {
      target.classList.remove("invalid");
      target.classList.add("valid");
    }
    
    if (status === false) {
      target.classList.remove("valid");
      target.classList.add("invalid");
    }
  }

  // Main functions
  {
    function checkEmail(field) {
      let valid = validateEmail(field);
      feedback(field, valid);
    }

    function checkPassword(field, comparisonField) {
      let valid = validatePassword(field, comparisonField);
      feedback(field, valid);
    }

    function checkUser(field) {
      let valid = validateUser(field);
      feedback(field, valid);
    }

    function checkName(field) {
      let valid = validateName(field);
      feedback(field, valid);
    }

    function checkDocument(field) {
      let valid = validateDocument(field);
      feedback(field, valid);
    }

    function checkBirth(field) {
      let valid = validateBirth(field);
      feedback(field, valid);
    }

    function checkPhone(field) {
      let valid = validatePhone(field);
      feedback(field, valid);
    }

    function checkCountry(field, cep) {
      let valid = validateCountry(field, cep);
      feedback(field, valid);
    }

    function checkCep(field, country) {
      let valid = validateCep(field, country);
      feedback(field, valid);
    }

    function checkLocationContent(field) {
      let valid = validateLocationContent(field);
      feedback(field, valid);
    }
  }

  // Call
  {
    jQuery("#email").on("keyup", function () {
      checkEmail(this);
    });
    
    jQuery("#email").on("blur", function () {
      checkEmail(this);
    });

    jQuery("#first-pass").on("keyup", function () {
      const comparisonField = document.querySelector("#second-pass");
      checkPassword(this);
      checkPassword(comparisonField, this);
    });
    
    jQuery("#first-pass").on("blur", function () {
      const comparisonField = document.querySelector("#second-pass");
      checkPassword(this);
      checkPassword(comparisonField, this);
    });

    jQuery("#second-pass").on("keyup", function () {
      const comparisonField = document.querySelector("#first-pass");
      checkPassword(this, comparisonField);
    });
    
    jQuery("#second-pass").on("blur", function () {
      const comparisonField = document.querySelector("#first-pass");
      checkPassword(this, comparisonField);
    });

    jQuery("#user").on("keyup", function () {
      checkUser(this);
    });
    
    jQuery("#user").on("blur", function () {
      checkUser(this);
    });

    jQuery("#first-name").on("keyup", function () {
      checkName(this);
    });
    
    jQuery("#first-name").on("blur", function () {
      checkName(this);
    });

    jQuery("#last-name").on("keyup", function () {
      checkName(this);
    });

    jQuery("#last-name").on("blur", function () {
      checkName(this);
    });

    jQuery("#document").on("keyup", function () {
      checkDocument(this);
    });

    jQuery("#document").on("blur", function () {
      checkDocument(this);
    });

    jQuery("#birth").on("keyup", function () {
      checkBirth(this);
    });

    jQuery("#birth").on("blur", function () {
      checkBirth(this);
    });

    jQuery("#birth").on("change", function () {
      checkBirth(this);
    });

    jQuery("#phone").on("keyup", function () {
      checkPhone(this);
    });
    
    jQuery("#phone").on("blur", function () {
      checkPhone(this);
    });

    jQuery("#cel").on("keyup", function () {
      checkPhone(this);
    });

    jQuery("#cel").on("blur", function () {
      checkPhone(this);
    });

    jQuery("select#country").on("change", function () {
      let cep = document.querySelector("#cep");
      let country = jQuery("select#country")[0];
      country = country.options[country.selectedIndex].value;
      if (country !== previousCountry) {
        cep.value = "";
        previousCountry = country
      }
      checkCep(cep, "");
      checkCountry(this, cep);
    });

    jQuery("input#cep").on("keyup", function () {
      let country = jQuery("select#country")[0];
      country = country.options[country.selectedIndex].value;
      checkCep(this, country);
    });

    jQuery("input#cep").on("blur", function () {
      let country = jQuery("select#country")[0];
      country = country.options[country.selectedIndex].value;
      checkCep(this, country);
    });

    jQuery("#state").on("keyup", function () {
      checkLocationContent(this);
    });

    jQuery("#state").on("blur", function () {
      checkLocationContent(this);
    });

    jQuery("#city").on("keyup", function () {
      checkLocationContent(this);
    });

    jQuery("#city").on("blur", function () {
      checkLocationContent(this);
    });

    jQuery("#neighborhood").on("keyup", function () {
      checkLocationContent(this);
    });

    jQuery("#neighborhood").on("blur", function () {
      checkLocationContent(this);
    });

    jQuery("#street").on("keyup", function () {
      checkLocationContent(this);
    });

    jQuery("#street").on("blur", function () {
      checkLocationContent(this);
    });

    jQuery("#number").on("keyup", function () {
      checkLocationContent(this);
    });

    jQuery("#number").on("blur", function () {
      checkLocationContent(this);
    });

    jQuery("#obs").on("keyup", function () {
      checkLocationContent(this);
    });

    jQuery("#obs").on("blur", function () {
      checkLocationContent(this);
    });
  }
}

// Tooltip
{
  let template = document.querySelector("#tippy-first-pass");

  tippy("#first-pass", {
    theme: "vvale",
    content: template.innerHTML,
    allowHTML: true,
    duration: [150, 150],
    trigger: "focus",
    placement: "bottom-start",
    animation: "shift-toward",
    onShow(pass) {
      const passField = document.querySelector("#first-pass");
      passField.addEventListener("keyup", function () {
        pass.setContent(template.innerHTML);
      });
    },
  });

  let template2 = document.querySelector("#tippy-second-pass");

  tippy("#second-pass", {
    theme: "vvale",
    content: template2.innerHTML,
    allowHTML: true,
    duration: [150, 150],
    trigger: "focus",
    placement: "bottom-start",
    animation: "shift-toward",
    onShow(pass) {
      const passField1 = document.querySelector("#first-pass");
      const passField2 = document.querySelector("#second-pass");
      passField1.addEventListener("keyup", function () {
        pass.setContent(template2.innerHTML);
      });
      passField2.addEventListener("keyup", function () {
        pass.setContent(template2.innerHTML);
      });
    },
  });

  tippy("#user", {
    theme: "vvale",
    content:
      "O nome de usuário <strong>não pode</strong> conter <br>espaços ou caracteres especiais",
    allowHTML: true,
    duration: [150, 150],
    trigger: "focus",
    placement: "bottom-start",
    animation: "shift-toward",
  });
}

// Get country list
{
  function getCountry() {
    const select = document.querySelector("select[name=country]");

    jQuery
      .ajax({
        headers: { "Access-Control-Allow-Origin": "*" },
        url: "http://api.londrinaweb.com.br/PUC/Paisesv2/0/1000",
        type: "GET",
        crossDomain: true,
        dataType: "jsonp",
        async: true,
        success: function (data) {
          let finalString = ''
          data.forEach((e) => {
            let content;

            if (e.Pais === "Brasil") {
              content = `
              <option value="${e.Pais}" selected>${e.Pais}</option>
            `;
            } else {
              content = `
              <option value="${e.Pais}">${e.Pais}</option>
            `;
            }

            finalString += content;
          });

          select.innerHTML = finalString;

          previousCountry = jQuery("select#country")[0];
          previousCountry = previousCountry.options[previousCountry.selectedIndex].value;
          checkCountry(select, jQuery("#cep"));
        },
      })
      .fail(function () {
        const fallbackCountry = [
          "Brasil",
          "Argentina",
          "Paraguai",
          "Uruguai",
          "Outro",
        ];
        fallbackCountry.forEach(function (e) {
          let content;
          if (e === "Brasil") {
            content = `
            <option value="${e}" selected>${e}</option>
          `;
          } else {
            content = `
            <option value="${e}">${e}</option>
          `;
          }
          select.innerHTML += content;
        });

        checkCountry(select, jQuery("#cep"));
      });
  }
}

// Get state list
{
  function getState() {
    jQuery
      .ajax({
        url: "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
        type: "GET",
        async: true,
        success: function (data) {
          data.forEach((e) => {
            let item = {
              state: e.nome,
              initials: e.sigla,
            };
            states.push(item);
          });
        },
      })
      .fail(function (err) {
        console.error(`
        Can't access states API.
        Error: ${err}
      `);
      });
  }
}

// Change fields for different account types (CPF/CNPJ)
{
  function changeFields() {
    const accountType = jQuery(
      '.radio-container input[name="conta"]:checked'
    )[0].id;
    const document = jQuery('label[for="document"]');
    const documentField = jQuery("#document");
    const firstName = jQuery('label[for="first-name"]');
    const lastName = jQuery('label[for="last-name"');
    const birthContainer = jQuery(".birth-container");
    const birthInput = jQuery(".birth-container input");
    const genderContainer = jQuery(".gender-container");
    const genderInput = jQuery(".gender-container input");

    if (accountType === "fisica") {
      document.html('CPF<span class="required">*</span>');
      documentField.attr("placeholder", "000.000.000-00");
      documentField.unmask();
      documentField.mask("000.000.000-00");
      firstName.html('Nome<span class="required">*</span>');
      lastName.html('Sobrenome<span class="required">*</span>');
      birthContainer.css("display", "block");
      genderContainer.css("display", "block");
      birthContainer.animate(
        {
          opacity: 1,
          height: birthInitialHeight,
          overflow: "initial",
        },
        200
      );
      genderContainer.animate(
        {
          opacity: 1,
          minHeight: 85,
          height: genderInitialHeight,
          overflow: "initial",
        },
        200
      );
    } else {
      document.html('CNPJ<span class="required">*</span>');
      documentField.attr("placeholder", "00.000.000/0000-00");
      documentField.unmask();
      documentField.mask("00.000.000/0000-00");
      firstName.html('Razão social<span class="required">*</span>');
      lastName.html('Nome fantasia<span class"required">*</span>');
      birthContainer.animate(
        {
          opacity: 0,
          height: 0,
          overflow: "hidden",
        },
        200
      );
      genderContainer.animate(
        {
          opacity: 0,
          height: 0,
          minHeight: 0,
          marginBottom: 0,
          overflow: "hidden",
          display: "none",
        },
        200
      );
      setTimeout(function () {
        birthContainer.css("display", "none");
        genderContainer.css("display", "none");
      }, 200);
    }

    return accountType;
  }

  jQuery('.radio-container input[name="conta"]').on("change", changeFields);
}

// Validate first step fields
{
  function validateFirstStep(needCaptcha = false) {
    // Every field must be valid
    // Terms checkbox must be checked
    // Google reCaptcha must return true
    // Optional: DB consult with e-mail should return null

    let emailField = document.querySelector("#email");
    let passwordField = document.querySelector("#first-pass");
    let confirmPassword = document.querySelector("#second-pass");
    let termsCheckbox = document.querySelector("#termos");

    let emailStatus = validateEmail(emailField);
    let passwordStatus = validatePassword(passwordField);
    let confirmPasswordStatus = validatePassword(
      confirmPassword,
      passwordField
    );
    let termsStatus = false;

    if (termsCheckbox.checked) {
      termsStatus = true;
    }

    if (needCaptcha === false) {
      console.log("First step verify");
      console.log(`
      Email: ${emailStatus}
      FirstPass: ${passwordStatus}
      SecondPass: ${confirmPasswordStatus}
      TermsStatus: ${termsStatus}
      `);

      if (
        emailStatus &&
        passwordStatus &&
        confirmPasswordStatus &&
        termsStatus
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      let reCaptcha = grecaptcha.getResponse();
      let reCaptchaStatus = false;

      jQuery.ajax({
        url: "https://www.google.com/recaptcha/api/siteverify",
        type: "POST",
        async: false,
        dataType: "jsonpapplication/json",
        data: {
          secret: reCaptchaSecret,
          response: reCaptcha,
        },
        success: function (data) {
          console.log(data);
          reCaptchaStatus = data.success;
        },
      });
      console.log("First step verify");
      console.log(`
      Email: ${emailStatus}
      FirstPass: ${passwordStatus}
      SecondPass: ${confirmPasswordStatus}
      reCaptcha: ${reCaptchaStatus}
      TermsStatus: ${termsStatus}
      `);

      if (
        emailStatus &&
        passwordStatus &&
        confirmPasswordStatus &&
        reCaptchaStatus &&
        termsStatus
      ) {
        return true;
      } else {
        grecaptcha.reset();
        return false;
      }
    }
  }
}

//Validate second step fields
{
  function validateSecondStep() {
    const accountType = jQuery(
      '.radio-container input[name="conta"]:checked'
    )[0].id;
    const user = document.querySelector("input#user");
    const firstName = document.querySelector("input#first-name");
    const lastName = document.querySelector("input#last-name");
    const documentType = document.querySelector("input#document");
    const phone = document.querySelector("input#phone");

    const userStatus = validateUser(user);
    const firstNameStatus = validateName(firstName);
    const lastNameStatus = validateName(lastName);
    const documentStatus = validateDocument(documentType);
    const phoneStatus = validatePhone(phone);
    console.log("Second step verify");

    if (accountType === "fisica") {
      const birth = document.querySelector("input#birth");

      const birthStatus = validateBirth(birth);

      console.log(`
      userStatus: ${userStatus}
      firstNameStatus: ${firstNameStatus}
      lastNameStatus: ${lastNameStatus}
      documentStatus: ${documentStatus}
      phoneStatus: ${phoneStatus}
      birthStatus: ${birthStatus}
      `);

      if (
        userStatus &&
        firstNameStatus &&
        lastNameStatus &&
        documentStatus &&
        phoneStatus &&
        birthStatus
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      console.log(`
      userStatus: ${userStatus}
      firstNameStatus: ${firstNameStatus}
      lastNameStatus: ${lastNameStatus}
      documentStatus: ${documentStatus}
      phoneStatus: ${phoneStatus}
      `);

      if (
        userStatus &&
        firstNameStatus &&
        lastNameStatus &&
        documentStatus &&
        phoneStatus
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}

//Validate third step fields
{
  function validateThirdStep() {
    const state = document.querySelector("#state");
    const city = document.querySelector("#city");
    const neighborhood = document.querySelector("#neighborhood");
    const street = document.querySelector("#street");
    const number = document.querySelector("#number");

    const countryStatus = validNationalCEP;
    const cepStatus = validNationalCEP;
    const stateStatus = validateLocationContent(state);
    const cityStatus = validateLocationContent(city);
    const neighborhoodStatus = validateLocationContent(neighborhood);
    const streetStatus = validateLocationContent(street);
    const numberStatus = validateLocationContent(number);
    console.log("Third step verify");
    console.log(`
      countryStatus: ${countryStatus}
      cepStatus: ${cepStatus}
      stateStatus: ${stateStatus}
      cityStatus: ${cityStatus}
      neighborhoodStatus: ${neighborhoodStatus}
      streetStatus: ${streetStatus}
      numberStatus: ${numberStatus}
    `);

    if (
      countryStatus &&
      cepStatus &&
      stateStatus &&
      cityStatus &&
      neighborhoodStatus &&
      streetStatus &&
      numberStatus
    ) {
      return true;
    } else {
      return false;
    }
  }
}

// Validate fourth step fields
{
  function validateFourthStep() {
    const selectedPlan = document.querySelector('input[name="plan"]:checked');

    if (selectedPlan !== null) {
      return true;
    } else {
      return false;
    }
  }
}

// Change border of selected plan
{
  function changeBorder() {
    const target = jQuery('input[name="plan"]')

    target.each(function() {
      let container = jQuery(`label[for="${jQuery(this).attr('id')}"]`)
      
      if(jQuery(this).is(':checked')) {
        container.addClass('active-plan')
      } else {
        container.removeClass('active-plan')
      }
    })
  }

  jQuery('input[name="plan"]').on('click', changeBorder)
}

// Get every value for the last step
{
  function getValue() {
    let accessText = "";
    let personalText = "";
    let addressText = "";
    let planText = "";

    let account = {
      email: document.querySelector("#email").value,
      pass: document.querySelector("#first-pass").value,
      user: document.querySelector("#user").value,
      type: document
        .querySelector('input[name="conta"]:checked')
        .getAttribute("id"),
      firstName: document.querySelector("#first-name").value,
      lastName: document.querySelector("#last-name").value,
      document: document.querySelector("#document").value,
      birth: document.querySelector("#birth").value,
      gender: document
        .querySelector('input[name="genero"]:checked')
        .getAttribute("id"),
      phone: document.querySelector("#phone").value,
      cel: document.querySelector("#cel").value,
      country: document.querySelector("select#country").options[document.querySelector("select").selectedIndex].value,
      cep: document.querySelector("#cep").value,
      state: document.querySelector("#state").value,
      city: document.querySelector("#city").value,
      neighborhood: document.querySelector("#neighborhood").value,
      street: document.querySelector("#street").value,
      number: document.querySelector("#number").value,
      comp: document.querySelector("#obs").value,
      plan: document
        .querySelector('input[name="plan"]:checked')
        .getAttribute("id"),
      planName: "",
      planTemp: "",
      planValue: "",
    };

    if (account.type === "fisica") {
      account.type = "Pessoa física";
    } else {
      account.type = "Pessoa jurídica";
    }

    if (account.gender === "masculino") {
      account.gender = "Masculino";
    } else if (account.gender === "feminino") {
      account.gender = "Feminino";
    } else {
      account.gender = "Outro";
    }

    switch (account.plan) {
      case "free":
        account.planName = "Plano gratuito";
        break;
      case "plan1":
        account.planName = "Plano de teste";
        account.planTemp = "30 dias";
        account.planValue = "Pagamento único de R$ 4,90";
        break;
      case "plan2":
        account.planName = "Portal Vvale";
        account.planTemp = "12 meses";
        account.planValue = "12 parcelas de R$ 9,90 (Totalizando R$ 118,80)";
        break;
      case "plan3":
        account.planName = "Portal Vvale Compartilhado";
        account.planTemp = "12 meses";
        account.planValue = "12 parcelas de R$ 19,90 (Totalizando R$ 238,80)";
        break;
      case "plan4":
        account.planName = "Portal Vvale + JOC Impresso";
        account.planTemp = "12 meses";
        account.planValue = "12 parcelas de R$ 20,00 (Totalizando R$ 240,00)";
        break;
    }

    account.pass = account.pass.replace(/./g, "*");

    accessText += `
      <div class="row">
        <strong>E-mail: </strong>
        <span>${account.email}</span>
      </div>
      <div class="row">
        <strong>Senha: </strong>
        <span class="password-container">${account.pass}</span><input type="button" onclick="togglePass(this)" class="togglePass" data-char="${account.pass}">
      </div>
    `;

    personalText += `
      <div class="row">
        <strong>Tipo de conta: </strong>
        <span>${account.type}</span>
      </div>
      <div class="row">
        <strong>Usuário: </strong>
        <span>${account.user}</span>
      </div>`;

    if (
      document
        .querySelector('input[name="conta"]:checked')
        .getAttribute("id") === "fisica"
    ) {
      personalText += `
        <div class="row">
          <strong>
            <span>
              Nome: 
            </span> 
          </strong>
          <span>${account.firstName} ${account.lastName}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              CPF: 
            </span> 
          </strong>
          <span>${account.document}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              Data de nascimento: 
            </span> 
          </strong>
          <span>${account.birth}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              Gênero: 
            </span> 
          </strong>
          <span>${account.gender}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              Telefone: 
            </span> 
          </strong>
          <span>${account.phone}</span>
        </div>`;

      if (account.cel !== "") {
        personalText += `
        <div class="row cel-data-container">
          <strong>
            <span>
              Celular: 
            </span> 
          </strong>
          <span>${account.cel}</span>
        </div>
        `;
      }
    } else {
      personalText += `
        <div class="row">
          <strong>
            <span>
              Razão social: 
            </span> 
          </strong>
          <span>${account.firstName}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              Nome fantasia: 
            </span> 
          </strong>
          <span>${account.lastName}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              CNPJ: 
            </span> 
          </strong>
          <span>${account.document}</span>
        </div>
        <div class="row">
          <strong>
            <span>
              Telefone: 
            </span> 
          </strong>
          <span>${account.phone}</span>
        </div>`;

      if (account.cel !== "") {
        personalText += `
        <div class="row cel-data-container">
          <strong>
            <span>
              Celular: 
            </span> 
          </strong>
          <span>${account.cel}</span>
        </div>
        `;
      }
    }

    addressText += `
      <div class="row">
        <strong>País: </strong>
        <span>${account.country}</span>
      </div>
      <div class="row">
        <strong>CEP: </strong>
        <span>${account.cep}</span>
      </div>
      <div class="row">
        <strong>Cidade: </strong>
        <span>
          ${account.city}
        </span> - 
        <span>
          ${account.state}
        </span>
      </div>
      <div class="row">
        <strong>Endereço: </strong>
        <span>
          ${account.street}, 
        </span>
        <span>
          ${account.number}
        </span> - 
        <span class="neighborhood-container">
          ${account.neighborhood}
        </span>
      </div>
    `;

    if (account.comp !== "") {
      addressText += `
        <div class="row">
          <strong>Complemento: </strong>
          <span>
            ${account.comp}
          </span>
        </div>
      `;
    }

    planText += `
      <div class="row">
        <strong>
          <span>
            Nome: 
          </span> 
        </strong>
        <span>${account.planName}</span>
      </div>
    `;

    if (account.planTemp !== "") {
      planText += `
      <div class="row">
        <strong>
          <span>
            Duração: 
          </span> 
        </strong>
        <span>${account.planTemp}</span>
      </div>
    `;
    }

    if (account.planValue !== "") {
      planText += `
      <div class="row">
        <strong>
          <span>
            Valor: 
          </span> 
        </strong>
        <span>${account.planValue}</span>
      </div>
    `;
    }

    document.querySelector(".access-container").innerHTML = accessText;
    document.querySelector(".personal-container").innerHTML = personalText;
    document.querySelector(".address-container").innerHTML = addressText;
    document.querySelector(".selected-plan-container").innerHTML = planText;
  }
}

// Toggle pass (last step)
{
  function togglePass(element) {
    let currentPass = document.querySelector('#first-pass').value
    let hiddenPass = element.getAttribute('data-char')
    let passContainer = document.querySelector('.password-container')

    if(!isVisiblePass) {
      passContainer.innerHTML = currentPass
      isVisiblePass = true
    } else {
      passContainer.innerHTML = hiddenPass
      isVisiblePass = false
    }
  }
}

// Feedback function
{
  function feedback(success, content = '') {
    let feedback = jQuery('span.feedback')
    
    if(!success) {
      feedback.each(function() {
        jQuery(this).animate({
          height: 20,
          marginBottom: 10
        }, 250)
        jQuery(this).html(content)
      })
    } else {
      feedback.each(function() {
        jQuery(this).animate({
          height: 0,
          marginBottom: 0
        }, 250)
        jQuery(this).html('')
      })
    }
  } 
}

// List of each step validation
{
  function stepValidation(step) {
    switch (step) {
      case 1:
        let step11 = validateFirstStep(false);
        if (!step11) {
          feedback(false, 'Preencha todos os campos corretamente')
          console.error("First step error");
          return false;
        } else {
          console.log(`FinalResult: ${step11}`);
          feedback(true)
          return step11;
        }
      case 2:
        let step21 = validateFirstStep(false);
        let step22 = validateSecondStep();
        if (!step21) {
          feedback(false, 'Verifique os campos da etapa anterior')
          console.error("First step error");
          return false;
        } else if (!step22) {
          feedback(false, 'Preencha todos os campos corretamente')
          console.error("Second step error");
          return false;
        } else {
          console.log("Second step OK");
          console.log(`FinalResult: ${step22}`);
          feedback(true)
          return step22;
        }
      case 3:
        let step31 = validateFirstStep(false);
        let step32 = validateSecondStep();
        let step33 = validateThirdStep();
        if (!step31) {
          feedback(false, 'Verifique os campos da primeira etapa')
          console.error("First step error");
          return false;
        } else if (!step32) {
          feedback(false, 'Verifique os campos da etapa anterior')
          console.error("Second step error");
          return false;
        } else if (!step33) {
          feedback(false, 'Preencha todos os campos corretamente')
          console.error("Third step error");
          return false;
        } else {
          console.log("Third step OK");
          console.log(`FinalResult: ${step33}`);
          feedback(true)
          return step33;
        }
      case 4:
        let step41 = validateFirstStep(false);
        let step42 = validateSecondStep();
        let step43 = validateThirdStep();
        let step44 = validateFourthStep();
        if (!step41) {
          feedback(false, 'Verifique os campos da primeira etapa')
          console.error("First step error");
          return false;
        } else if (!step42) {
          feedback(false, 'Verifique os campos da segunda etapa')
          console.error("Second step error");
          return false;
        } else if (!step43) {
          feedback(false, 'Verifique os campos da etapa anterior')
          console.error("Third step error");
          return false;
        } else if (!step44) {
          feedback(false, 'Preencha todos os campos corretamente')
          console.error("Third step error");
          return false;
        } else {
          console.log("Fourth step OK");
          console.log(`FinalResult: ${step44}`);
          feedback(true)
          return step44;
        }
    }
  }
}

// Update map step by step
{
  function updateMap(nextStep) {
    const stepContainer = document.querySelector(".step-container");

    // Toggle map
    function toggleMap(nextStep) {
      if (nextStep >= 2 && nextStep < 5) {
        jQuery('.feedback.top').css('display', 'block')
        setTimeout(function () {
          stepContainer.classList.add("show-map");
        }, 400);
      } else {
        jQuery('.feedback.top').css('display', 'none')
        setTimeout(function () {
          stepContainer.classList.remove("show-map");
        }, 400);
      }
    }
    toggleMap(nextStep);

    // Update steps
    function updateStep(nextStep) {
      const nextCircle = document.querySelector(
        `.map-step[data-step="${nextStep}"]`
      );
      let lastItem = 0;

      // Get step number
      jQuery(".map-step").each(function () {
        if (jQuery(this).data("step") > lastItem) {
          lastItem = jQuery(this).data("step");
        }
      });

      for (i = 1; i <= lastItem; i++) {
        let mapStep = document.querySelector(`.map-step[data-step="${i}"]`);
        let mapStroke = document.querySelector(`.sep[data-step="${i - 1}"]`);

        if (i > nextStep) {
          if (mapStep !== null) {
            mapStep.classList.remove("active");
            mapStep.classList.remove("done");
          }
          if (mapStroke !== null) {
            mapStroke.classList.remove("done");
          }
        } else {
          if (mapStep !== null) {
            mapStep.classList.remove("active");
            mapStep.classList.add("done");
          }
          if (mapStroke !== null) {
            mapStroke.classList.add("done");
          }
        }
      }
      if (nextCircle !== null) {
        nextCircle.classList.remove("done");
        nextCircle.classList.add("active");
      }

      return true;
    }
    updateStep(nextStep);
  }
}

// Call next step
{
  function nextStep(step = null, nextStep = null) {
    const currentStep = step;
    const targetStep = nextStep;

    if (currentStep === null || targetStep === null) {
      console.error(
        "nextStep must receive current and target step. Check your call and try again"
      );
      return false;
    }

    if (currentStep == targetStep) {
      console.error(
        "nextStep must receive different values on current and target step. Check your call and try again"
      );
      return false;
    }

    if (currentStep < targetStep) {
      if (stepValidation(currentStep) === true) {
        const body = $("html, body");
        const form = $(".content-container").offset().top;
        body.stop().animate({ scrollTop: form }, 500, "swing");

        setTimeout(function () {
          updateMap(nextStep);
        }, 500);

        const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`)[0];
        const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`)[0];

        currentBoard.classList.remove("show-step");

        setTimeout(function () {
          currentBoard.classList.remove("relative-step");
          nextBoard.classList.add("relative-step");

          setTimeout(function () {
            nextBoard.classList.add("show-step");
          }, 200);
        }, 650);
      } else {
        console.log(
          "Verifique se todos os campos estão preenchidos corretamente"
        );
      }
    } else {
      feedback(true, '')
      const body = $("html, body");
      const form = $(".content-container").offset().top;
      body.stop().animate({ scrollTop: 0 }, 500, "swing");

      setTimeout(function () {
        updateMap(nextStep);
      }, 500);

      const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`)[0];
      const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`)[0];

      setTimeout(function () {
        currentBoard.classList.remove("show-step");

        setTimeout(function () {
          currentBoard.classList.remove("relative-step");
          nextBoard.classList.add("relative-step");

          setTimeout(function () {
            nextBoard.classList.add("show-step");
          }, 200);
        }, 650);
      }, 500);
    }
  }

  jQuery(".avancar").click(function () {
    let step = jQuery(this).data("step");
    let target = jQuery(this).data("target");
    nextStep(step, target);
  });

  jQuery(".voltar").click(function () {
    let step = jQuery(this).data("step");
    let target = jQuery(this).data("target");
    nextStep(step, target);
  });
  
  jQuery('.map-step').click(function() {
    let step = jQuery('.step-board.relative-step.show-step').data('step')
    let target = jQuery(this).data('step')
    nextStep(step, target);
  })

  jQuery('input.avancar[type="button"][data-step="4"').click(function() {
    getValue()
  })
}
