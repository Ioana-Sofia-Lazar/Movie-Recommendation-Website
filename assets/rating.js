// get hidden in put value
// fill how many stars it says
$('.rating').each(function () {
    var rating = $(this).siblings('.user-rating').val();
    if (rating) {
        setFullStarState($(this).find('.star' + rating));
    }
});

var starClicked = false;

$(function () {

    $('.star').click(function () {

        $(this).children('.selected').addClass('is-animated');
        $(this).children('.selected').addClass('pulse');

        var target = this;

        setTimeout(function () {
            $(target).children('.selected').removeClass('is-animated');
            $(target).children('.selected').removeClass('pulse');
        }, 1000);

        starClicked = true;
        console.log('clicked star!');
    })

    // $('.half').click(function() {
    //   if (starClicked == true) {
    //     setHalfStarState(this)
    //   }

    //   var rating = $(this).data('value');

    //   $(this).closest('.rating').find('.js-score').val(rating);

    //   $(this).closest('.rating').data('vote', $(this).data('value'));
    //   // calculateAverage()

    // })

    $('.full').click(function () {
        if (starClicked == true) {
            setFullStarState(this)
        }

        var rating = $(this).data('value');

        $(this).closest('.rating').find('.js-score').val(rating);

        $(this).find('js-average').text(parseInt($(this).data('value')));

        $(this).closest('.rating').data('vote', $(this).data('value'));
        // calculateAverage()

        var movieId = $(this).parent().parent().parent().attr('movieId');

        var ratingForm = $('<form>', {
            'action': '/rateMovie',
            'method': 'POST',
        })
            .append($('<input>', {
                'name': 'movieId',
                'value': movieId,
                'type': 'hidden'
            }))
            .append($('<input>', {
                'name': 'rating',
                'value': parseInt(rating),
                'type': 'hidden'
            }));

        $(document.body).append(ratingForm);
        ratingForm.submit();
    })

    $('.half').hover(function () {
        if (starClicked == false) {
            setHalfStarState(this)
        }

    })

    $('.full').hover(function () {
        if (starClicked == false) {
            setFullStarState(this)
        }
    })

    $('.full').mouseleave(function () {
        var rating = $(this).parent().parent().siblings('.user-rating').val();
        if (rating) {
            setFullStarState($(this).parent().parent().find('.star' + rating));
        }
    })

})

function updateStarState(target) {
    $(target).parent().prevAll().addClass('animate');
    $(target).parent().prevAll().children().addClass('star-colour');

    $(target).parent().nextAll().removeClass('animate');
    $(target).parent().nextAll().children().removeClass('star-colour');
}

function setHalfStarState(target) {
    $(target).addClass('star-colour');
    $(target).siblings('.full').removeClass('star-colour');
    updateStarState(target)
}

function setFullStarState(target) {
    $(target).addClass('star-colour');
    $(target).parent().addClass('animate');
    $(target).siblings('.half').addClass('star-colour');

    updateStarState(target)
}

