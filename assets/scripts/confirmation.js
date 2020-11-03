userEmail = 'guirovedah@gmail.com'
userPhone = '(42) 9 8805-5068'

jQuery(document).ready(function () {
  jQuery('.vvale-svg').addClass('vvale-animate')
  jQuery('.selected-method').val(userEmail)

  changeInputWidth()

  jQuery('.no-margin').addClass('show')
  setTimeout(function() {
    jQuery('.editable-container').addClass('show')
  }, 100)
})

// Switch between phone and mail
function getActiveMethod() {
  const buttons = jQuery('.contact-container label')
  let activeMethod = jQuery('.contact-container input:checked').attr('id')
  let text = jQuery('.no-margin')
  let inputContainer = jQuery('.editable-container')
  let inputValue = jQuery('.selected-method')
  let editButton = jQuery('button.edit')

  function changeFields(fieldText, variable) {
    inputContainer.removeClass('show')
    setTimeout(function() {
      text.removeClass('show')
      setTimeout(function() {
        text.text(fieldText)
        inputValue.val(variable)
        changeInputWidth()
        text.addClass('show')
        setTimeout(function() {
          inputContainer.addClass('show')
        }, 200)
      }, 400)
    }, 200)
  }

  if(activeMethod === 'email') {
    editButton.attr('data-function', '')
    toggleInputEditing()
    inputValue.attr('name', 'email')
    changeFields('O código será enviado para o endereço', userEmail)
  } else {
    editButton.attr('data-function', '')
    toggleInputEditing()
    inputValue.attr('name', 'phone')
    changeFields('O código será enviado para o número', userPhone)
  }
  
  buttons.each(function() {
    if(jQuery(this).attr('for') === activeMethod) {
      jQuery(this).addClass('active')
    } else {
      jQuery(this).removeClass('active')
    }
  })
}

// Change input width
function changeInputWidth() {
  let input = jQuery('.selected-method')
  let fontSize = parseFloat(input.css('font-size')) / 1.6
  let inputWidth = input.val().length * fontSize
  input.css('width', inputWidth)
}

jQuery('.selected-method').on('keydown', changeInputWidth)

// Enable editing
function toggleInputEditing() {
  let input = jQuery('.selected-method')
  let button = jQuery('button.edit')
  let stroke = jQuery('.stroke')
  
  if(button.attr('data-function') === 'edit') {
    button.attr('data-function', 'save')
    input.prop('disabled', false)
    input.focus()
    input.val('')
    if(jQuery('.selected-method').attr('name') === 'email') {
      input.unmask()
      input.val(userEmail)
    } else {
      input.val(userPhone)
      input.mask('(00) 0 0000-0000')
    }
    stroke.addClass('active')
    setTimeout(function() {
      button.css('display', 'none')
    }, 200)
  } else {
    button.attr('data-function', 'edit')
    input.prop('disabled', true)
    stroke.removeClass('active')
    setTimeout(function() {
      button.css('display', 'block')
    }, 200)
  }

  changeInputWidth()
}

// Keep value on blur
function updateLocalVar() {
  let input = jQuery('.selected-method')

  if(jQuery('.selected-method').attr('name') === 'email') {
    userEmail = input.val()
  } else {
    userPhone = input.val()
  }
}

// Validate First Step
function validateFirstStep() {
  let isValid = false
  let field = jQuery('.selected-method')
  let fieldType = field.attr('name')
  let secondStepMessage = jQuery('.confirmation-board[data-step="2"] .content-feedback')

  if(fieldType === 'email') {
    // 1. Verify if it is a valid e-mail
    // 2. Check on DB if this e-mail doesn't exist 
    // 3. Send message and update user email

    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    if(pattern.test(field.val())) {
      secondStepMessage.html(`
        Informe abaixo o código que enviamos para <br><strong>${userEmail}</strong>
      `)
      isValid = true
    }
  } else {
    if(field.val().length === 16) {
      secondStepMessage.html(`
      Informe abaixo o código que enviamos para <br><strong>${userPhone}</strong>
      `)
      isValid = true
    }
  }

  return isValid
}

// Control focus of every code input
function inputFocus(e) {
  e.preventDefault()
  const key = e.which || e.keyCode
  const currentElement = jQuery('.code-container input:focus')
  const inputIndex = parseInt(currentElement.attr('data-field'))
  const nextElement = jQuery(`.code-container input[data-field="${inputIndex + 1}"]`)
  const prevElement = jQuery(`.code-container input[data-field="${inputIndex - 1}"]`)
  let keyValue = ''

  switch(key) {
    case 48 :
    case 96 : {
      keyValue = '0'
      break
    }
    case 49 : 
    case 97 : {
      keyValue = '1'
      break
    }
    case 50 : 
    case 98 : {
      keyValue = '2'
      break
    }
    case 51 : 
    case 99 : {
      keyValue = '3'
      break
    }
    case 52 : 
    case 100 : {
      keyValue = '4'
      break
    }
    case 53 : 
    case 101 : {
      keyValue = '5'
      break
    }
    case 54 : 
    case 102 : {
      keyValue = '6'
      break
    }
    case 55 : 
    case 103 : {
      keyValue = '7'
      break
    }
    case 56 : 
    case 104 : {
      keyValue = '8'
      break
    }
    case 57 : 
    case 105 : {
      keyValue = '9'
      break
    }
  }

  if (key === 37) {
    if(prevElement.length === 1) {
      prevElement.focus().select()
    }
  }

  if (key === 39) {
    if(nextElement.length === 1) {
      nextElement.focus().select()
    }
  }

  if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)) {
    if(nextElement.length === 1) {
      currentElement.val(keyValue)
      nextElement.focus()
    } else {
      currentElement.val(keyValue)
    }
  } else if ((key === 46) || (key === 8)) {
    if(inputIndex > 1) {
      if(currentElement.val() > 0) {
        currentElement.val('')
      } else {
        prevElement.val('')
        prevElement.focus().select()
      }
    } else {
      currentElement.val('')
    }
  }
}

jQuery('.code-container input').keydown(function(e) {inputFocus(e)})

// Call next step
function nextStep(step = null, nextStep = null) {
  const currentStep = step;
  const targetStep = nextStep;
  let feedback = jQuery('span.feedback')

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
    if (validateFirstStep() === true) {
      feedback.html('')

      const currentBoard = jQuery(`.step-board[data-step=${currentStep}]`)[0];
      const nextBoard = jQuery(`.step-board[data-step=${targetStep}]`)[0];

      currentBoard.classList.remove("show-step");

      setTimeout(function () {
        currentBoard.classList.remove("relative-step");
        nextBoard.classList.add("relative-step");

        setTimeout(function () {
          nextBoard.classList.add("show-step");
          setTimeout(function() {
            jQuery('.code-container input').get(0).focus()
          }, 500)
        }, 200);
      }, 650);
    } else {
      feedback.each(function() {
        jQuery(this).animate({
          height: 20,
          marginBottom: 10
        }, 250)
        if(jQuery('.selected-method').attr('name') === 'email') {
          feedback.html('O e-mail informado não pode ser utilizado')
        } else {
          feedback.html('O número informado está incompleto')
        }
      })
    }
  } else {
    feedback.html('')

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

jQuery('.selected-method').blur(updateLocalVar)

jQuery('button.edit').click(toggleInputEditing)

jQuery('.contact-container label').on('change', getActiveMethod)

jQuery(".avancar").click(function () {
  let step = jQuery(this).data("step");
  let target = jQuery(this).data("target");
  nextStep(step, target);
});