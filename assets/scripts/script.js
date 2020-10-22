const reCaptchaSecret = "6Lc3bdQZAAAAAG_SZVR9pqkZVnfS6HjNKXVveBU-";
let birthInitialHeight
let genderInitialHeight
let validNationalCEP = false
let states = []

jQuery(document).ready(function () {
  console.clear()

  getCountry()
  getState()

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
    let dd  = field.value.split("/")[0];
    let mm  = field.value.split("/")[1];
    let yyyy  = field.value.split("/")[2];

    let formatedBirth = yyyy + '-' + ("0" + mm).slice(-2) + '-' + ("0" + dd).slice(-2);
    let birthDate = new Date(formatedBirth);
    let currentDate = new Date();

    if (field.value.length === 10) {
      if (birthDate < currentDate) {
        isValid = true;
      }
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
  function validateCountry(field, cep = null) {
    let isValid = false
    const country = field.options[field.selectedIndex]

    if(country.value !== ''){
      if((cep !== null) && (cep !== typeof undefined)) {
        if(cep.attr('disabled') !== typeof undefined) {
          cep.removeAttr('disabled')
          if(country.value === 'Brasil') {
            cep.unmask()
            cep.mask("00000000")
          } else {
            cep.unmask()
            cep.mask('0000999999')
          }
        }
      }
      isValid = true
    }

    validateCep(cep, country.value)

    return isValid
  }

  // Validate CEP
  function validateCep(field, countryValue) {
    let isValid = false
    const state = document.querySelector('#state')
    const city = document.querySelector('#city')
    const neighborhood = document.querySelector('#neighborhood')
    const street = document.querySelector('#street')
    const number = document.querySelector('#number')
    const obs = document.querySelector('#obs')
    
    if(field.value > 0) {
      if(countryValue === 'Brasil') {
        let cep = field.value
        if(cep.length === 8) {
          jQuery.ajax({
            url: `https://viacep.com.br/ws/${cep}/json/`,
            type: 'GET',
            async: false,
            success: function(data) {
              if(data.erro === true) {
                isValid = false
                validNationalCEP = false
              } else {
                if(data.uf !== '') {
                  states.forEach((e) => {
                    if(e.initials === data.uf) {
                      state.value = e.state
                      checkLocationContent(state)
                    }
                  })
                } else {
                  state.removeAttribute('disabled')
                }

                if(data.localidade !== '') {
                  city.value = data.localidade
                  checkLocationContent(city)
                } else {
                  city.removeAttribute('disabled')
                }

                if(data.bairro !== '') {
                  neighborhood.value = data.bairro
                  checkLocationContent(neighborhood)
                } else {
                  neighborhood.removeAttribute('disabled')
                }

                if(data.logradouro !== '') {
                  street.value = data.logradouro
                  checkLocationContent(street)
                } else {
                  street.removeAttribute('disabled')
                }

                number.removeAttribute('disabled')
                obs.removeAttribute('disabled')
                
                validNationalCEP = true
                isValid = true
              }
            }
          }).fail((err) => {
            state.removeAttribute('disabled')
            city.removeAttribute('disabled')
            neighborhood.removeAttribute('disabled')
            street.removeAttribute('disabled')
            number.removeAttribute('disabled')
            obs.removeAttribute('disabled')
            
            console.error(err)
            
            validNationalCEP = true
            isValid = true
          })
        }
      } else {
        let content = field.value
        if(content.length >= 4) {
          state.removeAttribute('disabled')
          city.removeAttribute('disabled')
          neighborhood.removeAttribute('disabled')
          street.removeAttribute('disabled')
          number.removeAttribute('disabled')
          obs.removeAttribute('disabled')
          
          validNationalCEP = true
          isValid = true
        }
      }
    }
    
    if(isValid === false) {
      state.value = ''
      state.setAttribute = 'disabled'
      checkLocationContent(state)
      
      city.value = ''
      city.setAttribute = 'disabled'
      checkLocationContent(city)
      
      neighborhood.value = ''
      neighborhood.setAttribute = 'disabled'
      checkLocationContent(neighborhood)
      
      street.value = ''
      street.setAttribute = 'disabled'
      checkLocationContent(street)
      
      number.value = ''
      number.setAttribute = 'disabled'
      checkLocationContent(number)
      
      obs.value = ''
      obs.setAttribute = 'disabled'
      checkLocationContent(obs)
    }
    return isValid
  }

  // Validate location content
  
  function validateLocationContent(field) {
    let isValid = false

    let fieldValue = field.value
    if (fieldValue.length > 1) {
      isValid = true
    }

    return isValid
  }

  // Return something
  function feedback(target, status) {
    const elementType = $(target).prop('nodeName')
    if (elementType !== 'SELECT') {
      if (target.value === "") {
        target.classList.remove("invalid");
        target.classList.remove("valid");
        return false;
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
      let valid = validateCountry(field, cep)
      feedback(field, valid)
    }

    function checkCep(field, country) {
      let valid = validateCep(field, country)
      feedback(field, valid)
    }

    function checkLocationContent(field) {
      let valid = validateLocationContent(field)
      feedback(field, valid)
    }
  }

  // Call
  {
    jQuery("#email").on("keyup", function () {
      checkEmail(this);
    });
  
    jQuery("#first-pass").on("keyup", function () {
      const comparisonField = document.querySelector("#second-pass");
      checkPassword(this);
      checkPassword(comparisonField, this);
    });
  
    jQuery("#second-pass").on("keyup", function () {
      const comparisonField = document.querySelector("#first-pass");
      checkPassword(this, comparisonField);
    });
  
    jQuery("#user").on("keyup", function () {
      checkUser(this);
    });
  
    jQuery("#first-name").on("keyup", function () {
      checkName(this);
    });
  
    jQuery("#last-name").on("keyup", function () {
      checkName(this);
    });
  
    jQuery("#document").on("keyup", function () {
      checkDocument(this);
    });
  
    jQuery("#birth").on("keyup", function () {
      checkBirth(this);
    });

    jQuery("#birth").on("change", function () {
      checkBirth(this);
    });
  
    jQuery("#phone").on("keyup", function () {
      checkPhone(this);
    });
  
    jQuery("#cel").on("keyup", function () {
      checkPhone(this);
    });
    
    jQuery("select#country").on("change", function () {
      let cep = document.querySelector('#cep')
      cep.value = ''
      checkCep(cep, '')
      checkCountry(this, jQuery('#cep'));
    });
    
    jQuery("select#country").on("blur", function () {
      checkCountry(this, jQuery('#cep'));
    });

    jQuery("input#cep").on("keyup", function () {
      let country = jQuery("select#country")[0]
      country = country.options[country.selectedIndex].value
      checkCep(this, country)
    })

    jQuery("#state").on("keyup", function () {
      checkLocationContent(this)
    })

    jQuery("#city").on("keyup", function () {
      checkLocationContent(this)
    })
    
    jQuery('#neighborhood').on("keyup", function() {
      checkLocationContent(this)
    })
    
    jQuery('#street').on("keyup", function() {
      checkLocationContent(this)
    })
    
    jQuery('#number').on("keyup", function() {
      checkLocationContent(this)
    })
    
    jQuery('#obs').on("keyup", function() {
      checkLocationContent(this)
    })
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
    const select = document.querySelector('select[name=country]');

    jQuery.ajax({
      url: 'http://api.londrinaweb.com.br/PUC/Paisesv2/0/1000',
      type: 'GET',
      success: function(data) {
        data.forEach((e) => {
          let content

          if(e.Pais === "Brasil") {
            content = `
              <option value="${e.Pais}" selected>${e.Pais}</option>
            `
          } else {
            content = `
              <option value="${e.Pais}">${e.Pais}</option>
            `
          }

          select.innerHTML += content
        })

        checkCountry(select, jQuery('#cep'))
        
      }
    }).fail(function() {
      const fallbackCountry = ['Brasil', 'Argentina', 'Paraguai', 'Uruguai', 'Outro']
      fallbackCountry.forEach(function(e) {
        let content
        if(e === 'Brasil') {
          content = `
            <option value="${e}" selected>${e}</option>
          `
        } else {
          content = `
            <option value="${e}">${e}</option>
          `
        }
        select.innerHTML += content
      })

      checkCountry(select, jQuery('#cep'))
    })
  }
}

// Get state list
{
  function getState() {
    jQuery.ajax({
      url: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
      type: 'GET',
      success: function(data) {
        data.forEach((e) => {
          let item = {
            state: e.nome,
            initials: e.sigla
          }
          states.push(item)
        })
      }
    }).fail(function(err) {
      console.error(`
        Can't access states API.
        Error: ${err}
      `)
    })
  }
}

// CEP API 

// Change fields for different account types (CPF/CNPJ)
{
  function changeFields() {
    const accountType = jQuery('.radio-container input[name="conta"]:checked')[0].id;
    const document = jQuery('label[for="document"]');
    const documentField = jQuery("#document");
    const firstName = jQuery('label[for="first-name"]');
    const lastName = jQuery('label[for="last-name"');
    const birthContainer = jQuery(".birth-container");
    const birthInput = jQuery('.birth-container input')
    const genderContainer = jQuery(".gender-container");
    const genderInput = jQuery('.gender-container input')

    if (accountType === "fisica") {
      document.html('CPF<span class="required">*</span>');
      documentField.attr("placeholder", "000.000.000-00");
      documentField.unmask();
      documentField.mask("000.000.000-00");
      firstName.html('Nome<span class="required">*</span>');
      lastName.html('Sobrenome<span class="required">*</span>');
      birthContainer.css('display', 'block')
      genderContainer.css('display', 'block')
      birthContainer.animate(
        {
          opacity: 1,
          height: birthInitialHeight,
          overflow: 'initial'
        },
        200
        );
      genderContainer.animate(
        {
          opacity: 1,
          height: genderInitialHeight,
          overflow: 'initial'
        },
        200
      )
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
          overflow: 'hidden'
        },
        200
      )
      genderContainer.animate(
        {
          opacity: 0,
          height: 0,
          marginBottom: 0,
          overflow: 'hidden',
          display: 'none'
        },
        200
      )
      setTimeout(function() {
        birthContainer.css('display', 'none')
        genderContainer.css('display', 'none')
      }, 200)
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
      console.clear()
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
        data: {
          secret: reCaptchaSecret,
          response: reCaptcha,
        },
        success: function (data) {
          console.log(data)
          reCaptchaStatus = data.success
        },
      })
      console.clear()
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
    const accountType = jQuery('.radio-container input[name="conta"]:checked')[0].id
    const user = document.querySelector('input#user')
    const firstName = document.querySelector('input#first-name')
    const lastName = document.querySelector('input#last-name')
    const documentType = document.querySelector('input#document')
    const phone = document.querySelector('input#phone')

    const userStatus = validateUser(user)
    const firstNameStatus = validateName(firstName)
    const lastNameStatus = validateName(lastName)
    const documentStatus = validateDocument(documentType)
    const phoneStatus = validatePhone(phone)

    console.clear()
    console.log("Second step verify");

    if(accountType === 'fisica') {
      const birth = document.querySelector('input#birth')

      const birthStatus = validateBirth(birth)

      console.log(`
      userStatus: ${userStatus}
      firstNameStatus: ${firstNameStatus}
      lastNameStatus: ${lastNameStatus}
      documentStatus: ${documentStatus}
      phoneStatus: ${phoneStatus}
      birthStatus: ${birthStatus}
      `)

      if ((userStatus) && (firstNameStatus) && (lastNameStatus) && (documentStatus) && (phoneStatus) && (birthStatus)) {
        return true
      } else {
        return false
      }
    } else {
      console.log(`
      userStatus: ${userStatus}
      firstNameStatus: ${firstNameStatus}
      lastNameStatus: ${lastNameStatus}
      documentStatus: ${documentStatus}
      phoneStatus: ${phoneStatus}
      `)

      if ((userStatus) && (firstNameStatus) && (lastNameStatus) && (documentStatus) && (phoneStatus)) {
        return true
      } else {
        return false
      }
    }
  }
}

