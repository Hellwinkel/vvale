jQuery(window).on('load', function() {
  jQuery('.relative-step').addClass('show-step')
  jQuery('.vvale-svg').addClass('vvale-animate')
  jQuery('.no-margin').addClass('show')
  setTimeout(function() {
    jQuery('.editable-container').addClass('show')
  }, 100)
})

function getActiveMethod() {
  const buttons = jQuery('.reset-container label')
  let activeMethod = jQuery('.reset-container input:checked').attr('id')
  let text = jQuery('.no-margin')

  function changeFields(fieldText) {
    text.removeClass('show')
    setTimeout(function() {
      text.html(fieldText)
      text.addClass('show')
    }, 200)
  }

  if(activeMethod === 'reset-email') {
    changeFields('Para prosseguir com a recuperação de e-mail<br> será necessário informar seu CPF ou CNPJ')
    jQuery('.reset-button').attr('value', 'Avançar')
  } else {
    changeFields('Enviaremos um código para o endereço<br> de e-mail cadastrado na sua conta')
    jQuery('.reset-button').attr('value', 'Enviar')
  }
  
  buttons.each(function() {
    if(jQuery(this).attr('for') === activeMethod) {
      jQuery(this).addClass('active')
    } else {
      jQuery(this).removeClass('active')
    }
  })
}

jQuery('.reset-container label').on('change', getActiveMethod)