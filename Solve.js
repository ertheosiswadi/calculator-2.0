var input_stack = [];
var finish = false;

$(document).ready(() =>{
	$('#confirmButton').click(() => {
		console.log("---------");
		var string = $('#math').val();
		console.log('original: ', string);
		console.log('answer: ', solve(make_tokens(string)));
	});

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
		var result = solve(make_tokens(input_stack.join(""))).toString();
		$('#math').prop('readonly', false);
		$('#math').val(result);
		$('#math').prop('readonly', true);

		input_stack.length = 0;
		
		//check if result is too long and cannot be displayed
		if(result.length > 25)
		{
			result = result.slice(0,25);
		}
		input_stack.push(result);

		finish = true;
	});

});

function refresh_display()
{
	$('#math').prop('readonly', false);
	$('#math').val(input_stack.join(""));
	$('#math').prop('readonly', true);
}

function solve(t)
{
	var outer_bf = [];
	var inner_bf = [];
	var collect = false;
	var layer = 0;

	var trig = false;
	var trig_func = '';

	t.forEach((e) => {
		if(!collect)
		{
			if(e == '(')
			{
				collect = true;
			}
			else if(e == ')')
			{
				//throw error
			}
			else if(e == 'sin' || e == 'cos')
			{
				trig_func = e;
				trig = true;
			}
			else
			{
				outer_bf.push(e);
			}
		}
		else
		{
			if(e == ')' && layer == 0) //end
			{
				if(trig)
				{
					if(trig_func == 'sin')
					{
						let result = Math.sin(solve(inner_bf));
						outer_bf.push(result.toString());
					}
					else if(trig_func == 'cos')
					{
						let result = Math.cos(solve(inner_bf));
						outer_bf.push(result.toString());
					}

				}
				else
				{
					outer_bf.push(solve(inner_bf).toString());
				}
				//flush
				inner_bf = [];
				collect = false;
				trig = false;
			}
			else
			{
				if(e == '(')
				{
					layer++;
				}
				else if( e == ')')
				{
					layer--;
				}
				inner_bf.push(e);
			}
		}
	});
	console.log('outer_bf: ', outer_bf);
	return solve_2(outer_bf);
}

function make_tokens(input)//input is a string and not an array, careful
{
	var collect = false;
	var token = '';
	var toReturn = [];
	Array.from(input).forEach((e) => {
		if(!isWhitespace(e))
		{
			if(!collect)
			{
				if(isNumber(e) || isAlphabet(e))
				{
					collect = true;
					token = e;
				}
				else
				{
					token = e;
					toReturn.push(e);
				}
			}
			else
			{
				if(isNumber(e) || isAlphabet(e))
				{
					token += e;
				}
				else
				{
					collect = false;
					toReturn.push(token);
					token = e;
					toReturn.push(token);
				}
			}
			console.log('token: ', token, ' collect: ', collect, ' e: ', e, ' toReturn: ', toReturn);
		}	
	});
	if(collect)
		toReturn.push(token);

	console.log('tokens: ', toReturn);
	return toReturn;
}

function isWhitespace(c)
{
	let space = /[\s]/;
	if(c.match(space) != null)
	{
		return true;
	}
	return false;
}

function isAlphabet(c)
{
	let alphabet = /[a-zA-z]/;
	if(c.match(alphabet) != null)
	{
		return true;
	}
	return false;
}

function isNumber(c)
{
	let number = /[0-9\.]/;
	if(c.match(number) != null)
	{
		return true;
	}
	return false;
}

function solve_2(tokens)
{
	if(tokens.length == 1)
	{
		return parseFloat(tokens[0]);
	}
	else if (tokens.length == 2)
	{
		//return error
	}
	else if(tokens.length == 3)
	{
		var op = tokens[1];
		var arg_1 = parseFloat(tokens[0]);
		var arg_2 = parseFloat(tokens[2]);

		return calculate(op, arg_1, arg_2);
	}
	else
	{
		for(i = 1; i < tokens.length; i += 2)
		{
			if(tokens[i] == '+' || tokens[i] == '-')
			{
				var op = tokens[i];
				var arg_1 = solve_2(tokens.slice(0,i));
				var arg_2 = solve_2(tokens.slice(i + 1));

				return calculate(op, arg_1, arg_2);
			}
		}
		var op = tokens[tokens.length-2];
		var arg_1 = solve_2(tokens.slice(0, tokens.length-2));
		var arg_2 = tokens[tokens.length -1];

		return calculate(op, arg_1, arg_2);
	}
}

function calculate(op, a, b)
{
	var select = {
		'*': mul(a, b),
		'×': mul(a, b),
		'x': mul(a, b),
		'/': div(a, b),
		'÷': div(a, b),
		'+': add(a, b),
		'-': sub(a, b),
		'−': sub(a, b)
	}
	return select[op];
}

function add(a, b)
{
	return a + b;
}

function mul(a, b)
{
	return a * b;
}

function div(a, b)
{
	return a / b;
}

function sub(a, b)
{
	return a - b;
}