$(function () {
    $.get('design2.xml', function (response) {
        var element = React.createElement(FormElementSingle, {
            element: response.documentElement,
        });
        x = ReactDOM.render(element, $('.main-mount-node').get(0));
    });
});
