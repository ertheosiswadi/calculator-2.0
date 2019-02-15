const JS_MAX = 9007199254740991;

function update_period(e, n_period)
{
	if(isPeriod(e))
		n_period++;

	return n_period;
}
function update_layer(c, layer)
{
	if(isOpenParanthesis(c))
		layer++;
	else if(isCloseParanthesis(c))
		layer--;

	return layer;
}

function get_function_result(func_name, inner_bf)
{
	let result_inner = solve(inner_bf);
	let func_obj = {
		"sin" : Math.sin(result_inner),
		"cos" : Math.cos(result_inner),
		"tan" : Math.tan(result_inner),
		"sqrt": Math.sqrt(result_inner)
	}
	var to_return = func_obj[func_name];
	if(isNaN(to_return))
		throw math_error;
	return to_return;
}

//filter. if character is an operator, make sure it is the symbol we are using and not the one on display
function get_operator(c)
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
function is_function(e)
{
	var func_list = ["sin", "cos", "tan", "sqrt"];
	return func_list.includes(e);
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


