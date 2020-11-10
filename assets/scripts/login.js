let isRendered = false

jQuery(window).on('load', function() {
  jQuery('.vvale-svg').addClass('vvale-animate')
  renderCaptcha()
  jQuery('.relative-step').addClass('show-step')
})

function validateUser() {
  isValid = false
  let user = jQuery('#user').val()
  let pattern = /\s/

  if(user.length > 0 && !pattern.test(user)) {
    isValid = true
  }

  return isValid
}


/*
function changeText(isHover) {
  let label = jQuery('#username-label')

  if(isHover === true) {
    label.removeClass('show')
    setTimeout(function() {
      label.html('<span class="light">E-mail ou nome de usuário</span><span class="required">*</span>')
      label.addClass('show')
    }, 120)
  } else {
    label.removeClass('show')
    setTimeout(function() {
      label.html('Login<span class="required">*</span>')
      label.addClass('show')
    }, 120)
  }
}

jQuery('#user').focus(function() {
  changeText(true)
})
jQuery('#user').blur(function() {
  changeText(false)
}) */

function validatePassword() {
  isValid = false
  let password = jQuery('#password').val()

  if(password.length >= 8) {
    isValid = true
  }

  return isValid
}

function validateCaptcha() {
  isValid = false
  let reCaptcha = grecaptcha.getResponse()

  if(reCaptcha.length !== 0) {
    isValid = true
  }

  return isValid
}

function renderCaptcha() {
  if(isNaN(parseInt(sessionStorage.attempts))) {
    sessionStorage.attempts = 0
  }

  if(parseInt(sessionStorage.attempts) >= 3) {
    let container = document.querySelector('#captcha-login-container')
    
    if(isRendered === false) {
      setTimeout(function() {
        grecaptcha.render(container, {
          'sitekey' : window.websiteKey
        })
        jQuery('.captcha-login').addClass('show')
  
        isRendered = true
      }, 500)
    }
    return true
  }
  return false
}

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

function validateLogin() {
  isValid = false

  if(!validateUser()) {
    textFeedback(false, 'Usuário inválido')
    sessionStorage.attempts = Number(sessionStorage.attempts) + 1
    renderCaptcha()
    return isValid
  }
  
  if(!validatePassword()) {
    textFeedback(false, 'Senha inválida')
    sessionStorage.attempts = Number(sessionStorage.attempts) + 1
    renderCaptcha()
    return isValid
  }

  if(!renderCaptcha()) {
    if(validateUser() && validatePassword()) {
      textFeedback(true)
      sessionStorage.clear()
      isValid = true
      jQuery('.relative-step').removeClass('show-step')
      window.location.replace('https://www.vvale.com.br/')
    }
  } else {
    if(!validateCaptcha()) {
      textFeedback(false, 'Falha na verificação de segurança')
      sessionStorage.attempts = Number(sessionStorage.attempts) + 1
      return isValid
    }
    if(validateUser() && validatePassword() && validateCaptcha()) {
      textFeedback(true)
      sessionStorage.clear()
      isValid = true
      jQuery('.relative-step').removeClass('show-step')
      window.location.replace('https://www.vvale.com.br/')
    }
  }
  return isValid
}

jQuery('.login-button').on('click', validateLogin)