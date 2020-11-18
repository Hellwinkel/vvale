const reCaptchaSecret = window.secretKey;
const websiteKey = window.websiteKey;
let birthInitialHeight;
let genderInitialHeight;
let validNationalCEP = false;
let states = [];
let isVisiblePass = false
let previousCountry
let obj = {}
let maxYear = ''

jQuery(window).on('load', function() {
  if(Cookies.get('fields') !== undefined) {
    obj = JSON.parse(Cookies.get('fields'))
    getCookie()
  } else {
    jQuery('.relative-step').addClass('show-step')
  }
})

jQuery(document).ready(function () {
  getCountry();
  getState();
  changeBorder()
  updateMap(
    jQuery(".step-board.relative-step.show-step").data("step"),
    jQuery(".step-board.relative-step.show-step").data("step")
  );

  jQuery('.vvale-svg').addClass('vvale-animate')

  let currentYear = new Date().getFullYear()
  let currentMonth = new Date().getMonth()
  let currentDay = new Date().getDate()
  maxYear = `${currentYear - 10}-${currentMonth + 1}-${currentDay}`

  jQuery('#birth').attr('max', maxYear)

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

// Prevent submit on enter key
{
  function preventSubmit(e) {
    let button = jQuery('.step-board.relative-step.show-step .avancar')
    let currentStep = parseInt(button.attr('data-step'))
    let targetStep = parseInt(button.attr('data-target'))
    if (e.key == 'Enter') {
      e.preventDefault();
      if(currentStep === 4) {
        getValue()
      }
      nextStep(currentStep, targetStep)
    }
  }

  jQuery('form input').keydown(function(e) {
    preventSubmit(e)
  })
}

// Save progress on cookie
{
  function setCookie(fieldList, lastStep) {
    if(Cookies.get('fields') !== undefined) {
      let currentStep = JSON.parse(Cookies.get('fields')).lastStep
      if(currentStep !== undefined) {
        if(currentStep < lastStep) {
          obj.lastStep = lastStep.toString()
        }
      }
    } else {
      obj.lastStep = lastStep
    }

    jQuery(fieldList).each(function(index, field) {
      let fieldId = jQuery(field).attr('id')
      let fieldType = jQuery(field).prop('tagName')
      let fieldValue = jQuery(field).val()

      if(fieldType === 'INPUT') {
        let inputType = jQuery(field).attr('type')
        switch(inputType) {
          case 'text':
          case 'email':
          case 'password':
          case 'date':
            if(fieldId === 'document') {
              let documentNumber = fieldValue.replaceAll(/\.|\/|\-/g, '')
              obj[`#${fieldId}`] = documentNumber
            } else {
              obj[`#${fieldId}`] = fieldValue
            }
            break
          case 'checkbox':
            obj[`input[type="checkbox"][name="${jQuery(field).prop('name')}"]`] = true
            break
          case 'radio':
            obj[`input[type="radio"][name="${jQuery(field).prop('name')}"]`] = fieldId
            break
        }
      }

      if(fieldType === 'SELECT') {
        let selectedOption = jQuery(`#${fieldId} option:selected`)
        obj[`#${fieldId}`] = selectedOption.text()
      }
    })

    Cookies.set('fields', JSON.stringify(obj), { expires: 3 })
  }
}

// Get content from cookie and update screen step
{
  function getCookie() {
    if(Cookies.get('fields') !== undefined) {
      let cookieValue = JSON.parse(Cookies.get('fields'))
      
      for (let element of Object.keys(cookieValue)) {
        if(jQuery(element)[0] !== undefined) {
          let fieldType = jQuery(element).prop('tagName')

          if(fieldType === 'INPUT') {
            let inputType = jQuery(element).attr('type')
            switch(inputType) {
              case 'text':
              case 'email':
              case 'password':
              case 'date':
                changeFields()
                jQuery(element).val(cookieValue[element])
                if(cookieValue[element] !== '') {
                  feedback(jQuery(element)[0], true)
                }
                break
              case 'checkbox':
                jQuery(element).attr('checked', true)
                break
              case 'radio':
                changeFields()
                jQuery(`${element}[id="${cookieValue[element]}"]`).attr('checked', true)
                changeBorder()
                break
            }
          }

          if(fieldType === 'SELECT') {
            jQuery(`${element} option[value="${cookieValue[element]}"]`).attr('selected', true)
            feedback(jQuery(element)[0], true)
          }
        }
      }

      if (parseInt(cookieValue.lastStep) >= 3) {
        validNationalCEP = true
      }

      let lastStep = jQuery(`.step-board[data-step="${parseInt(cookieValue.lastStep) + 1}"]`)
      jQuery('.step-board.relative-step').removeClass('relative-step')
      updateMap(parseInt(cookieValue.lastStep) + 1)
      lastStep.addClass('relative-step')

      showStep(cookieValue.lastStep)
    }
  }
}

// Show current board 
{
  function showStep(targetStep) {
    getCountry()
    jQuery('.step-board.relative-step').removeClass('show-step')
    if(targetStep == 4) {
      getValue()
    }
    jQuery(`.step-board[data-step="${parseInt(targetStep + 1)}"]`).addClass('show-step')
    jQuery('.relative-step').addClass('show-step')
  }
}

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
    let isValid = true;
    let sentYear = parseInt(field.value.split('-')[0])

    if(field.value === '') {
      isValid = false
    }

    if(sentYear < 1900) {
      isValid = false
    }

    if(new Date(`${field.value} 00:00:00`) > new Date(maxYear)) {
      isValid = false
      jQuery('.birth-feedback').html('É necessário ter ao menos 10 anos')
      jQuery('.birth-feedback').animate({
        height: 20
      })
    }

    if (isValid === true) {
      jQuery('.birth-feedback').html('')
      jQuery('.birth-feedback').animate({
        height: 0
      })
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

  // Validate cel number
  function validateCel(field) {
    let isValid = false;

    if (field.value.length >= 16) {
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
        if (country.value === "Brasil") {
          cepField.unmask();
          cepField.mask("00000-000");
        } else {
          cepField.unmask();
          cepField.mask("0000999999");
        }
      }
      isValid = true;
    }

    validateCep(cep, country.value, false);

    return isValid;
  }

  // Validate CEP
  function validateCep(field, countryValue, clear = true) {
    let isValid = false;
    const state = document.querySelector("#state");
    const city = document.querySelector("#city");
    const neighborhood = document.querySelector("#neighborhood");
    const street = document.querySelector("#street");
    const number = document.querySelector("#number");

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
                    state.removeAttribute("readonly");
                    state.tabIndex = 0;
                  }

                  if (data.localidade !== "") {
                    city.value = data.localidade;
                    checkLocationContent(city);
                  } else {
                    city.removeAttribute("readonly");
                    city.tabIndex = 0;
                  }

                  if (data.bairro !== "") {
                    neighborhood.value = data.bairro;
                    checkLocationContent(neighborhood);
                  } else {
                    neighborhood.removeAttribute("readonly");
                    neighborhood.tabIndex = 0;
                  }

                  if (data.logradouro !== "") {
                    street.value = data.logradouro;
                    checkLocationContent(street);
                  } else {
                    street.removeAttribute("readonly");
                    street.tabIndex = 0;
                  }

                  validNationalCEP = true;
                  isValid = true;
                }
              },
            })
            .fail((err) => {
              state.removeAttribute("readonly");
              state.tabIndex = 0;
              city.removeAttribute("readonly");
              city.tabIndex = 0;
              neighborhood.removeAttribute("readonly");
              neighborhood.tabIndex = 0;
              street.removeAttribute("readonly");
              street.tabIndex = 0;

              console.error(err);

              validNationalCEP = true;
              isValid = true;
            });
        }
      } else {
        jQuery(field).unmask()
        let content = field.value;
        if (content.length >= 4) {
          state.removeAttribute("readonly");
          state.tabIndex = 0;
          city.removeAttribute("readonly");
          city.tabIndex = 0;
          neighborhood.removeAttribute("readonly");
          neighborhood.tabIndex = 0;
          street.removeAttribute("readonly");
          street.tabIndex = 0;

          validNationalCEP = true;
          isValid = true;
        }
      }
    }

    if (isValid === false && clear === true) {
      state.value = "";
      state.setAttribute = "readonly";
      state.tabIndex = -1;
      checkLocationContent(state);

      city.value = "";
      city.setAttribute = "readonly";
      city.tabIndex = -1;
      checkLocationContent(city);

      neighborhood.value = "";
      neighborhood.setAttribute = "readonly";
      neighborhood.tabIndex = -1;
      checkLocationContent(neighborhood);

      street.value = "";
      street.setAttribute = "readonly";
      street.tabIndex = -1;
      checkLocationContent(street);

      number.value = "";
      checkLocationContent(number);
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

    function checkCel(field) {
      let valid = validateCel(field);
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
      checkCel(this);
    });

    jQuery("#cel").on("blur", function () {
      checkCel(this);
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
      checkCep(this, country, true);
    });

    jQuery("input#cep").on("blur", function () {
      let country = jQuery("select#country")[0];
      country = country.options[country.selectedIndex].value;
      checkCep(this, country, true);
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
    trigger: "focus click",
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
    trigger: "focus click",
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
    trigger: "focus click",
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
      feedback(documentField[0], checkDocument(documentField[0]))
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
      feedback(documentField[0], checkDocument(documentField[0]))
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

    let fieldsArray = [];
    fieldsArray.push(emailField)
    fieldsArray.push(passwordField)
    fieldsArray.push(confirmPassword)
    fieldsArray.push(termsCheckbox)

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
      if (
        emailStatus &&
        passwordStatus &&
        confirmPasswordStatus &&
        termsStatus
      ) {
        setCookie(fieldsArray, 1)
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
          reCaptchaStatus = data.success;
        },
      });
      
      if (
        emailStatus &&
        passwordStatus &&
        confirmPasswordStatus &&
        reCaptchaStatus &&
        termsStatus
      ) {
        setCookie(fieldsArray, 1)
        return true;
      } else {
        grecaptcha.reset();
        return false;
      }
    }
  }
}

