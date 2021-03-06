'use strict';
var devMode = false;
var serverUrl = devMode ? 'http://localhost:3000' : 'http://moodi.herokuapp.com';

// Call this function when the page loads (the "ready" event)
$(document).ready(function() {
	initializePage();
})

/*
 * Function that is called when the document is ready.
 */
function initializePage() {
	// add any functionality and listeners you want here
	$('.modal').on('hidden.bs.modal', function() {
		$(this).find('form')[0].reset();
	});

	$('.modal').on('show.bs.modal', function() {
		if ($(document).height() > $(window).height()) {
			// no-scroll
			$('body').addClass("modal-open-noscroll");
		} else {
			$('body').removeClass("modal-open-noscroll");
		}
	})

	$('.modal').on('hide.bs.modal', function() {
		$('body').removeClass("modal-open-noscroll");
	});

	if (myLocalStorage.get('login') === true) {
		$('#loginButton').replaceWith('<a href="" id="logoutButton">Logout</a>');
	}

	$('#logoutButton').click(logout);

	$('.text-story').on('keyup', convertToEmoji);

	$('.add-post-btn').on('click', function(e) {
		if (myLocalStorage.get('login') !== true) {
			e.stopPropagation();
			e.preventDefault();
			alert('Please Login or Signup First!');
		}
	});

	if ($('#allTemp').length === 0) {
		$('.add-post-btn').show();
	}

	// $(".mood").mouseover(function() {
	// 	$(this).effect({
	// 		effect: 'shake',
	// 		distance: 10
	// 	});

	// 	// var $this = $(this);
	// 	// var position = $this.position();
	// 	// var width = $this.width();
	// 	// var height = $this.height();

	// 	// var x_position = position.left + width / 2;
	// 	// var y_position = position.top + height / 2;

	// 	// $('<div class="test">test</div>').css({
	// 	// 	position: "absolute",
	// 	// 	marginLeft: x_position,
	// 	// 	marginTop: y_position,
	// 	// 	top: 0,
	// 	// 	left: 0
	// 	// }).appendTo(this);

	// 	// $(this).append('<div class="test">test</div>');
	// });

	// $('.mood').mouseout(function() {
	// 	$('div').remove('.test');
	// });

	$(document).keydown(function(e) {
		if (e.which === 13) {
			e.preventDefault();
		}
	});

	$('.timeline-panel').click(function(e) {
		var $this = $(this);
		var $body = $this.find('.timeline-body');
		var $more = $this.find('.more');

		if ($more.length != 0) {
			$more[0].remove();
		} else {
			$this.append('<div class="more"><a href="" onclick="return false;"><h3>...See More</h3><a>');
		}

		$body.toggle('slow');

		// $(this).find('.timeline-body').toggle(function() {
		// 	$(this).find('.more').remove();
		// }, function() {
		// 	$(this).append('<div class="more">more</div>');
		// });
	});

	$('.add-post-btn').click(function() {
		ga('send', 'event', 'addBtn', 'click');
	});

	$('.navbar-brand').click(function() {
		ga('send', 'event', 'homeBtn', 'click');
	})

	$('.emoji-story').click(function() {
		ga('send', 'event', 'emojiTextArea', 'click');
	})

	$('.text-story').click(function() {
		ga('send', 'event', 'storyTextArea', 'click');
	})

	$('.timeline-panel').click(function() {
		ga('send', 'event', 'timePanel', 'click');
	})
}

function convertToEmoji(e) {
	// if (e.which == 32) { // Press space
	// 	var words = $(this).val().split(' ');
	// 	var lastWord = words[words.length - 2];
	// 	console.log("last word is: " + lastWord);

	// 	// var emojiLib = JSON.parse('../emoji.json');
	// 	$.get("emoji?word=" + lastWord, function(data) {
	// 		console.log(data);
	// 		if (data == "") {
	// 			$('.emoji-story').append(lastWord + " ");
	// 		} else {
	// 			$('.emoji-story').append(data);
	// 		}
	// 	});
	// }

	$.get("emoji?word=" + $(this).val() + '&mood=' + document.newPostForm.mood.value, function(data) {
		$('.emoji-story').html(data);
	});
}

var myLocalStorage = {
	set: function(item, value) {
		localStorage.setItem(item, JSON.stringify(value));
	},
	get: function(item) {
		return JSON.parse(localStorage.getItem(item));
	},
	remove: function(item) {
		localStorage.removeItem(item);
	}
};

function reportErrors(errors) {
	var msg = errors[0];
	for (var i = 1; i < errors.length; i++) {
		msg += '<br>' + errors[i];
	}

	$('#loginModal .modal-dialog').addClass('shake');
	$('.error').addClass('alert alert-danger').html(msg);
	$('input[type="password"]').val('');
	setTimeout(function() {
		$('#loginModal .modal-dialog').removeClass('shake');
	}, 1000);
}

