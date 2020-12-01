// TEMPORÁRIO
let userEmail = "guirovedah@gmail.com";
let userDocument = "103.645.789-39";
let amount = "238.80"
window.Mercadopago.setPublishableKey(
  "TEST-a6069a3b-c708-455b-8905-2ab8e1581b19"
);

jQuery(window).on("load", function () {
  jQuery(".relative-step").addClass("show-step");
  jQuery(".vvale-svg").addClass("vvale-animate");
  jQuery(".no-margin").addClass("show");

  // Mask to CPF and CNPJ
  {
    const documentMaskBehavior = function (val) {
        return val.replace(/\D/g, "").length <= 11
          ? "000.000.000-009"
          : "00.000.000/0000-00";
      },
      documentOptions = {
        onKeyPress: function (val, e, field, options) {
          field.mask(documentMaskBehavior.apply({}, arguments), options);
        },
      };
    jQuery("input#document").mask(documentMaskBehavior, documentOptions);
  }

  // Mask to card number
  {
    const cardMaskBehavior = function (val) {
        switch (val.replace(/\s/g, "").length) {
          case 15:
            return "0000 000000 000009";
          case 16:
            return "0000 0000 0000 0000";
          default:
            return "0000 000000 000099";
        }
      },
      cardOptions = {
        onKeyPress: function (val, e, field, options) {
          field.mask(cardMaskBehavior.apply({}, arguments), options);
        },
      };
    jQuery("input#cardNumber").mask(cardMaskBehavior, cardOptions);
  }

  // Fill tempInstallments with a simulated value
  {
    function installments() {
      let options = ''
  
      for(let i = 1; i <= 12; i++) {
        if (i === 1) {
          options += `<option value="${i}">${i} parcela de R$${amount.replace('.', ',')} (R$${amount.replace('.', ',')})</option>`
        } else {
          if(i === 12) {
            options += `<option value="${i}" selected>${i} parcelas de R$${(parseFloat(amount)/i).toFixed(2).replace('.', ',')} (R$${amount.replace('.', ',')})</option>`
          } else {
            options += `<option value="${i}">${i} parcelas de R$${(parseFloat(amount)/i).toFixed(2).replace('.', ',')} (R$${amount.replace('.', ',')})</option>`
          }
        }
      }

      jQuery('#tempInstallments').html(options)
    }
  
    installments()
  }

  // TEMPORÁRIO
  jQuery("#email").val(userEmail);
  jQuery("#document").val(userDocument);
  jQuery('#transactionAmount').attr('value', amount)

  window.Mercadopago.getIdentificationTypes();
});

// Prevent submit
{
  function preventSubmit(e) {
    let button = jQuery(".step-board.relative-step.show-step .avancar");
    let currentStep = parseInt(button.attr("data-step"));
    let targetStep = parseInt(button.attr("data-target"));
    if (e.key == "Enter") {
      e.preventDefault();
      nextStep(currentStep, targetStep);
    }
  }

  jQuery("form input").keydown(function (e) {
    preventSubmit(e);
  });
}

// E-mail
{
  function validateEmail(field) {
    let isValid = false;
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const content = field.val().toLowerCase();

    if (pattern.test(content)) {
      isValid = true;
    }

    return isValid;
  }

  function checkEmail(field) {
    let isValid = validateEmail(field);
    feedback(field, isValid);
  }

  jQuery("#email").keyup(function () {
    checkEmail(jQuery(this));
  });

  jQuery("#email").blur(function () {
    checkEmail(jQuery(this));
  });
}

// CPF/CNPJ
{
  function validateDocument(field) {
    let isValid = false

    switch (field.val().length) {
      case 14:
        // CPF
        jQuery('#docType').val('CPF').attr('selected', true)
        isValid = true;
        break;
      case 18:
        // CNPJ
        jQuery('#docType').val('CNPJ').attr('selected', true)
        isValid = true;
        break;
      default:
        isValid = false;
    }
    return isValid;
  }

  function checkDocument(field) {
    let isValid = validateDocument(field);
    feedback(field, isValid);
  }

  jQuery("#document").keyup(function () {
    checkDocument(jQuery(this));
  });

  jQuery("#document").blur(function () {
    checkDocument(jQuery(this));
  });
}

