jQuery(window).on("load", function () { 
  // Animate page load
  {
    jQuery(".relative-step").addClass("show-step");
    jQuery(".vvale-svg").addClass("vvale-animate");
    jQuery(".no-margin").addClass("show");
  }
})

// Prevent submit on enter key
{
  function preventSubmit(e) {
    let button = jQuery('.step-board.relative-step.show-step .avancar')
    let currentStep = parseInt(button.attr('data-step'))
    let targetStep = parseInt(button.attr('data-target'))
    if (e.key == 'Enter') {
      e.preventDefault();
      nextStep(currentStep, targetStep)
    }
  }

  jQuery('form input').keydown(function(e) {
    preventSubmit(e)
  })
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

// Check password status
function checkPassword(field, comparisonField) {
  let valid = validatePassword(field, comparisonField);
  feedback(field, valid);
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

function validateStep() {
  let isValid = false
  if(!validatePassword(document.querySelector('#second-pass'))) {
    textFeedback(false, 'Preencha as senhas corretamente')
  } else {
    textFeedback(true)
    isValid = true
  }

  return isValid
}

// Call next step
{
  function nextStep(step = null, nextStep = null) {
    const currentStep = step;
    const targetStep = nextStep;

    if (currentStep < targetStep) {
      if (validateStep() === true) {
        const body = $("html, body");
        const form = $(".content-container").offset().top;
        body.stop().animate({ scrollTop: form }, 500, "swing");

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
    }
  }

  jQuery(".avancar").click(function () {
    let step = jQuery(this).data("step");
    let target = jQuery(this).data("target");
    nextStep(step, target);
  });
}