function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	return re.test(email);
}

function validateLoginForm() {
	var email = document.loginForm.email.value;
	var password = document.loginForm.password.value;
	var errors = [];

	if (!validateEmail(email)) {
		errors[errors.length] = 'You must enter a valid email address.';
	}

	if (password == '') {
		errors[errors.length] = 'Password cannot be empty.';
	}

	if (errors.length > 0) {
		reportErrors(errors);
		return;
	}

	// talk to server
	$.ajax({
		type: 'POST',
		url: serverUrl + '/login',
		data: JSON.stringify({
			email: email,
			password: password
		}),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			if (data.result == true) {
				myLocalStorage.set('login', true);
				myLocalStorage.set('email', email);
				myLocalStorage.set('username', "Demo");
				window.location.reload(true);
			} else {
				errors[errors.length] = data.error;
				reportErrors(errors);
			}
		}
	});
}

function validateSignupForm() {
	var email = document.signupForm.email.value;
	var password = document.signupForm.password.value;
	var confirmedPassword = document.signupForm.confirmedPassword.value;
	var errors = [];

	if (!validateEmail(email)) {
		errors[errors.length] = 'You must enter a valid email address.';
	}

	if (password == '') {
		errors[errors.length] = 'Password cannot be empty.';
	}

	if (password != confirmedPassword) {
		errors[errors.length] = 'Please enter the same password.';
	}

	if (errors.length > 0) {
		reportErrors(errors);
		return;
	}

	// talk to server
	$.ajax({
		type: 'POST',
		url: serverUrl + '/signup',
		data: JSON.stringify({
			email: email,
			password: password
		}),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			if (data.result == true) {
				myLocalStorage.set('login', true);
				myLocalStorage.set('email', email);
				myLocalStorage.set('username', "Demo");
				window.location.reload(true);
			} else {
				errors[errors.length] = data.error;
				reportErrors(errors);
			}
		}
	});
}

function logout() {
	myLocalStorage.remove('login');
	myLocalStorage.remove('email');
	myLocalStorage.remove('username');
	window.location.reload(true);
}

function addPost() {
	var mood = document.newPostForm.mood.value; // $(".post").attr('id');
	var emojiStoryHtml = $(".emoji-story").html();
	var title = document.newPostForm.title.value;
	var content = document.newPostForm.content.value;

	var timestamp = new Date().getTime() / 1000;
	var author = myLocalStorage.get('username');

	var errors = [];

	if (title == '') {
		errors[errors.length] = 'You must have a title for your post.';
	}

	if (content == '') {
		errors[errors.length] = 'You must have some contents for your post.';
	}

	if (errors.length > 0) {
		reportErrors(errors);
		return;
	}

	var request = {
		title: title,
		content: content,
		emojiContent: emojiStoryHtml,
		mood: mood,
		id: mood,
		time: timestamp,
		author: author
	}

	var random_num = Math.random();

	if (random_num > 0.5) {
		request.left = true;
	}

	$.ajax({
		type: 'POST',
		url: serverUrl + '/addPost',
		data: JSON.stringify(request),
		contentType: 'application/json',
		dataType: 'json',
		success: function(data) {
			window.location.reload(true);
		}
	});
}

function cancelPost() {
	$(".emoji-story").html('');
}

/*
 *
 * login-register modal
 * Autor: Creative Tim
 * Web-autor: creative.tim
 * Web script: http://creative-tim.com
 * 
 */
function showSignupForm() {
	$('.loginBox').fadeOut('fast', function() {
		$('.registerBox').fadeIn('fast');
		$('.login-footer').fadeOut('fast', function() {
			$('.register-footer').fadeIn('fast');
		});
		$('.modal-title').html('Signup with');
	});
	$('.error').removeClass('alert alert-danger').html('');

}

function showLoginForm() {
	$('#loginModal .registerBox').fadeOut('fast', function() {
		$('.loginBox').fadeIn('fast');
		$('.register-footer').fadeOut('fast', function() {
			$('.login-footer').fadeIn('fast');
		});

		$('.modal-title').html('Login with');
	});
	$('.error').removeClass('alert alert-danger').html('');
}

function openLoginModal() {
	showLoginForm();
	setTimeout(function() {
		$('#loginModal').modal('show');
	}, 230);

}

function openRegisterModal() {
	showRegisterForm();
	setTimeout(function() {
		$('#loginModal').modal('show');
	}, 230);

}

function loginAjax() {
	/*   Remove this comments when moving to server
	$.post( "/login", function( data ) {
	        if(data == 1){
	            window.location.replace("/home");            
	        } else {
	             shakeModal(); 
	        }
	    });
*/

	/*   Simulate error message from the server   */
	shakeModal();
}