// Validate second step fields
{
  function validateSecondStep() {
    const accountType = jQuery(
      '.radio-container input[name="conta"]:checked'
    )[0].id;
    const user = document.querySelector("input#user");
    const firstName = document.querySelector("input#first-name");
    const lastName = document.querySelector("input#last-name");
    const documentType = document.querySelector("input#document");
    const cel = document.querySelector("input#cel");
    
    let fieldsArray = [];
    fieldsArray.push(document.querySelector('input[name="conta"]:checked'))
    fieldsArray.push(user)
    fieldsArray.push(firstName)
    fieldsArray.push(lastName)
    fieldsArray.push(documentType)
    fieldsArray.push(document.querySelector("input#birth"))
    fieldsArray.push(document.querySelector('input[name="genero"]:checked'))
    fieldsArray.push(cel)
    fieldsArray.push(document.querySelector("input#phone"))

    const userStatus = validateUser(user);
    const firstNameStatus = validateName(firstName);
    const lastNameStatus = validateName(lastName);
    const documentStatus = validateDocument(documentType);
    const celStatus = validateCel(cel);

    if (accountType === "fisica") {
      const birth = document.querySelector("input#birth");
      const birthStatus = validateBirth(birth);

      if (
        userStatus &&
        firstNameStatus &&
        lastNameStatus &&
        documentStatus &&
        celStatus &&
        birthStatus
      ) {
        setCookie(fieldsArray, 2)
        return true;
      } else {
        return false;
      }
    } else {
      if (
        userStatus &&
        firstNameStatus &&
        lastNameStatus &&
        documentStatus &&
        celStatus
      ) {
        setCookie(fieldsArray, 2)
        return true;
      } else {
        console.log(`
        1: ${userStatus}
        2: ${firstNameStatus}
        3: ${lastNameStatus}
        4: ${documentStatus}
        5: ${celStatus}
        `)
        return false;
      }
    }
  }
}

