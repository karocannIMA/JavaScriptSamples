$.ajaxSetup({ cache: false })
if ($APP.UI) {

    //
    // BEGIN NAMESPACE: $APP.UI
    ///////////////////////////////////////////////////////////////////////////////////////////////////

    $APP.namespace('$APP.UI.EditableLists');
    $APP.UI.EditableLists = (function () {
        // Note: this function requires fully qualified references to itself as the function
        // is passed to another as an arguement below, in "$APP.initializers.push($APP.UI);"
        return {
            init: function () {
                $APP.log('$APP.UI.init() started');
                $APP.UI.registerNewContent(document);
                $APP.log('$APP.UI.init() finished');
            }
        }
    } ());
    $APP.initializers.push($APP.UI.init);

    $APP.UI.registerNewContent = function (scope) {
        $APP.UI.EditableLists.register(scope);
        $APP.log('$APP.UI.EditableListsregisterNewContent() complete');
    };
    $APP.contentRegistrars.push($APP.UI.registerNewContent);

}