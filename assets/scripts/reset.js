let userEmail = 'gui_hellwinkel@hotmail.com'
let limitTime = 0;
let sec = 60;

jQuery(window).on("load", function () { 
  // Animate page load
  {
    jQuery(".relative-step").addClass("show-step");
    jQuery(".vvale-svg").addClass("vvale-animate");
    jQuery(".no-margin").addClass("show");
  }

  // Mask to CPF and CNPJ
  {
    const MaskBehavior = function (val) {
        return val.replace(/\D/g, "").length <= 11
          ? "000.000.000-009"
          : "00.000.000/0000-00";
      },
      Options = {
        onKeyPress: function (val, e, field, options) {
          field.mask(MaskBehavior.apply({}, arguments), options);
        },
      };
    jQuery("input#document").mask(MaskBehavior, Options);
  }
});

// Get selected method (e-mail or password)
{
  function getActiveMethod() {
    const buttons = jQuery(".reset-container label");
    let activeMethod = jQuery(".reset-container input:checked").attr("id");
    let text = jQuery(".no-margin");
  
    function changeFields(fieldText) {
      text.removeClass("show");
      setTimeout(function () {
        text.html(fieldText);
        text.addClass("show");
      }, 250);
    }
  
    if (activeMethod === "reset-email") {
      changeFields(
        "Siga as instruções da próxima etapa<br> para recuperar o e-mail cadastrado"
      );
      jQuery(".reset-button").attr("data-function", "email");
      jQuery(".reset-button").attr("data-target", "2");
    } else {
      changeFields(
        "Enviaremos um link para o endereço<br> de e-mail cadastrado na sua conta"
        );
        jQuery(".reset-button").attr("data-function", "password");
        jQuery(".reset-button").attr("data-target", "3");
    }
  
    buttons.each(function () {
      if (jQuery(this).attr("for") === activeMethod) {
        jQuery(this).addClass("active");
      } else {
        jQuery(this).removeClass("active");
      }
    });
  }

  jQuery(".reset-container label").on("change", getActiveMethod);
}

// Validate document
{
  function validateDocument() {
    let isValid = false
    let field = jQuery('#document')
  
    if(field.val().length === 14 || field.val().length === 18) {
      isValid = true
    }
  
    return isValid
  }
  
  function checkDocument() {
    let isValid = false
    let status = validateDocument()
    let field = jQuery('#document')
  
    if(field.val().length > 0) {
      if (!status) {
        field.removeClass('valid')
        field.addClass('invalid')
      } else {
        field.removeClass('invalid')
        field.addClass('valid')
        isValid = true
      }
    } else {
      field.removeClass('valid')
      field.removeClass('invalid')
    }
    return isValid
  }
  
  jQuery('#document').on('keyup', function() {
    checkDocument()
  })
  
  jQuery('#document').on('blur', function() {
    checkDocument()
  })
}

// Validate document step to show e-mail
{
  function validateRegister() {
    let mainContainer = jQuery('.main-container')
    let responseContainer = jQuery('.response-container')
    let emailResponse = jQuery('.email-response')
  
    if(checkDocument()) {
      textFeedback(true)
      mainContainer.removeClass('show')
      responseContainer.addClass('show')
  
      // Fix @ PHP
      let value = userEmail.split('@')[0]
      let valueLength = value.length
      let finalValue = ''
      for(let i = 0; i < valueLength; i++) {
        if(i < (parseInt(valueLength / 3)) || i >= valueLength - 2) {
          finalValue += value[i]
        } else {
          finalValue += '*'
        }
      }
      finalValue += '@' + userEmail.split('@')[1]
      emailResponse.html(finalValue)
    } else {
      textFeedback(false, 'Insira um documento válido')
    }
  }
  
  jQuery('.check-document').on('click', function() {
    validateRegister()
  })
}

// Resend e-mail
{
  function resendEmail() {
    if (timer()) {
      // Send message
    }
  }
  
  // Timer
  function timer() {
    let canSend = true
    currentTime = new Date()
    
    if(currentTime < limitTime) {
      canSend = false
    } else {
      limitTime = currentTime.getTime() + 60000
      remainingTime()
    }
    return canSend
  }
  
  // showRemainingTime
  function remainingTime() {
    let sec = 60
    jQuery('.resend').animate({
      height: 0,
      opacity: 0
    }, 250)
    jQuery('.cooldown').animate({
      height: 55,
      opacity: 1
    }, 250)
    jQuery('.clock').html(`${sec} segundos`)
    setInterval(function() {
      sec = sec - 1
      if (sec >= 10 && sec <= 60) {
        jQuery('.clock').html(`${sec} segundos`)
      } 
      if (sec < 10 && sec > 0) {
        jQuery('.clock').html(`0${sec} segundos`)
      } 
      if (sec === 1) {
        jQuery('.clock').html(`0${sec} segundo`)
      } 
      if (sec === 0) {
        setTimeout(function() {
          jQuery('.cooldown').animate({
            height: 0,
            opacity: 0
          }, 250)
          jQuery('.resend').animate({
            height: 55,
            opacity: 1
          }, 250)
          jQuery('.resend input[type="button"]').blur()
        }, 200)
      }
    }, 1000)
  }
  
  jQuery('p.content input').click(resendEmail)
}

// Error visual feedback (red messages)
{
  function textFeedback(success, content = '') {
    let feedback = jQuery('span.feedback')
    if (!success) {
      feedback.each(function () {
        jQuery(this).animate({
          height: 40,
          marginBottom: 10
        }, 250)
        jQuery(this).html(content)
      })
    } else {
      feedback.each(function () {
        jQuery(this).animate({
          height: 0,
          marginBottom: 0
        }, 250)
        jQuery(this).html('')
      })
    }
  }
}

// Call next step
{
  function nextStep(step = null, nextStep = null) {
    const currentStep = step;
    const targetStep = nextStep;
    let feedback = jQuery("span.feedback");
  
    if (currentStep == targetStep) {
      //nextStep must receive different values on current and target step. Check your call and try again
      return false;
    }
  
    if (currentStep < targetStep) {
      feedback.html("");
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
      feedback.html("");
  
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
  
  jQuery(".reset-button").click(function () {
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