//Validate third step fields
{
  function validateThirdStep() {
    const state = document.querySelector('#state')
    const city = document.querySelector('#city')
    const neighborhood = document.querySelector('#neighborhood')
    const street = document.querySelector('#street')
    const number = document.querySelector('#number')

    const countryStatus = validNationalCEP
    const cepStatus = validNationalCEP
    const stateStatus = validateLocationContent(state)
    const cityStatus = validateLocationContent(city)
    const neighborhoodStatus = validateLocationContent(neighborhood)
    const streetStatus = validateLocationContent(street)
    const numberStatus = validateLocationContent(number)

    console.clear()
    console.log("Third step verify");
    console.log(`
      countryStatus: ${countryStatus}
      cepStatus: ${cepStatus}
      stateStatus: ${stateStatus}
      cityStatus: ${cityStatus}
      neighborhoodStatus: ${neighborhoodStatus}
      streetStatus: ${streetStatus}
      numberStatus: ${numberStatus}
    `)

    if((countryStatus) && (cepStatus) && (stateStatus) && (cityStatus) && (neighborhoodStatus) && (streetStatus) && (numberStatus)) {
      return true
    } else {
      return false
    }
  }
}

// List of each step validation
{
  function stepValidation(step) {
    switch (step) {
      case 1:
        let step11 = validateFirstStep(true)
        if(!step11) {
          console.error('First step error')
          return false
        } else {
          console.log(`FinalResult: ${step11}`)
          return step11
        }
      case 2:
        let step21 = validateFirstStep(false)
        if (!step21) {
          console.error('First step error')
          return false
        } else {
          console.log('First step OK')
          let step22 = validateSecondStep()
          console.log(`FinalResult: ${step22}`)
          return step22
        }
      case 3:
        let step31 = validateFirstStep(false)
        let step32 = validateSecondStep()
        if(!step31) {
          console.error('First step error')
          return false
        } else if(!step32) {
          console.error('Second step error')
        } else {
          console.log('Third step OK')
          let step33 = validateThirdStep()
          console.log(`FinalResult: ${step33}`)
          return step33  
      }
    }
  }
}

