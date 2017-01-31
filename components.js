String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var HeadingElement = React.createClass({
    displayName: 'HeadingElement',

    render: function () {
        var level = Math.max(1, Math.min(this.props.level, 6));
        switch (level) {
            case 1:
                return React.createElement(
                    'h1',
                    null,
                    this.props.children
                );
            case 2:
                return React.createElement(
                    'h2',
                    null,
                    this.props.children
                );
            case 3:
                return React.createElement(
                    'h3',
                    null,
                    this.props.children
                );
            case 4:
                return React.createElement(
                    'h4',
                    null,
                    this.props.children
                );
            case 5:
                return React.createElement(
                    'h5',
                    null,
                    this.props.children
                );
            case 6:
                return React.createElement(
                    'h6',
                    null,
                    this.props.children
                );
        }
    }
});

var FormElementMixin = {
    getDefaultProps: function () {
        return {
            level: 1
        };
    },
    getTitle: function (element) {
        var title = $(element).attr('title');
        return title ? title : element.tagName.capitalize();
    }
};

var FormElementMultiple = React.createClass({
    displayName: 'FormElementMultiple',

    mixins: [FormElementMixin],
    getInitialState: function () {
        return {
            elements: []
        };
    },
    addElement: function () {
        this.setState({
            elements: this.state.elements.concat([$(this.props.element).clone().get(0)])
        });
    },
    getValues: function () {
        return this.state.elements.map(function (element) {
            return element.getValues();
        });
    },
    render: function () {
        return React.createElement(
            'div',
            null,
            React.createElement(
                'button',
                { onClick: this.addElement },
                'Add ',
                this.getTitle(this.props.element)
            ),
            this.state.elements.map(function (element) {
                return React.createElement(FormElementSingle, { element: element, level: this.props.level + 1 });
            }.bind(this))
        );
    }
});
var aXMLSerializer = new XMLSerializer();
var FormElementSingle = React.createClass({
    displayName: 'FormElementSingle',

    mixins: [FormElementMixin],
    getInitialState: function () {
        var $element = $(this.props.element);
        var basicElement = [];
        var nestedSingleElement = [];
        var nestedMultipleElement = [];
        $element.children().each(function (index, child) {
            var $child = $(child);
            var type = $child.attr('type');
            switch (type) {
                case 'text':
                    basicElement.push(child);
                    break;
                case 'nested':
                    if ($child.attr('multiple')) {
                        nestedMultipleElement.push(child);
                    } else {
                        nestedSingleElement.push(child);
                    }
                    break;
            };
        }.bind(this));
        return {
            basicElement: basicElement,
            nestedSingleElement: nestedSingleElement,
            nestedMultipleElement: nestedMultipleElement
        };
    },
    getValues: function () {
        return ['<?xml version="1.0" encoding="UTF-8" ?>\n', '<', this.props.element.tagName, '>'].concat(this.state.basicElement.map(function (element) {
            return aXMLSerializer.serializeToString(element);
            // return [
            //     '<', element.tagName, '>',
            //     $(element).text(),
            //     '</', element.tagName, '>',
            // ].join('');
        }), this.state.nestedSingleElement.map(function (element) {
            return element.getValues();
        }), this.state.nestedMultipleElement.map(function (element) {
            return element.getValues();
        })).concat(['</', this.props.element.tagName, '>']).join('');
    },
    render: function () {
        var getInputChangeHandler = function (element) {
            return function (e) {
                y = element;
                $(element).text(e.target.value);
            };
        };
        return React.createElement(
            'div',
            { className: 'box' },
            React.createElement(
                HeadingElement,
                { level: this.props.level },
                this.getTitle(this.props.element)
            ),
            React.createElement(
                'div',
                { className: 'label-container' },
                this.state.basicElement.map(function (element) {
                    return React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'label',
                            null,
                            this.getTitle(element),
                            ' ',
                            React.createElement('input', { type: 'text', defaultValue: $(element).text(), onChange: getInputChangeHandler(element) })
                        )
                    );
                }.bind(this))
            ),
            this.state.nestedSingleElement.map(function (element) {
                return React.createElement(
                    'div',
                    { className: 'indent' },
                    React.createElement(FormElementSingle, { element: element, level: this.props.level + 1 })
                );
            }.bind(this)),
            this.state.nestedMultipleElement.map(function (element) {
                return React.createElement(
                    'div',
                    { className: 'indent' },
                    React.createElement(FormElementMultiple, { element: element, level: this.props.level + 1 })
                );
            }.bind(this))
        );
    }
});
