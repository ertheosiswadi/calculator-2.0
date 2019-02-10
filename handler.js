var input_stack = [];
var finish = false;

let syntax_error = {
	name: 'SYNTAX ERROR',
	message:"♥ SYNTAX ERROR ♥"
}

let math_error = {
	name: 'MATH ERROR',
	message:"◈ MATH ERROR ◈"
}

let over_error = {
	name: 'OUT OF BOUNDS ERROR',
	message:"◈ MATH ERROR ◈"
}

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

function make_tokens(input)//input is a string and not an array, careful
{
	var collect = false;
	var token = '';
	var toReturn = [];
	var n_period = 0;
	var layer = 0;

	var e;
	// Array.from(input).forEach((e) =>
	for(i = 0; i < input.length; i++)
	 {
	 	e = input[i];
		console.log('E is: ', e);
		if(!isWhitespace(e))
		{
			if(!collect)
			{
				if(isNumber(e) || isPeriod(e) || isAlphabet(e))
				{
					if(isPeriod(e))//refactor
					{
						n_period++;
					}
					if(n_period > 1)//too many periods
					{
						throw syntax_error;
					}

					collect = true;
					token = e;
				}
				else
				{
					e = ifOperator(e);

					if((layer = updateLayer(e, layer)) < 0)
					{
						throw syntax_error;
					}
					// console.log(isOperator(e), 'e: ', e, 'toReturn: ', toReturn);
					
					console.log('length toRet: ',toReturn.length)
					if(toReturn.length > 0)
					{
						
						if(isOperator(e) && isOperator(toReturn[toReturn.length -1]))
						{
							throw syntax_error;
						}
					}
					
					token = e;
					toReturn.push(e);
				}
			}
			else
			{
				if(isNumber(e) || isPeriod(e) || isAlphabet(e))
				{
					if(isPeriod(e))
					{
						n_period++;
					}
					if(n_period > 1)//too many periods
					{
						throw syntax_error;
					}

					token += e;
				}
				else
				{
					e = ifOperator(e);
					collect = false;
					toReturn.push(token);


					if((layer = updateLayer(e, layer)) < 0)
					{
						throw syntax_error;
					}
					if(toReturn.length > 0)
					{
						if(isOperator(e) && isOperator(toReturn[toReturn.length - 1]))
						{
							throw syntax_error;
						}
					}


					n_period = 0;
					token = e;
					toReturn.push(token);
				}
			}
			// console.log('token: ', token, ' collect: ', collect, ' e: ', e, ' toReturn: ', toReturn);
		}	
	}
	// );
	console.log('final toReturn:', toReturn.length);

	if(collect)
		toReturn.push(token);

	if(layer != 0)
	{
		throw syntax_error;
	}

	console.log('tokens: ', toReturn);
	return toReturn;
}
function solve(t)
{
	var outer_bf = [];
	var inner_bf = [];
	var collect = false;
	var layer = 0;

	var trig = false;
	var trig_func = '';

	var e;
	var i;
	for(i = 0; i < t.length; i++)
	{
		e = t[i];
		if(!collect)
		{
			if(e == '(')
			{
				collect = true;
			}
			else if(e == ')')
			{
				throw syntax_error;
			}
			else if(e == 'sin' || e == 'cos')
			{
				if(t[i+1] != '(')
				{
					throw syntax_error; 
				}
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
				if(inner_bf.length == 0)
				{
					throw syntax_error; 
				}
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
	}
	console.log('outer_bf: ', outer_bf);
	
	try
	{
		let n = solve_2(outer_bf);
		if(n > 9007199254740991)
		{
			throw over_error;
		}
		return n;
	}
	catch(err)
	{
		throw err;
	}
}
function solve_2(tokens)
{
	if(tokens.length == 1)
	{
		return parseFloat(tokens);
	}
	else if (tokens.length == 2)
	{
		if(tokens[0] == '-' && !isNaN(tokens[1]))
		{
			return parseFloat(tokens.join(''));
		}
		else
		{
			throw syntax_error;
		}
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
		var start = 1;
		//check if it starts with an operator, treat it as a sign
		if(tokens[0] == '+') 
		{
			start = 2;
		}
		else if (tokens[0] == '-')
		{
			tokens[1] = '-' + tokens[1];
			tokens.shift();
		}

		console.log('tokens0: ', tokens[0], ' start: ', start);
		for(i = start; i < tokens.length; i += 2)
		{
			if(tokens[i] == '+' || tokens[i] == '-')
			{
				var op = tokens[i];
				var arg_1 = solve_2(tokens.slice(start-1,i));
				var arg_2 = solve_2(tokens.slice(i + 1));

				return calculate(op, arg_1, arg_2);
			}
		}
		var op = tokens[tokens.length-2];
		var arg_1 = solve_2(tokens.slice(start-1, tokens.length-2));
		var arg_2 = tokens[tokens.length -1];

		return calculate(op, arg_1, arg_2);
	}
}


function updateLayer(c, layer)
{
	if(isOpenParanthesis(c))
	{
		layer++;
	}
	else if(isCloseParanthesis(c))
	{
		layer--;
	}
	return layer;
}

//filter. if character is an operator, make sure it is the symbol we are using and not the one on display
function ifOperator(c)
{
	var map_operator = {
		'×':'*',
		'÷':'/',
		'−':'-',
		'+':'+',
		'*':'*',
		'/':'/',
		'-':'-',
		'+':'+'
	};
	if(isOperator(c))
	{
		return map_operator[c];
	}
	else
	{
		return c;
	}
}
function isOperator(c)
{
	let operators = /[×÷−+\-+*/]/;
	if(c.match(operators) != null)
	{	
		return true;
	}
	return false;
}

function isOpenParanthesis(c)
{
	return (c == '(');
}
function isCloseParanthesis(c)
{
	return (c == ')');
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
	let number = /[0-9]/;
	if(c.match(number) != null)
	{
		return true;
	}
	return false;
}

function isPeriod(c)
{
	let number = /[\.]/;
	if(c.match(number) != null)
	{
		return true;
	}
	return false;
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