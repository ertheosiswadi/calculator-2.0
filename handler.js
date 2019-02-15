function make_tokens(input)//input is a string and not an array, careful
{
	var collect = false;
	var token = '';
	var toReturn = [];
	var n_period = 0;
	var layer = 0;

	var e;
	var prev_e = '0';

	for(i = 0; i < input.length; i++)
	{
	 	e = get_operator(input[i]);

	 	layer = update_layer(e, layer);
	 	n_period = update_period(e, n_period);

		console.log('E is: ', e, 'toRet: ', toReturn);

		var is_multiple_char_token = (isNumber(e) || isPeriod(e) || isAlphabet(e));
		var start_create_token = (!isWhitespace(e) && !collect && is_multiple_char_token);
		var push_single_char_token = (!isWhitespace(e) && !collect && !is_multiple_char_token);
		var add_to_token = (!isWhitespace(e) && collect && is_multiple_char_token);
		var stop_create_token = (!isWhitespace(e) && collect && !is_multiple_char_token);

		var op_after_op = (isOperator(e) && toReturn.length > 0 && isOperator(prev_e));
		var dot_after_dot = (n_period > 1);
		var negative_layer = (layer < 0);

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
	prev_e = e;

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

	var is_func = false;
	var func_name = '';

	var e;
	var i;
	for(i = 0; i < t.length; i++)
	{
		e = t[i];
		layer = update_layer(e, layer);

		//conditions for pushing to inner_buf - means inside paranthesis
		var start_push_inner_bf_paranthesis = (!collect && isOpenParanthesis(e));
		var start_push_inner_bf_function = (!collect && is_function(e));
		var end_push_inner_bf = (collect && isCloseParanthesis(e) && (layer == 0));
		var push_inner_bf = (collect && !end_push_inner_bf);
		//conditions for pushing to outer_buf - means outside paranthesis
		var push_outer_bf = (!collect && !start_push_inner_bf_paranthesis && !start_push_inner_bf_function);
		//conditions for error
		var is_not_open_paranthesis_after_func_name = (start_push_inner_bf_function && !isOpenParanthesis(t[i+1]));
		var paranthesis_is_empty = (end_push_inner_bf && (inner_bf.length == 0));

		if(is_not_open_paranthesis_after_func_name || paranthesis_is_empty)
			throw syntax_error;

		if(start_push_inner_bf_paranthesis)
		{
			collect = true;
		}
		else if(start_push_inner_bf_function)
		{
			func_name = e;
			is_func = true;			
		}
		else if(push_inner_bf)
		{
			inner_bf.push(e);
		}
		else if(end_push_inner_bf)
		{
			if(is_func)
			{
				var result = get_function_result(func_name, inner_bf);
				outer_bf.push(result.toString());
			}
			else
			{
				outer_bf.push(solve(inner_bf).toString());
			}

			//flush - prepare for next inner
			inner_bf = [];
			collect = false;
			is_func = false;			
		}
		else if(push_outer_bf)
		{
			outer_bf.push(e);
		}
	}
	console.log('outer_bf: ', outer_bf);
	

	var to_return = solve_plain(outer_bf);
	if(to_return > JS_MAX)
	{
		throw over_error;
	}
	return to_return;
}

function solve_plain(tokens)
{
	var is_number = ((tokens.length == 1) && (!isNaN(tokens[0])));
	var is_negative_number = ((tokens.length == 2) && (tokens[0] == '-' ) && !isNaN(tokens[1]));
	var is_simple_comp = (tokens.length == 3);

	//error conditions
	var is_invalid_token = ((tokens.length == 2) && !((tokens[0] == '-' ) && !isNaN(tokens[1])));

	if(is_invalid_token)
		throw syntax_error;

	if(is_number)
	{
		return parseFloat(tokens);
	}
	else if (is_negative_number)
	{
		return parseFloat(tokens.join(''));
	}
	else if(is_simple_comp)
	{
		return solve_plain_short(tokens);
	}
	else
	{	
		return solve_plain_long(tokens);
	}
}

function solve_plain_short(tokens)
{
	var op = tokens[1];
	var arg_1 = parseFloat(tokens[0]);
	var arg_2 = parseFloat(tokens[2]);

	return calculate(op, arg_1, arg_2);
}

function solve_plain_long(tokens)
{
	var start = 1;
	//check if it starts with an operator, treat it as a sign
	if(tokens[0] == '+') 
	{
		start = 2;//ignore the token in calculation
	}
	else if (tokens[0] == '-')
	{
		tokens[1] = '-' + tokens[1];
		tokens.shift();
	}

	for(i = start; i < tokens.length; i += 2)
	{
		//calculate with these operators last, others have higher precedence
		if(tokens[i] == '+' || tokens[i] == '-')
		{
			var op = tokens[i];
			var arg_1 = solve_plain(tokens.slice(start-1,i));
			var arg_2 = solve_plain(tokens.slice(i + 1));

			return calculate(op, arg_1, arg_2);
		}
	}

	//go from left to right if operators are only mul and div
	var op = tokens[tokens.length-2];
	var arg_1 = solve_plain(tokens.slice(start-1, tokens.length-2));
	var arg_2 = tokens[tokens.length -1];

	return calculate(op, arg_1, arg_2);	
}