// Card validation
{
  // Name
  {
    function validateHolderName(field) {
      let isValid = false;

      if (field.val().length >= 2) {
        isValid = true;
      }

      return isValid;
    }

    function checkHolderName(field) {
      let isValid = validateHolderName(field);
      feedback(field, isValid);
    }

    jQuery("#cardholderName").on("keydown", function () {
      checkHolderName(jQuery(this));
    });

    jQuery("#cardholderName").on("blur", function () {
      checkHolderName(jQuery(this));
    });
  }

  // Card number
  {
    function validateCardNumber(field) {
      let isValid = false;

      if (field.val().replace(/\s/g, "").length >= 14) {
        isValid = true;
      }

      return isValid;
    }

    function checkCardNumber(field) {
      let isValid = validateCardNumber(field);
      feedback(field, isValid);
    }

    jQuery("#cardNumber").on("keyup", function () {
      checkCardNumber(jQuery(this));
    });

    jQuery("#cardNumber").on("blur", function () {
      checkCardNumber(jQuery(this));
    });
  }

  // Card expiring date
  {
    function cardDate(field) {
      let isValid = false;

      let enteredMonth = field.val().split("/")[0];
      let enteredYear = field.val().split("/")[1];
      let currentYear = new Date().getFullYear().toString().substr(-2);
      let currentMonth = new Date().getMonth() + 1;

      if (field.val().length === 5) {
        if (
          enteredYear > currentYear &&
          enteredMonth > 0 &&
          enteredMonth <= 12
        ) {
          isValid = true;
        }

        if (
          enteredYear == currentYear &&
          enteredMonth >= currentMonth &&
          enteredMonth <= 12
        ) {
          isValid = true;
        }
      }

      return isValid;
    }

    function checkCardDate(field) {
      let isValid = cardDate(field);
      feedback(field, isValid);
    }

    function transportData(status, field) {
      let realMonth = jQuery("#cardExpirationMonth");
      let realYear = jQuery("#cardExpirationYear");

      if (status) {
        let month = field.val().split("/")[0];
        let year = field.val().split("/")[1];

        realMonth.val(month);
        realYear.val(year);
      } else {
        realMonth.val("");
        realYear.val("");
      }
    }

    jQuery("#expiringDate").on("keyup", function () {
      transportData(cardDate(jQuery(this)), jQuery(this));
      checkCardDate(jQuery(this));
    });

    jQuery("#expiringDate").on("blur", function () {
      transportData(cardDate(jQuery(this)), jQuery(this));
      checkCardDate(jQuery(this));
    });
  }

  // Card validation code
  {
    function cardValidationCode(field) {
      let isValid = false;

      if (field.val().length >= 3 && field.val().length <= 4) {
        isValid = true;
      }

      return isValid;
    }

    function checkValidationCode(field) {
      let isValid = cardValidationCode(field);
      feedback(field, isValid);
    }

    jQuery("#cvv").on("keyup", function () {
      checkValidationCode(jQuery(this));
    });

    jQuery("#cvv").on("blur", function () {
      checkValidationCode(jQuery(this));
    });
  }
}

// Validate installments and duplicate to the real select
{
  function validateInstallments(field) {
    let selectedValue = jQuery(`#${field.attr('id')} option:selected`).val()
    jQuery('#installments').val(selectedValue)
    feedback(jQuery('#tempInstallments'), true)
  }

  jQuery('#tempInstallments').on('blur', function() {
    validateInstallments(jQuery(this))
  })
}

