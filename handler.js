function make_tokens(input)//input is a string and not an array, careful
{
	var collect = false;
	var token = '';
	var toReturn = [];
	var n_period = 0;
	var layer = 0;

	var e;
	
	for(i = 0; i < input.length; i++)
	 {
	 	e = get_operator(input[i]);

	 	layer = update_layer(e, layer);
	 	n_period = update_period(e, n_period);

		console.log('E is: ', e);

		let is_multiple_char_token = (isNumber(e) || isPeriod(e) || isAlphabet(e));
		let start_create_token = (!isWhitespace(e) && !collect && is_multiple_char_token);
		let push_single_char_token = (!isWhitespace(e) && !collect && !is_multiple_char_token);
		let add_to_token = (!isWhitespace(e) && collect && is_multiple_char_token);
		let stop_create_token = (!isWhitespace(e) && collect && !is_multiple_char_token);

		let op_after_op = (isOperator(e) && toReturn.length > 0 && isOperator(toReturn[toReturn.length -1]));
		let dot_after_dot = (n_period > 1);
		let negative_layer = (layer < 0);

		if(op_after_op || negative_layer || dot_after_dot)
			throw syntax_error;

		if(start_create_token)
		{
			collect = true;
			token = e;
		}
		else if(add_to_token)
		{
			token += e;	
		}
		else if(stop_create_token)
		{
			collect = false;
			toReturn.push(token);

			n_period = 0;
			token = e;
			toReturn.push(token);	
		}
		else if(push_single_char_token)
		{
			token = e;
			toReturn.push(e);			
		}
	}

	if(collect)
		toReturn.push(token);

	if(layer != 0)
		throw syntax_error;

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



