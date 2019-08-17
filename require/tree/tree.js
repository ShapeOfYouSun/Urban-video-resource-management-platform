function Tree($elt, data) {
    this.$elt = $elt;
    this.data = data;
    this._tree = null;
    this.targetNode = null;
}

Tree.prototype = {};

Tree.prototype.init = function() {

};

Tree.prototype.getNodeId = function(id) {
    return this.targetNode.nodes.find(function(currentValue) {
        return currentValue.id === id;
    }).nodeId;
};

Tree.prototype.create = function(events) {
    this.$elt.treeview({
        data: this.data,
        levels: 2,

        expandIcon: 'fa fa-angle-right',
        collapseIcon: 'fa fa-angle-down',
        emptyIcon: 'glyphicon',
        nodeIcon: '',
        selectedIcon: '',
        checkedIcon: 'glyphicon glyphicon-check',
        uncheckedIcon: 'glyphicon glyphicon-unchecked',

        color: undefined, // '#000000',
        backColor: undefined, // '#FFFFFF',
        borderColor: undefined, // '#dddddd',
        onhoverColor: '#F5F5F5',
        selectedColor: '#dbdbdb',
        selectedBackColor: '#6c757d',
        searchResultColor: '#ee1828',
        searchResultBackColor: undefined,

        enableLinks:false,
        highlightSelected: true,
        highlightSearchResults: true,
        showBorder: true,
        showIcon: true,
        showCheckbox: false,
        showTags: false,
        multiSelect: false,

        // Event handlers
        onNodeChecked: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `onNodeChecked` is triggered ~');
            events.onNodeChecked && events.onNodeChecked.call(undefined, event, node);
        },
        onNodeCollapsed: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `onNodeCollapsed` is triggered ~');
            events.onNodeCollapsed && events.onNodeCollapsed.call(undefined, event, node);
        },
        onNodeDisabled: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `noNodeDisabled` is triggered ~');
            events.onNodeDisabled && events.onNodeDisabled.call(undefined, event, node);
        },
        onNodeEnabled: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `noNodeEnabled` is triggered ~');
            events.onNodeEnabled && events.onNodeEnabled.call(undefined, event, node);
        },
        onNodeExpanded: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `onNodeExpanded` is triggered ~');
            events.onNodeExpanded && events.onNodeExpanded.call(undefined, event, node);
        },
        onNodeSelected: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `onNodeSelected` is triggered ~');
            events.onNodeSelected && events.onNodeSelected.call(undefined, events, node);
        },
        onNodeUnchecked: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `onNodeUnchecked` is triggered ~');
            events.onNodeUnchecked && events.onNodeUnchecked.call(undefined, events, node);
        },
        onNodeUnselected: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `onNodeUnselected` is triggered ~');
            events.onNodeUnselected && events.onNodeUnselected.call(undefined, events, node);
        },
        onSearchComplete: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `noSearchComplete` is triggered ~');
            events.onSearchComplete && events.onSearchComplete.call(undefined, events, node);
        },
        onSearchCleared: function(event, node) {
            event.stopPropagation();
            event.preventDefault();
            console.log('Event `noSearchCleared` is triggered ~');
            events.onSearchCleared && events.onSearchCleared.call(undefined, events, node);
        }
    });
    this._tree = this.$elt.data('treeview');
    this.targetNode = this._tree.getSelf();
};

Tree.prototype.checkAll = function(options) {
    return this.$elt.treeview('checkAll', options);
};

Tree.prototype.checkNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('checkNode', temp, options);
};

Tree.prototype.clearSearch = function() {
    return this.$elt.treeview('clearSearch');
};

Tree.prototype.collapseAll = function(options) {
    return this.$elt.treeview('collapseAll', options);
};

Tree.prototype.collapseNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('collapseNode', temp, options);
};

Tree.prototype.disableAll = function(options) {
    return this.$elt.treeview('disableAll', options);
};

Tree.prototype.disableNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('disableNode', temp, options);
};

Tree.prototype.enableAll = function(options) {
    return this.$elt.treeview('enableAll', options);
};

Tree.prototype.enableNode = function(options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('enableNode', temp, options);
};

Tree.prototype.expandAll = function(options) {
    return this.$elt.treeview('expandAll', options);
};

Tree.prototype.expandNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('expandNode', temp, options);
};

Tree.prototype.getCollapsed = function() {
    return this.$elt.treeview('getCollapsed');
};

Tree.prototype.getDisabled = function() {
    return this.$elt.treeview('getDisabled');
};

Tree.prototype.getEnabled = function() {
    return this.$elt.treeview('getEnabled');
};

Tree.prototype.getExpanded = function() {
    return this.$elt.treeview('getExpanded');
};

Tree.prototype.getNode = function(nodeId) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('getNode', temp);
};

Tree.prototype.getParent = function(nodeId) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('getParent', temp);
};

Tree.prototype.getSelected = function() {
    return this.$elt.treeview('getSelected');
};

Tree.prototype.getSiblings = function(nodeId) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('getSiblings', temp);
};

Tree.prototype.getUnselected = function() {
    return this.$elt.treeview('getUnselected');
};

Tree.prototype.remove = function() {
    return this.$elt.treeview('remove');
};

Tree.prototype.revealNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('revealNode', temp, options);
};

Tree.prototype.search = function(pattern, options) {
    return this.$elt.treeview('search', pattern, options);
};

Tree.prototype.selectNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('selectNode', temp, options);
};

Tree.prototype.toggleNodeChecked = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('toggleNodeChecked', temp, options);
};

Tree.prototype.toggleNodeDisabled = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('toggleNodeDisabled', temp, options);
};

Tree.prototype.toggleNodeSelected = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('toggleNodeSelected', temp, options);
};

Tree.prototype.uncheckAll = function(options) {
    return this.$elt.treeview('uncheckAll', options);
};

Tree.prototype.uncheckNode = function(nodeId, options) {
    let temp = this.getNodeId(nodeId);
    return this.$elt.treeview('uncheckNode', temp, options);
};

// event bind
Tree.prototype.on = function(type, callback) {
    return this.$elt.on(type, callback);
};




















