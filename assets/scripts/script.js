const reCaptchaSecret = '6Lc3bdQZAAAAAG_SZVR9pqkZVnfS6HjNKXVveBU-'

// Toggle password visibility

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

// Call
jQuery("#email").on('keyup', function() {
  checkEmail(this);
});

jQuery("#first-pass").on('keyup', function() {
  const comparisonField = document.querySelector('#second-pass');
  checkPassword(this);
  checkPassword(comparisonField, this);
});

jQuery("#second-pass").on('keyup', function() {
  const comparisonField = document.querySelector('#first-pass');
  checkPassword(this, comparisonField);
});


// Tooltip
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

// Validate first step

// Every field must be valid
// Terms checkbox must be checked
// Google reCaptcha must return true
// Optional: DB consult with e-mail should return null

function validateFirstStep(needCaptcha = false) {
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
      return false
    }
  }
}

const firstStepButton = document.querySelector('.first-board .avancar')

firstStepButton.addEventListener('click', function() {
  // const validateResult = validateFirstStep(true)
  // console.log(`FinalResult: ${validateResult}`)
  
  // if(validateResult) {
  //   console.log('Step 1: validated')
    
    const firstStep = document.querySelector('.first-board')
    const secondStep = document.querySelector('.second-board')
    const stepMap = document.querySelector('.step-container')
    const sepMap = document.querySelectorAll('.sep')
    const mapStep1 = document.querySelector('.map-step[data-step="step-1"]')
    const mapStep2 = document.querySelector('.map-step[data-step="step-2"]')
    
    const body = $("html, body");
    body.stop().animate({scrollTop:0}, 500, 'swing');
    firstStep.classList.remove('show-step')
    
    setTimeout(function() {
      stepMap.classList.add('show-map')

      setTimeout(function() {
        mapStep1.classList.add('done')
        sepMap[0].classList.add('done')
        firstStep.classList.remove('relative-step')
        secondStep.classList.add('relative-step')
        
        setTimeout(function() {
          mapStep2.classList.add('active')
          secondStep.classList.add('show-step')
        }, 200)
      }, 250)
    },400)
  // }
})


function nextStep(validation) {
  // retorno de verificação
  // salva etapa atual
  // seleciona elemento futuro com data
  // executa as trocas de classe

}