// Validate second step
function validateSecondStep() {
  let isValid = false
  let paymentMethod = jQuery('input[type="radio"][name="validate-method"]:checked').val()
  let emailStatus = validateEmail(jQuery('#email'))
  let documentStatus = validateDocument(jQuery('#document'))
  
  if(paymentMethod === 'cartao') {
    let cardHolderName = validateHolderName(jQuery('#cardholderName'))
    let cardNumber = validateCardNumber(jQuery('#cardNumber'))
    let CVV = cardValidationCode(jQuery('#cvv'))
    let expiringDate = cardDate(jQuery('#expiringDate'))
    
    let docType = jQuery('#docType').val() !== null ? true : false
    let bank = jQuery('#issuer').val() !== null ? true : false
    let expiringMonth = jQuery('#cardExpirationMonth').val() !== '' ? true : false
    let expiringYear = jQuery('#cardExpirationYear').val() !== '' ? true : false
    let installments = jQuery('#installments').val() !== null ? true : false
    
    if(emailStatus && documentStatus && cardHolderName && cardNumber && CVV && expiringDate) {
      if(docType && bank && expiringMonth && expiringYear && installments) {
        // PROCESSA COMPRA NO BACK
        textFeedback(true)
        isValid = true
      } else {
        textFeedback(false, 'Ocorreu um erro interno')
      }
    } else {
      textFeedback(false, 'Preencha todos os campos')
    }
    
    validateInstallments(jQuery('#tempInstallments'))
  } else {
    if(emailStatus && documentStatus) {
      isValid = true
    }
  }

  return isValid
}

// Mercado Pago
{
  document
    .getElementById("cardNumber")
    .addEventListener("change", guessPaymentMethod);

  function guessPaymentMethod(event) {
    let cardnumber = document
      .getElementById("cardNumber")
      .value.replace(/\s/g, "");
    if (cardnumber.length >= 6) {
      let bin = cardnumber.substring(0, 6);
      window.Mercadopago.getPaymentMethod(
        {
          bin: bin,
        },
        setPaymentMethod
      );
    }
  }

  function setPaymentMethod(status, response) {
    if (status == 200) {
      let paymentMethod = response[0];
      document.getElementById("paymentMethodId").value = paymentMethod.id;

      getIssuers(paymentMethod.id);
    } else {
      alert(`payment method info error: ${response}`);
    }
  }

  function getIssuers(paymentMethodId) {
    window.Mercadopago.getIssuers(paymentMethodId, setIssuers);
  }

  function setIssuers(status, response) {
    if (status == 200) {
      let issuerSelect = document.getElementById("issuer");
      response.forEach((issuer) => {
        let opt = document.createElement("option");
        opt.text = issuer.name;
        opt.value = issuer.id;
        issuerSelect.appendChild(opt);
      });

      getInstallments(
        document.getElementById("paymentMethodId").value,
        document.getElementById("transactionAmount").value,
        issuerSelect.value
      );
    } else {
      alert(`issuers method info error: ${response}`);
    }
  }

  function getInstallments(paymentMethodId, transactionAmount, issuerId) {
    window.Mercadopago.getInstallments(
      {
        payment_method_id: paymentMethodId,
        amount: parseFloat(transactionAmount),
        issuer_id: parseInt(issuerId),
      },
      setInstallments
    );
  }

  function setInstallments(status, response) {
    if (status == 200) {
      document.getElementById("installments").options.length = 0;
      response[0].payer_costs.forEach((payerCost) => {
        let opt = document.createElement("option");
        opt.text = payerCost.recommended_message;
        opt.value = payerCost.installments;
        document.getElementById("installments").appendChild(opt);
      });
    } else {
      alert(`installments method info error: ${response}`);
    }
  }

  doSubmit = false;
  document
    .getElementById("paymentForm")
    .addEventListener("submit", getCardToken);
  function getCardToken(event) {
    event.preventDefault();
    if (!doSubmit) {
      let $form = document.getElementById("paymentForm");
      window.Mercadopago.createToken($form, setCardTokenAndPay);
      return false;
    }
  }

  function setCardTokenAndPay(status, response) {
    if (status == 200 || status == 201) {
      let form = document.getElementById("paymentForm");
      let card = document.createElement("input");
      card.setAttribute("name", "token");
      card.setAttribute("type", "hidden");
      card.setAttribute("value", response.id);
      form.appendChild(card);
      doSubmit = true;
      form.submit();
    } else {
      alert("Verify filled data!\n" + JSON.stringify(response, null, 4));
    }
  }
}

