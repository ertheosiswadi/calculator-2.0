var input_stack = [];
var finish = false;
const MAX_DIGITS = 17;

$(document).ready(() =>{
	$('.keypad_n').click((e)=>{
		if(finish)
		{
			input_stack.length = 0;
			finish = false;
		}
		var key_id = $(e.target)[0].id
		var input = $('#'+key_id).html();

		input_stack.push(input);
		refresh_display();
	});

	$('.keypad_op').click((e)=> {
		finish = false;
		var key_id = $(e.target)[0].id
		var input = $('#'+key_id).html();

		input_stack.push(input);
		refresh_display();
	})

	$('.keypad_trig').click((e)=> {
		if(finish)
		{
			input_stack.length = 0;
			finish = false;
		}
		var key_id = $(e.target)[0].id
		var input = $('#'+key_id).html();

		input_stack.push(input);
		input_stack.push('(');
		refresh_display();
	});

	$('#backspace').click(()=>{
		input_stack.pop();
		refresh_display();
	});

	$('#AC').click(()=>{
		input_stack.length = 0;
		refresh_display();
	});

	$('#equal').click(() => {
		if(input_stack.length != 0)
		{
			var result = '';
			try
			{
				result = solve(make_tokens(input_stack.join("")));
				if(isNaN(result))
				{
					throw syntax_error; 
				}
				else if(result == Infinity)
				{
					throw math_error; 
				}

				result = control_n_digits(result.toString());
				display(result);

				input_stack.length = 0;
				input_stack.push(result);

				finish = true;
			}
			catch(err)
			{
				console.error(err.name);
				if(err.name == 'RangeError')
				{
					err.message = '♥ SYNTAX ERROR ♥'
				}
				display(err.message);

				input_stack.length = 0;
				finish = true;
			}
		}
	});

});

function refresh_display()
{
	display(input_stack.join(""));
}

function display(message)
{
	$('#math').prop('readonly', false);
	$('#math').val(message);
	$('#math').prop('readonly', true);
}

function control_n_digits(result)
{
	//check if result is too long and cannot be displayed
	if(result.length > MAX_DIGITS && result.includes('.')) //refactor and make a global constant
	{
		result = result.slice(0, MAX_DIGITS);
	}
	return result;
}