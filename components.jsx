String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

var HeadingElement = React.createClass({
    render: function () {
        var level = Math.max(1, Math.min(this.props.level, 6));
        switch (level) {
            case 1:
                return <h1>{this.props.children}</h1>;
            case 2:
                return <h2>{this.props.children}</h2>
            case 3:
                return <h3>{this.props.children}</h3>
            case 4:
                return <h4>{this.props.children}</h4>
            case 5:
                return <h5>{this.props.children}</h5>
            case 6:
                return <h6>{this.props.children}</h6>
        }
    },
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
    },
}

var FormElementMultiple =  React.createClass({
    mixins : [FormElementMixin],
    getInitialState: function () {
        return {
            elements: [],
        };
    },
    addElement: function () {
        this.setState({
            elements: this.state.elements.concat([$(this.props.element).clone().get(0)]),
        });
    },
    getValues: function () {
        return this.state.elements.map(function (element) {
            return element.getValues();
        });
    },
    render: function () {
        return (
            <div>
                <button onClick={this.addElement}>Add {this.getTitle(this.props.element)}</button>
                {this.state.elements.map(function (element) {
                    return <FormElementSingle element={element} level={this.props.level + 1} />;
                }.bind(this))}
            </div>
        );
    },
});
var aXMLSerializer = new XMLSerializer();
var FormElementSingle = React.createClass({
    mixins : [FormElementMixin],
    getInitialState: function () {
        var $element = $(this.props.element);
        var basicElement = [];
        var nestedSingleElement = [];
        var nestedMultipleElement = [];
        $element.children().each(function (index, child) {
            var $child =  $(child);
            var type = $child.attr('type');
            switch (type) {
                case 'text':
                    basicElement.push(child);
                    break;
                case 'nested':
                    if ($child.attr('multiple')) {
                        nestedMultipleElement.push(child);
                    }
                    else {
                        nestedSingleElement.push(child);
                    }
                    break;
            };
        }.bind(this));
        return {
            basicElement: basicElement,
            nestedSingleElement: nestedSingleElement,
            nestedMultipleElement: nestedMultipleElement,
        };
    },
    getValues: function () {
        return [
            '<?xml version="1.0" encoding="UTF-8" ?>\n',
            '<', this.props.element.tagName, '>',
        ].concat(
            this.state.basicElement.map(function (element) {
                return aXMLSerializer.serializeToString(element);
                // return [
                //     '<', element.tagName, '>',
                //     $(element).text(),
                //     '</', element.tagName, '>',
                // ].join('');
            }),
            this.state.nestedSingleElement.map(function (element) {
                return element.getValues();
            }),
            this.state.nestedMultipleElement.map(function (element) {
                return element.getValues();
            })
        ).concat([
            '</', this.props.element.tagName, '>',
        ]).join('');
    },
    render: function () {
        var getInputChangeHandler = function (element) {
            return function (e) {
                y = element;
                $(element).text(e.target.value);
            };
        };
        return (
            <div className="box">
                <HeadingElement level={this.props.level}>{this.getTitle(this.props.element)}</HeadingElement>
                <div className="label-container">
                    {this.state.basicElement.map(function (element) {
                        return (
                            <div>
                                <label>
                                    {this.getTitle(element)}
                                    &nbsp;
                                    <input type="text" defaultValue={$(element).text()} onChange={getInputChangeHandler(element)}/>
                                </label>
                            </div>
                        );
                    }.bind(this))}
                </div>
                {this.state.nestedSingleElement.map(function (element) {
                    return (
                        <div className="indent">
                            <FormElementSingle element={element} level={this.props.level + 1} />
                        </div>
                    );
                }.bind(this))}
                {this.state.nestedMultipleElement.map(function (element) {
                    return (
                        <div className="indent">
                            <FormElementMultiple element={element} level={this.props.level + 1} />
                        </div>
                    );
                }.bind(this))}
            </div>
        );
    },
});