// Update map step by step
{
  function updateMap(currentStep, nextStep) {
    const stepContainer = document.querySelector(".step-container");

    // Toggle map
    function toggleMap(nextStep) {
      if (nextStep >= 2) {
        setTimeout(function () {
          stepContainer.classList.add("show-map");
        }, 400);
      } else {
        setTimeout(function () {
          stepContainer.classList.remove("show-map");
        }, 400);
      }
    }
    toggleMap(nextStep);

    // Update steps
    function updateStep(currentStep, nextStep) {
      const currentCircle = jQuery(`.map-step[data-step=${currentStep}]`)[0];
      const nextCircle = jQuery(`.map-step[data-step=${nextStep}]`)[0];
      if (nextCircle === undefined) {
        console.log(`Can't go anywhere`);
        return false;
      }

      if (currentStep > nextStep) {
        const stroke = jQuery(`.sep[data-step=${nextStep}]`)[0];

        setTimeout(function () {
          currentCircle.classList.remove("active");

          setTimeout(function () {
            stroke.classList.remove("done");
            nextCircle.classList.remove("done");
            nextCircle.classList.add("active");
          }, 200);
        }, 1500);
      } else if (currentStep < nextStep) {
        const stroke = jQuery(`.sep[data-step=${currentStep}]`)[0];

        setTimeout(function () {
          currentCircle.classList.remove("active");
          currentCircle.classList.add("done");
          
          setTimeout(function () {
            stroke.classList.add("done");
            setTimeout(function() {
              nextCircle.classList.add("active");
            }, 200);
          }, 200);
        }, 1500);
      } else {
        console.log("This function must receive different steps as parameter");
        return false;
      }
    }
    updateStep(currentStep, nextStep);
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
        updateMap(currentStep, nextStep);

        const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`)[0];
        const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`)[0];

        const body = $("html, body");
        const form = $(".content-container").offset().top;
        body.stop().animate({ scrollTop: 0 }, 500, "swing");

        currentBoard.classList.remove("show-step");

        setTimeout(function () {
          currentBoard.classList.remove("relative-step");
          nextBoard.classList.add("relative-step");

          setTimeout(function () {
            nextBoard.classList.add("show-step");
          }, 200);
        }, 650);
      } else {
        console.log("Verifique se todos os campos estão preenchidos corretamente");
      }
    } else {
      updateMap(currentStep, targetStep);

      const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`)[0];
      const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`)[0];

      const body = $("html, body");
      const form = $(".content-container").offset().top;
      body.stop().animate({ scrollTop: 0 }, 500, "swing");

      setTimeout(function () {
        currentBoard.classList.remove("show-step");

        setTimeout(function () {
          currentBoard.classList.remove("relative-step");
          nextBoard.classList.add("relative-step");

          setTimeout(function () {
            nextBoard.classList.add("show-step");
          }, 200);
        }, 650);
      }, 500)
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
}
