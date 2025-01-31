$.ajaxSetup({ cache: false })
//
// BEGIN NAMESPACE: $APP
///////////////////////////////////////////////////////////////////////////////////////////////////

//
// $APP is the central namespace/object for all of our custom JavaScript functionality.  It houses
// all custom scripting in several namespaces organized by their purpose.


var $APP = $APP || (function () {

    return {

        //
        // Public array: "initializers"
        // This is used by internal namespaces to register themselves with $APP.  During init(),
        // the init() function for each namespace will be called, if it exists.

        initializers: [],

        // Public array: "contentRegistrars"
        // This array is added to as namespaces are created.  Each namespace can supply a function
        // here which will be called whenever someone invokes "$APP.registerNewContent()"

        contentRegistrars: [],

        //
        // Public function: "init"
        // Runs each init() function for all internal namespaces.  init() functions are used to
        // to run any set up code prior to functionality being used by the application.

        init: function () {
            $APP.log('$APP.init() started');

            // register all element data
            if (this.elementData) this.elementData.register();

            // execute each initializer that has been set.
            for (var i = 0; i < this.initializers.length; i++) {
                this.initializers[i]();
            }
            $APP.log('$APP.init() finished');
        }
    }
} ());

//
// Public object: "elementData"
// This object is used to manage data associated with elements in the DOM by making use of an
// internal array named "items".  The collect() function will harvest element data that was 
// setup by developers via the global data[] array or form the newer storage method involving
// hidden inputs.

$APP.elementData = (function () {
    return {
        items: [],
        register: function () {
            this.items = []; // reset the array
            $('input.element_data').each(function (i, obj) {
                var dataItems = $(obj).val().split('[:::]');
                $APP.elementData.items.push(dataItems);
                $('#' + dataItems[0]).data(dataItems[1], dataItems[2]);
            });
            $APP.log('$APP.elementData.register() finished, ' + this.items.length + ' found');
        }
    };
} ());

$APP.findParentByClassName = function (element, parentClassName) {
    if ($(element).length == 0) return false;
    do {
        element = $(element).parent();
        if (element.get(0) == undefined) return false;
        if (element.get(0).tagName == "HTML") return false;
    } while (!element.hasClass(parentClassName));
    return element;
};

$APP.findParentByElementType = function (element, tagName) {
    if ($(element).length == 0) return false;
    do {
        element = $(element).parent();
        if (element.get(0) == undefined) return false;
        if (element.get(0).tagName == "HTML") return false;
    } while (element.get(0).tagName != tagName.toUpperCase());
    return element;
};

$APP.hasParentWithID = function (element, parentID) {
    if ($(element).length == 0) return false;
    do {
        element = $(element).parent();
        if (element.get(0) == undefined) return false;
        if (element.get(0).tagName == "HTML") return false;
        if (element.get(0).id == parentID) return true;
    } while (true);
};

//
// Public function: "log"
// Logging functionality has been created for $APP so that we can interact with the console.log 
// feature of the FireBug addon in FireFox.  All log functionality works to sandbox calls to the
// console.log method for when the application is being used outside of development (where it's 
// unlikely that FireBug is installed).

$APP.log = function (msg) {
    if (this.logging == true) {
        if (window.console) {
            window.console.log(msg);
        }
    } else {
        this.logs.push(msg);
    }
};
$APP.logs = [];         // Public array: "logs"
$APP.logging = false;   // Public property: "logging"

//
// Public function: "namespace"
// This function can be used to add additional namespaces to "$APP".  The function 
// accepts a fully qualified signature for the namespace and then creates any intermediate
// namespaces.
// Example: $APP.namespace('$APP.Forms.Validation');
// Creates: $APP.Forms and $APP.Forms.Validation

$APP.namespace = function (ns_name) {
    var parts = ns_name.split('.'),
        parent = this,
        i;
    if (parts[0] === "$APP") {
        parts = parts.slice(1);
    }
    for (i = 0; i < parts.length; i += 1) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    $APP.log('namespace [' + ns_name + '] created');
    return parent;
}

//
// $APP.scriptRunner
////////////////////////////////////////////////////////////////////////////////////////////////////
// This is a feature that dev's can use to push JS functions from content contained in a 
// partial from an AJAX call. This will then be ran after $APP runs all of it's initial
// code over the newly received content. That way, all functionality provided by $APP
// is there before any other page-level scripts are ran.
// Here's how you can invoke it:
// 
// ...[HTML CONTENT]...
// 
// <script type="text/javascript">
//      $APP.scriptRunner.push(function () {
//          //do something interesting after $APP is finished manipulating the above HTML CONTENT.
//      });
// </script>
// 
// Please note that $APP.scriptRunner gets reset after each call to $APP.registerNewContent(), below
//

$APP.scriptRunner = [];


//
// Public function: "registerNewContent"
// Accepts a scope and then calls the same method name for each of the libraries registered
// with the $APP object.
$APP.registerNewContent = function (scope) {

    $APP.log('$APP.registerNewContent() started');

    // Resolve the scope before we begin
    scope = scope || $(document);

    // register all element data frist
    if (this.elementData) this.elementData.register();

    // execute each registrar that has been set.
    for (var i = 0; i < this.contentRegistrars.length; i++) {
        if (this.contentRegistrars[i]) {
            this.contentRegistrars[i](scope);
        }
    }

    $.each($APP.scriptRunner, function (i, obj) {
        obj();
    });
    $APP.scriptRunner = [];

   // $APP.UI.hideLoading(scope);
    $APP.log('$APP.registerNewContent() finished');
};

$APP.resolveLiveURL = function (element) {
    // Resolve the URL if a liveUrl is setup.  liveURL should return
    // false if the parameters it needs aren't set up correctly.
    var URL = $(element).data('url');
    if (URL == undefined) {
        return false;
    }
    var liveURL = $(element).data('liveUrl');
    if (liveURL != undefined) {
        URL = liveURL(URL);
    }
    return URL;
}