// Validate third step fields
{
  function validateThirdStep() {
    const state = document.querySelector("#state");
    const city = document.querySelector("#city");
    const neighborhood = document.querySelector("#neighborhood");
    const street = document.querySelector("#street");
    const number = document.querySelector("#number");

    let fieldsArray = [];
    fieldsArray.push(state)
    fieldsArray.push(city)
    fieldsArray.push(neighborhood)
    fieldsArray.push(street)
    fieldsArray.push(number)
    fieldsArray.push(document.querySelector('#country'))
    fieldsArray.push(document.querySelector('#cep'))
    fieldsArray.push(document.querySelector('#obs'))

    const countryStatus = validNationalCEP;
    const cepStatus = validNationalCEP;
    const stateStatus = validateLocationContent(state);
    const cityStatus = validateLocationContent(city);
    const neighborhoodStatus = validateLocationContent(neighborhood);
    const streetStatus = validateLocationContent(street);
    const numberStatus = validateLocationContent(number);
    
    if (
      countryStatus &&
      cepStatus &&
      stateStatus &&
      cityStatus &&
      neighborhoodStatus &&
      streetStatus &&
      numberStatus
    ) {
      setCookie(fieldsArray, 3)
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

    let fieldsArray = []
    fieldsArray.push(selectedPlan)

    if (selectedPlan !== null) {
      setCookie(fieldsArray, 4)
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
    let birthValue = document.querySelector("#birth").value.split('-')

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
      birth: `${birthValue[2]}/${birthValue[1]}/${birthValue[0]}`,
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
          account.planName = "Plano digital";
          account.planTemp = "12 meses";
          account.planValue = "R$ 118,80 (Parcelamento em até 12 vezes de R$ 9,90)";
        break;
        case "plan3":
          account.planName = "Plano Compartilhado";
          account.planTemp = "12 meses";
          account.planValue = "R$ 238,80 (Parcelamento em até 12 vezes de R$ 19,90)";
        break;
        case "plan4":
          account.planName = "Plano Premium";
          account.planTemp = "12 meses";
          account.planValue = "R$ 240,00 (Parcelamento em até 12 vezes de R$ 20,00)";
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
              Celular: 
            </span> 
          </strong>
          <span>${account.cel}</span>
        </div>`;

      if (account.phone !== "") {
        personalText += `
        <div class="row cel-data-container">
          <strong>
            <span>
              Celular: 
            </span> 
          </strong>
          <span>${account.phone}</span>
        </div>
        `;
      } else {
        personalText += `
        <div class="row cel-data-container">
          <strong>
            <span>
              Telefone: 
            </span> 
          </strong>
          <span>Não informado</span>
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
  function textFeedback(success, content = '') {
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
          textFeedback(false, 'Preencha todos os campos corretamente')
          return false;
        } else {
          textFeedback(true)
          return step11;
        }
      case 2:
        let step21 = validateFirstStep(false);
        let step22 = validateSecondStep();
        if (!step21) {
          textFeedback(false, 'Verifique os campos da etapa anterior')
          return false;
        } else if (!step22) {
          textFeedback(false, 'Preencha todos os campos corretamente')
          return false;
        } else {
          textFeedback(true)
          return step22;
        }
      case 3:
        let step31 = validateFirstStep(false);
        let step32 = validateSecondStep();
        let step33 = validateThirdStep();
        if (!step31) {
          textFeedback(false, 'Verifique os campos da primeira etapa')
          return false;
        } else if (!step32) {
          textFeedback(false, 'Verifique os campos da etapa anterior')
          return false;
        } else if (!step33) {
          textFeedback(false, 'Preencha todos os campos corretamente')
          return false;
        } else {
          textFeedback(true)
          return step33;
        }
      case 4:
        let step41 = validateFirstStep(false);
        let step42 = validateSecondStep();
        let step43 = validateThirdStep();
        let step44 = validateFourthStep();
        if (!step41) {
          textFeedback(false, 'Verifique os campos da primeira etapa')
          return false;
        } else if (!step42) {
          textFeedback(false, 'Verifique os campos da segunda etapa')
          return false;
        } else if (!step43) {
          textFeedback(false, 'Verifique os campos da etapa anterior')
          return false;
        } else if (!step44) {
          textFeedback(false, 'Preencha todos os campos corretamente')
          return false;
        } else {
          textFeedback(true)
          return step44;
        }
      case 5:
        let step51 = validateFirstStep(false);
        let step52 = validateSecondStep();
        let step53 = validateThirdStep();
        let step54 = validateFourthStep();
        if (!step51) {
          textFeedback(false, 'Verifique os campos da primeira etapa')
          return false;
        } else if (!step52) {
          textFeedback(false, 'Verifique os campos da segunda etapa')
          return false;
        } else if (!step53) {
          textFeedback(false, 'Verifique os campos da etapa anterior')
          return false;
        } else if (!step54) {
          textFeedback(false, 'Preencha todos os campos corretamente')
          return false;
        } else {
          textFeedback(true)
          return step54;
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
    
    if (currentStep == targetStep) {
      stepValidation(currentStep)
      Cookies.remove('fields')
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
      }
    } else {
      textFeedback(true, '')
      const body = $("html, body");
      const form = $(".content-container").offset().top;
      body.stop().animate({ scrollTop: form }, 500, "swing");

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

  jQuery('input.avancar[type="button"][data-step="4"]').click(function() {
    getValue()
  })
}
