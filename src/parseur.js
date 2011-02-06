(function(){
  var Node = function() {
    var me = this;

    me.parent = null;
    me.children = [];
    me.length = null;
    me.name = "";
    me.totalLeaves = 0;
    me.totalDescendants = 0;
    me.depth = 0;
    me.finalDescendant = me;

    function addChild(data) {
		var node = new Node();

		node.parent = me;
		node.depth = me.depth + 1;

		node.parse(data);

		me.totalLeaves += node.totalLeaves;
		me.totalDescendants += 1
		me.totalDescendants += node.totalDescendants

		me.children.push(node);
    }

    // Initial parsing

    function parse(data) {
        var depth = 0, complete = false;
        var current = '', definition = '';
        var quoted = false;

        function addCurrent() {
            if (depth == 0) {
                definition += data[i];
            } else {
                current += data[i];
            }
        }

        for (var i = 0; i < data.length; i++) {
            var complete = false;

            if (data[i] == "'") {
                quoted = !quoted;
            } else if (quoted) {
                addCurrent();
            } else {
                switch (data[i]) {
                    case '(':
                        depth += 1;
                        if (depth != 1) {
                            current += data[i];
                        }
                        break;
                    case ')':
                        depth -= 1;
                        if (depth == 0) {
                            addChild(current);
                            current = '';
                        } else {
                            current += data[i];
                        }
                        break;
                    case ',':
                        if (depth == 1) {
                            addChild(current);
                            current = '';
                        } else {
                            current += data[i];
                        }
                        break;
                    case ';':
                        complete = true;
                        break;
                    default:
                        addCurrent();
                }
            }
            if (complete) break;
        }

        if (definition.length > 0) {
            defsplit = definition.split(':');
            me.name = defsplit[0];
            if (defsplit.length > 1) {
                me.length = parseFloat(defsplit[1]);
            }
        }

        if (me.children.length == 0) {
            me.totalLeaves = 1;
        } else {
            me.finalDescendant = me.children[me.children.length-1].finalDescendant;
        }

    }

    function recurse(callback) {
        callback(me);

        me.children.forEach(function(child) {
            child.recurse(callback);
        });
    }

    return $.extend(me, {
        parse: parse,
        recurse: recurse
    });
	}

	NewickParseur = function() {
		return {
			parse: function(data) {
				var nodes = {}, edges = {};

				var tree = new Node();	
				tree.parse(data);

				if (tree.totalDescendants > 0) {
					var maxlength = 0;

					tree.recurse(function(node) {
						if (node.length && node.length > maxlength)
							maxlength = node.length;
					});

					var max_id = 0;
					tree.recurse(function(node) {
						node.id = ++max_id;

						nodes[node.id] = { label: node.name };

						if (node.parent) {
							var edge = { src: node.parent.id, dst: node.id };
							edges[edge.src] = edges[edge.src]||{};
							edges[edge.src][edge.dst] = { truelen: node.length }
							if (globalSettings['lengths'] && node.length) edges[edge.src][edge.dst].length = (node.length/maxlength)*(globalSettings['length_strength']/20);
						}
					});
				}

				return { nodes: nodes, edges: edges }
			}
		}
	}

})()
