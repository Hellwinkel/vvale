$(window).on('scroll', function() {
  showBadge()
})

function showBadge() {
  const badge = $('#plan-badge')
  const badgeDistance = badge.offset().top
  const screenTrigger = $(window).height() * 0.85
  const currentScroll = $(window).scrollTop()

  if(badgeDistance <= (currentScroll + screenTrigger))
    badge.addClass('show')
}