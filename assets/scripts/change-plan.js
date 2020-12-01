jQuery(document).ready(function () {
  jQuery('.relative-step').addClass('show-step')
  jQuery('.vvale-svg').addClass('vvale-animate')
  changeBorder()
  disableDowngrade('plan2')
});

// Hide a plan
{
  function hidePlan(planID) {
    let targetPlan = jQuery(`label[for="${planID}"]`)

    if(targetPlan.hasClass('active-plan')) {
      jQuery('.input-container label').each(function() {
        jQuery(this).removeClass('active-plan')
        jQuery(this).find('input').removeAttr('checked')
      })
  
      if(targetPlan.next('label').length === 0) {
        if(!targetPlan.prev('label').hasClass('disabled')) {
          targetPlan.prev('label').addClass('active-plan')
          targetPlan.prev('label').find('input[type="radio"]').attr('checked', true)
        }
      } else {
        if(!targetPlan.next('label').hasClass('disabled')) {
          targetPlan.next('label').addClass('active-plan')
          targetPlan.next('label').find('input[type="radio"]').attr('checked', true)
        }
      }
    }

    targetPlan.remove()
  }
}

// Disable downgrade
{
  function disableDowngrade(currentPlan) {
    let foundPlan = false
    jQuery('.input-container label').each(function() {
      let input = jQuery(this).find('input')
      
      if(foundPlan === false) {
        if(input.attr('id') === currentPlan) {
          input.attr('checked', true)
          jQuery(this).addClass('active-plan')
          foundPlan = true
        } else {
          jQuery(this).addClass('disabled')
          jQuery(this).addClass('hidden-data')
          input.attr('disabled', true)
        }
      }
    })
  }
}

// Change border of selected plan
{
  function changeBorder() {
    const target = jQuery('input[name="plan"]')

    target.each(function() {
      let container = jQuery(`label[for="${jQuery(this).attr('id')}"]`)
      
      if(jQuery(this).is(':checked')) {
        if(!container.hasClass('hr')) {
          container.addClass('active-plan')
        }
      } else {
        container.removeClass('active-plan')
      }
    })
  }

  jQuery('input[name="plan"]').on('click', changeBorder)
}