const reCaptchaSecret = '6Lc3bdQZAAAAAG_SZVR9pqkZVnfS6HjNKXVveBU-'

jQuery(document).ready(function() {
  const maskBehavior = function (val) {
    return val.replace(/\D/g, '').length === 11 ? '(00) 0 0000-0000' : '(00) 0000-00009';
  },
  Options = {
    onKeyPress: function(val, e, field, options) {
        field.mask(maskBehavior.apply({}, arguments), options);
      }
  };

  jQuery('#phone').mask(maskBehavior, Options);
})

// Toggle password visibility
{function togglePassword(element) {
  const label = element.attr('data-related');
  const field = jQuery(`.field#${label}`);
  if (field.attr('type') === 'password') {
    field.attr('type', 'text');
  } else {
    field.attr('type', 'password');
  }
}

jQuery('.password-eye').on('click', function () {
  togglePassword(jQuery(this));
});}

// Check field status on keyup
{
  // Validate e-mail
  function validateEmail(field) {
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const content = field.value.toLowerCase();
    let isValid = false;
  
    if(pattern.test(content)) {
      isValid = true;
    };
  
    return isValid;
  }
  
  // Validate password
  function validatePassword(field, compareField) {
    const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$&+,:;=?@#|< >.^*()%!-]{8,}$/
    const content = field.value
    let isValid = false
  
    const charCheck = document.querySelector(`#${field.dataset.field} #tooltip-letter`)
    const numberCheck = document.querySelector(`#${field.dataset.field} #tooltip-number`)
    const lenghtCheck = document.querySelector(`#${field.dataset.field} #tooltip-lenght`)
  
    // Test number
    if(/\d/.test(content)) {
      numberCheck.classList.add('done')
    } else {
      numberCheck.classList.remove('done')
    }
    
    // Test char
    if(/[a-zA-Z]/.test(content)) {
      charCheck.classList.add('done')
    } else {
      charCheck.classList.remove('done')
    }
    
    // Test size
    if(content.length >= 8) {
      lenghtCheck.classList.add('done')
    } else {
      lenghtCheck.classList.remove('done')
    }
  
    // Comparison logic
    if(compareField != null) {
      const confirmPass = document.querySelector('#tippy-second-pass #tooltip-compare')
      const firstFieldValue = compareField.value
  
      if ((content === firstFieldValue) && (content.length > 0)) {
        confirmPass.classList.remove('done')
        confirmPass.classList.add('done')
        if (pattern.test(content)) {
          isValid = true
        }
      } else {
        confirmPass.classList.remove('done')
      }
    } else {
      if (pattern.test(content)) {
        isValid = true
      }
    }
  
    return isValid;
  }

  // Validate first and last name
  function validateName(field) {
    let isValid = false
    const pattern = /^[a-zA-Z\s]*$/

    if (field.value.length > 1 && pattern.test(field.value)) {
      isValid = true
    }

    return isValid
  }

  // Validate CPF of CNPJ
  function validateDocument(field) {
    let isValid = false
    const pattern = /(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/
    const content = field.value

    if(pattern.test(content)) {
      isValid = true
    }

    return isValid
  }

  // Validate birth date
  function validateBirth(field) {
    let isValid = false
    let birthDate = new Date(field.value)
    let currentDate = new Date()

    if(birthDate < currentDate) {
      isValid = true
    }

    return isValid
  }

  // Validate phone number
  function validatePhone(field) {
    isValid = false

    if(field.value.length >= 14) {
      isValid = true
    } 
    return isValid
  }
  
  // Return something
  function feedback(target, status) {
    if(target.value === '') {
      target.classList.remove('invalid');
      target.classList.remove('valid');
      return false;
    }
  
    if (status) {
      target.classList.remove('invalid');
      target.classList.add('valid');
    } else {
      target.classList.remove('valid');
      target.classList.add('invalid');
    }
  }
  
  // Main functions
  function checkEmail(field) {
    let valid = validateEmail(field);
    feedback(field, valid);
  }
  
  function checkPassword(field, comparisonField) {
    let valid = validatePassword(field, comparisonField);
    feedback(field, valid);
  }

  function checkName(field) {
    let valid = validateName(field)
    feedback(field, valid)
  }

  function checkDocument(field) {
    let valid = validateDocument(field)
    feedback(field, valid)
  }

  function checkBirth(field) {
    let valid = validateBirth(field)
    feedback(field, valid)
  }

  function checkPhone(field) {
    let valid = validatePhone(field)
    feedback(field, valid)
  }
  
  // Call
  jQuery('#email').on('keyup', function() {
    checkEmail(this);
  });
  
  jQuery('#first-pass').on('keyup', function() {
    const comparisonField = document.querySelector('#second-pass');
    checkPassword(this);
    checkPassword(comparisonField, this);
  });
  
  jQuery('#second-pass').on('keyup', function() {
    const comparisonField = document.querySelector('#first-pass');
    checkPassword(this, comparisonField);
  });

  jQuery('#first-name').on('keyup', function() {
    checkName(this)
  })

  jQuery('#last-name').on('keyup', function() {
    checkName(this)
  })

  jQuery('#document').on('keyup', function() {
    checkDocument(this)
  })

  jQuery('#birth').on('keyup', function() {
    checkBirth(this)
  })

  jQuery('#phone').on('keyup', function() {
    checkPhone(this)
  })
}

// Tooltip
{
  let template = document.querySelector('#tippy-first-pass');
  
  tippy('#first-pass', {
    theme: 'vvale',
    content: template.innerHTML,
    allowHTML: true,
    duration: [150, 150],
    trigger: 'focus',
    placement: 'bottom-start',
    animation: 'shift-toward',
    onShow(pass) {
      const passField = document.querySelector('#first-pass');
      passField.addEventListener('keyup', function() {
        pass.setContent(template.innerHTML)
      })
    }
  });
  
  let template2 = document.querySelector('#tippy-second-pass');
  
  tippy('#second-pass', {
    theme: 'vvale',
    content: template2.innerHTML,
    allowHTML: true,
    duration: [150, 150],
    trigger: 'focus',
    placement: 'bottom-start',
    animation: 'shift-toward',
    onShow(pass) {
      const passField1 = document.querySelector('#first-pass');
      const passField2 = document.querySelector('#second-pass');
      passField1.addEventListener('keyup', function() {
        pass.setContent(template2.innerHTML)
      })
      passField2.addEventListener('keyup', function() {
        pass.setContent(template2.innerHTML)
      })
    }
  });
}

// Validate first step fields
{function validateFirstStep(needCaptcha = false) {
  // Every field must be valid
  // Terms checkbox must be checked
  // Google reCaptcha must return true
  // Optional: DB consult with e-mail should return null
  
  let emailField = document.querySelector('#email')
  let passwordField = document.querySelector('#first-pass')
  let confirmPassword = document.querySelector('#second-pass')
  let termsCheckbox = document.querySelector('#termos')
  
  let emailStatus = validateEmail(emailField)
  let passwordStatus = validatePassword(passwordField)
  let confirmPasswordStatus = validatePassword(confirmPassword, passwordField)
  let termsStatus = false
  
  if (termsCheckbox.checked) {
    termsStatus = true
  }
  
  if(needCaptcha === false) {
    console.log('First step verification')
    console.log(`
    Email: ${emailStatus}
    FirstPass: ${passwordStatus}
    SecondPass: ${confirmPasswordStatus}
    TermsStatus: ${termsStatus}
    `)
    
    if(emailStatus && passwordStatus && confirmPasswordStatus && termsStatus) {
      return true
    } else {
      return false
    }
  } else {
    let reCaptcha = grecaptcha.getResponse();
    let reCaptchaStatus = false
    
    jQuery.ajax({
      url: 'https://www.google.com/recaptcha/api/siteverify',
      type: 'POST',
      data: {
        secret : reCaptchaSecret,
        response : reCaptcha 
      },
      success: function(data) {
        reCaptchaStatus = data.success
      },
      async: false
    })
    
    console.log('First step verification')
    console.log(`
    Email: ${emailStatus}
    FirstPass: ${passwordStatus}
    SecondPass: ${confirmPasswordStatus}
    reCaptcha: ${reCaptchaStatus}
    TermsStatus: ${termsStatus}
    `)
    
    if(emailStatus && passwordStatus && confirmPasswordStatus && reCaptchaStatus && termsStatus) {
      return true
    } else {
      grecaptcha.reset()
      return false
    }
  }
}}

// List of each step validation
{function stepValidation(step) {
  switch(step) {
    case 1:
      let status = validateFirstStep(true)
      console.log(`FinalResult: ${status}`)
      return status
  }
}}

// Update map step by step
{function updateMap(currentStep, nextStep) {
  const stepContainer = document.querySelector('.step-container')

  // Toggle map
  function toggleMap(nextStep) {
    if (nextStep >= 2) {
      setTimeout(function() {
        stepContainer.classList.add('show-map')
      }, 400)
    } else {
      setTimeout(function() {
        stepContainer.classList.remove('show-map')
      }, 400)
    }
  }
  toggleMap(nextStep)

  // Update steps
  function updateStep(currentStep, nextStep) {
    const currentCircle = jQuery(`.map-step[data-step=${currentStep}]`)[0]
    const nextCircle = jQuery(`.map-step[data-step=${nextStep}]`)[0]
    if(nextCircle === undefined) {
      console.log(`Can't go anywhere`)
      return false
    }

    if(currentStep > nextStep) {
      const stroke = jQuery(`.sep[data-step=${nextStep}]`)[0]

      setTimeout(function() {
        currentCircle.classList.remove('active')
        
        setTimeout(function() {
          stroke.classList.remove('done')
          nextCircle.classList.remove('done')
          nextCircle.classList.add('active')
        }, 200)
      }, 250)
    } else if (currentStep < nextStep) {
      const stroke = jQuery(`.sep[data-step=${currentStep}]`)[0]

      setTimeout(function() {
        currentCircle.classList.remove('active')
        currentCircle.classList.add('done')
        stroke.classList.add('done')
        
        setTimeout(function() {
          nextCircle.classList.add('active')
        }, 200)
      }, 250)
    } else {
      console.log('This function must receive different steps as parameter')
      return false
    }
  }
  updateStep(currentStep, nextStep)
}}

// Call next step
{function nextStep(step) {
  const currentStep = step;
  const nextStep = step + 1;

  if(stepValidation(currentStep) === true) {
    updateMap(currentStep, nextStep)

    const currentBoard = jQuery(`.step-board[data-step=${step}]`)[0]
    const nextBoard = jQuery(`.step-board[data-step=${nextStep}]`)[0]

    const body = $('html, body');
    body.stop().animate({scrollTop:0}, 500, 'swing');

    currentBoard.classList.remove('show-step')

    setTimeout(function() {
      currentBoard.classList.remove('relative-step')
      nextBoard.classList.add('relative-step')
      
      setTimeout(function() {
        nextBoard.classList.add('show-step')
      }, 200)
    }, 650)
  } else {
    console.log('Verifique os campos digitados')
  }
}

jQuery('.avancar').click(function() {
  let step = (jQuery(this).data('step'))
  nextStep(step)
})}