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

function getActiveMethod() {
  const buttons = jQuery('.contact-container label')
  let activeMethod = jQuery('.contact-container input:checked').attr('id')
  let text = jQuery('.no-margin')
  let inputContainer = jQuery('.editable-container')
  let inputValue = jQuery('.selected-method')

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
    inputValue.attr('name', 'email')
    changeFields('O código será enviado para o endereço', userEmail)
  } else {
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

function changeInputWidth() {
  let input = jQuery('.selected-method')
  let fontSize = parseFloat(input.css('font-size')) / 1.6
  let inputWidth = input.val().length * fontSize
  input.css('width', inputWidth)
}

jQuery('.selected-method').on('keyup', changeInputWidth)

function toggleInputEditing() {
  let input = jQuery('.selected-method')
  let button = jQuery('button.edit')
  let stroke = jQuery('.stroke')
  
  if(button.attr('data-function') === 'edit') {
    // ARRUMAR PRA SEMPRE QUE TROCAR DE PRODUTO ELE TER QUE SER EDITÁVEL DE NOVO
    button.attr('data-function', 'save')
    input.prop('disabled', false)
    input.focus()
    input.val('')
    if(jQuery('.selected-method').attr('name') === 'email') {
      input.unmask()
      input.val(userEmail)
    } else {
      input.mask('(00) 0 0000-0000')
      input.val(userPhone)
    }
    stroke.addClass('active')
    setTimeout(function() {
      button.css('display', 'none')
    }, 200)
  }
}

jQuery('button.edit').click(toggleInputEditing)

jQuery('.contact-container label').on('change', getActiveMethod)