var input_stack = [];
var finish = false;

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
					console.log(result);
					throw syntax_error; 
				}
				else if(result == Infinity)
				{
					throw math_error; 
				}
				result = result.toString();
				//check if result is too long and cannot be displayed
				if(result.length > 17 && result.includes('.')) //refactor and make a global constant
				{
					result = result.slice(0,17);
				}
				$('#math').prop('readonly', false);
				$('#math').val(result);
				$('#math').prop('readonly', true);

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
				$('#math').prop('readonly', false);
				$('#math').val(err.message);
				$('#math').prop('readonly', true);

				input_stack.length = 0;
				finish = true;
			}
		}
	});

});

function refresh_display()
{
	$('#math').prop('readonly', false);
	$('#math').val(input_stack.join(""));
	$('#math').prop('readonly', true);
}