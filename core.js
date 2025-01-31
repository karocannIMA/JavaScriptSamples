$.ajaxSetup({ cache: false })
/*

Not sure of immediate use of these but seems to be a simple
and powerful way of caching functionality & data and extending 
core functionality of Javascript.

*/
// popular CS idea to cache data and handle large computations
// pass in function and the context against which the function is run
// not fully tested
function cache(fptr, ctx) {
    // Recursive function to handle variable number of parameters
    function prepareCache(pos) {
        var cache = {};
        // actual function returned. Each returned function returns acts as a single function(chained together);
        return function () {
            // check against cache object.  If data is already cached no need to perform function or store data
            if (pos == 0) {
                if (!(arguments[pos] in cache)) {
                    // allow function to use user-supplplied context.
                    cache[arguments[pos]] = fptr.apply(ctx, arguments);
                }
                return cache[arguments[pos]];
            }
            else {
                if (!(arguments[pos] in cache)) {
                    cache[arguments[pos]] = prepareCache(pos - 1);
                }
                return cache[arguments[pos]].apply(this, arguments);
            }
        }
    }
    return prepareCache(fptr.length - 1);
}

// Douglas Crockford - builds upon existing JS function object
Function.prototype.method = function (n, f) {
    if (!this.prototype[n]) {
        this.prototype[n] = f;
        return this;
    }
}

String.method('trim', function () {
    return this.replace(/^\s+|\s+$/g, '');
});

Object.method('create', function (o) {
    // Douglas Crockford method of illustrating object inheritance
    // declare function, which comes from Object
    var F = function{} ();
    //objects are set prototype property of Object (Object->Funcion)
    F.prototype = o;
    //ensures that the context is the object and not the global scope
    return new F();
});

Function.method('setVariableCriteria', function () {
    // allows setting default parameters.  Does NOT skip parameters
    // Use: if you call a fucntion with the same parameters, you can set these params once
    // and add on additional parameters as needed.
    var initargs = arguments, fptr = this;
    return function () {
        return fptr.apply(null, initargs.concat(arguments));
    };
});

function setCriteria(fptr) {
    // allows setting default parameterss.  Does skip first parameter since it is a function.
    // Use: if you call a fucntion with the same parameters, you can set these params once
    // and add on additional parameters as needed.

    var slicer = Array.prototype.slice
    var params = slicer(arguments, 1);

    return function () {
        // return function w/ initial args and functions.  Run in initial functions context.
        var initArgs = slicer(arguments);
        var finalArgs = params.concat(initArgs);
        return fptr.appy(null, finalArgs);
    };
}
