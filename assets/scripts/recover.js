let userEmail = "gui_hellwinkel@hotmail.com";
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
    const buttons = jQuery(".recover-container label");
    let activeMethod = jQuery(".recover-container input:checked").attr("id");
    let text = jQuery(".no-margin");

    function changeFields(fieldText) {
      text.removeClass("show");
      setTimeout(function () {
        text.html(fieldText);
        text.addClass("show");
      }, 250);
    }

    if (activeMethod === "recover-email") {
      changeFields(
        "Siga as instruções da próxima etapa<br> para recuperar o e-mail cadastrado"
      );
      jQuery(".recover-button").attr("data-function", "email");
      jQuery(".recover-button").attr("data-target", "2");
    } else {
      changeFields(
        "Enviaremos um link para o endereço<br> de e-mail cadastrado na sua conta"
      );
      jQuery(".recover-button").attr("data-function", "password");
      jQuery(".recover-button").attr("data-target", "4");
    }

    buttons.each(function () {
      if (jQuery(this).attr("for") === activeMethod) {
        jQuery(this).addClass("active");
      } else {
        jQuery(this).removeClass("active");
      }
    });
  }

  jQuery(".recover-container label").on("change", getActiveMethod);
}

// Validate document
{
  function validateDocument(field) {
    let isValid = false;

    if (field.val().length === 14 || field.val().length === 18) {
      isValid = true;
    }
    return isValid;
  } 

  function checkDocument(field) {
    let isValid = validateDocument(field);
    feedback(field, isValid)
  }

  jQuery("#document").on("keyup", function () {
    checkDocument(jQuery('#document'));
  });

  jQuery("#document").on("blur", function () {
    checkDocument(jQuery('#document'));
  });

  // Validate document step to show e-mail
  function validateRegister() {
    let isValid = false;
    
    if (validateDocument(jQuery('#document'))) {
      jQuery('.email-response').html(formatedEmail())
      isValid = true;
    }

    return isValid;
  }

// Hide part of e-mail address -> CHANGE TO PHP FUNCTION <-
  function formatedEmail() {
    let value = userEmail.split("@")[0];
    let valueLength = value.length;
    let finalValue = "";
    for (let i = 0; i < valueLength; i++) {
      if (i < parseInt(valueLength / 3) || i >= valueLength - 2) {
        finalValue += value[i];
      } else {
        finalValue += "*";
      }
    }
    finalValue += "@" + userEmail.split("@")[1];
    return finalValue
  }
}

// Validate email
{
  function validateEmail(field) {
    let isValid = false;
    let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (pattern.test(field.val())) {
      isValid = true;
    }
    return isValid;
  } 

  function checkEmail(field) {
    let isValid = validateEmail(field);
    feedback(field, isValid)
  }

  jQuery("#email").on("keyup", function () {
    checkEmail(jQuery('#email'));
  });

  jQuery("#email").on("blur", function () {
    checkEmail(jQuery('#email'));
  });

  // Validate e-mail to reset password
  function validateEmailStep() {
    let isValid = false
    
    if(validateEmail(jQuery('#email'))) {
      isValid = true
    }

    return isValid
  }
}

// Visual feedback 
{
  function feedback(field, status) {
    if (field.val().length > 0) {
      if (!status) {
        field.removeClass("valid");
        field.addClass("invalid");
      } else {
        field.removeClass("invalid");
        field.addClass("valid");
        isValid = true;
      }
    } else {
      field.removeClass("valid");
      field.removeClass("invalid");
    }
  }
}

// Resend e-mail with timer
{
  function resendEmail() {
    if (timer()) {
      // Send message
    }
  }

  // Timer
  function timer() {
    let canSend = true;
    currentTime = new Date();

    if (currentTime < limitTime) {
      canSend = false;
    } else {
      limitTime = currentTime.getTime() + 60000;
      remainingTime();
    }
    return canSend;
  }

  // showRemainingTime
  function remainingTime() {
    let sec = 60;
    jQuery(".resend").animate(
      {
        height: 0,
        opacity: 0,
      },
      250
    );
    jQuery(".cooldown").animate(
      {
        height: 55,
        opacity: 1,
      },
      250
    );
    jQuery(".clock").html(`${sec} segundos`);
    setInterval(function () {
      sec = sec - 1;
      if (sec >= 10 && sec <= 60) {
        jQuery(".clock").html(`${sec} segundos`);
      }
      if (sec < 10 && sec > 0) {
        jQuery(".clock").html(`0${sec} segundos`);
      }
      if (sec === 1) {
        jQuery(".clock").html(`0${sec} segundo`);
      }
      if (sec === 0) {
        setTimeout(function () {
          jQuery(".cooldown").animate(
            {
              height: 0,
              opacity: 0,
            },
            250
          );
          jQuery(".resend").animate(
            {
              height: 55,
              opacity: 1,
            },
            250
          );
          jQuery('.resend input[type="button"]').blur();
        }, 200);
      }
    }, 1000);
  }

  jQuery("p.content input").click(resendEmail);
}

// Visual text feedback (red messages)
{
  function textFeedback(success, content = "") {
    let feedback = jQuery("span.feedback");
    if (!success) {
      feedback.each(function () {
        jQuery(this).animate(
          {
            height: 20,
            marginBottom: 10,
          },
          250
        );
        jQuery(this).html(content);
      });
    } else {
      feedback.each(function () {
        jQuery(this).animate(
          {
            height: 0,
            marginBottom: 0,
          },
          250
        );
        jQuery(this).html("");
      });
    }
  }
}

// List of each step validation
{
  function stepValidation(step) {
    switch (parseInt(step)) {
      case 1:
        return true;
      case 2:
        if (validateRegister()) {
          return true;
        } else {
          textFeedback(false, "Insira um documento válido");
          return false;
        }
      case 3:
        return true;
      case 4:
        if (validateEmailStep()) {
          return true;
        } else {
          textFeedback(false, "Insira um e-mail válido");
          return false;
        }
    }
  }
}

// Call next step
{
  function nextStep(step = null, nextStep = null) {
    const currentStep = step;
    const targetStep = nextStep;

    if (currentStep == targetStep) {
      //nextStep must receive different values on current and target step. Check your call and try again
      return false;
    }

    if (currentStep < targetStep) {
      if (stepValidation(currentStep) === true) {
        textFeedback(true);
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
      textFeedback(true);
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
    let step = jQuery(this).attr("data-step");
    let target = jQuery(this).attr("data-target");
    nextStep(step, target);
  });

  jQuery(".voltar").click(function () {
    let step = jQuery(this).attr("data-step");
    let target = jQuery(this).attr("data-target");
    nextStep(step, target);
  });
}