// Toggle payment method
{
  function paymentMethod(method) {
    function toggleTabIndex(focusable) {
      let value = "-1";

      if (focusable) {
        value = "0";
      }

      jQuery(".card-fields input").each(function () {
        jQuery(this).attr("tabindex", value);
      });
      jQuery(".card-fields .visible").attr("tabindex", value);
    }

    if (method === "boleto") {
      toggleTabIndex(false);
      textFeedback(true)
      jQuery('label[for="cartao"]').removeClass("active");
      jQuery('label[for="boleto"]').addClass("active");
      jQuery(".card-fields").addClass("hidden");
      jQuery(".step-board.relative-step.show-step .avancar").attr(
        "data-target",
        3
      );
    }

    if (method === "cartao") {
      toggleTabIndex(true);
      textFeedback(true)
      jQuery('label[for="boleto"]').removeClass("active");
      jQuery('label[for="cartao"]').addClass("active");
      jQuery(".card-fields").removeClass("hidden");
      jQuery(".step-board.relative-step.show-step .avancar").attr(
        "data-target",
        5
      );
    }
  }

  jQuery('input[type="radio"][name="validate-method"]').on(
    "click",
    function () {
      paymentMethod(jQuery(this).attr("id"));
    }
  );

  // Fire button using space and enter
  {
    function buttonContainerKeyboard(key, target) {
      if (key === " " || key === "Enter") {
        jQuery(`#${target}`).attr("checked", true);
        paymentMethod(target);
      }
    }

    jQuery(".button-container label").on("keyup", function (e) {
      buttonContainerKeyboard(e.key, jQuery(this).attr("for"));
    });
  }
}

// Feedback
{
  function feedback(target, status) {
    const elementType = target.prop("nodeName");
    if (elementType !== "SELECT") {
      if (target.attr("type") !== "date") {
        if (target.val() === "") {
          target.removeClass("invalid");
          target.removeClass("valid");
          return false;
        }
      }
    }

    if (status === true) {
      target.removeClass("invalid");
      target.addClass("valid");
    }

    if (status === false) {
      target.removeClass("valid");
      target.addClass("invalid");
    }
  }
}

// Text feedback
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

// Step validation
{
  function stepValidation(step) {
    switch (step) {
      case 1:
      case 3:
        checkEmail(jQuery("#email"));
        checkDocument(jQuery("#document"));
        return true;
      case 2: 
        return validateSecondStep()
    }
  }
}

// Call next step
{
  function nextStep(step = null, nextStep = null) {
    const currentStep = step;
    const targetStep = nextStep;
    let feedback = jQuery("span.feedback");
    const body = jQuery("html, body");
    const form = jQuery(".content-container").offset().top;

    if (currentStep === null || targetStep === null) {
      // nextStep must receive current and target step. Check your call and try again
      return false;
    }

    if (currentStep == targetStep) {
      //nextStep must receive different values on current and target step. Check your call and try again
      return false;
    }

    if (currentStep < targetStep) {
      if (stepValidation(currentStep) === true) {
        body.stop().animate({ scrollTop: form }, 500, "swing");
        feedback.html("");

        const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`);
        const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`);

        currentBoard.removeClass("show-step");

        setTimeout(function () {
          currentBoard.removeClass("relative-step");
          nextBoard.addClass("relative-step");

          setTimeout(function () {
            nextBoard.addClass("show-step");
          }, 200);
        }, 650);
      }
    } else {
      body.stop().animate({ scrollTop: form }, 500, "swing");
      feedback.html("");

      const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`);
      const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`);

      setTimeout(function () {
        currentBoard.removeClass("show-step");

        setTimeout(function () {
          currentBoard.removeClass("relative-step");
          nextBoard.addClass("relative-step");

          setTimeout(function () {
            nextBoard.addClass("show-step");
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
}
