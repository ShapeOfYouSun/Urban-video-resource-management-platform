function Table($elt, options) {
    this.$elt = $elt;
    this.options = options;
    this._defaultOptions = {
        height: undefined,
        classes: 'table table-bordered table-hover',
        theadClasses: '',
        rowStyle: function rowStyle(row, index) { return {}; },
        rowAttributes: function rowAttributes(row, index) { return {}; },
        undefinedText: '-',
        locale: undefined,
        virtualScroll: false, // `true` to enable virtual scroll to displays a virtual, "infinite" list
        virtualScrollItemHeight: undefined,
        sortable: true,
        sortClass: undefined,
        silentSort: true,
        sortName: undefined,
        sortOrder: 'asc',
        sortTable: false,
        rememberOrder: false,
        customSort: undefined,
        columns: [[]],
        data: [],
        url: undefined,
        method: 'get',
        cache: true,
        contentType: 'application/json',
        dataType: 'json',
        ajax: undefined,
        ajaxOptions: {},
        queryParams: function(params) { return params; },
        queryParamsType: 'limit',
        responseHandler: function responseHandler(res) { return res; },
        totalField: 'total',
        totalNotFilteredField: 'totalNotFiltered',
        dataField: 'rows',
        pagination: false,
        onlyInfoPagination: false,
        showExtendedPagination: false,
        paginationLoop: true,
        sidePagination: 'client', // client/server
        totalRows: 0,
        totalNotFiltered: 0,
        pageNumber: 1,
        pageSize: 10,
        pageList: [10, 25, 50, 100],
        paginationHAlign: 'right', // right/left
        paginationVAlign: 'bottom', // bottom, top, both
        paginationDetailHAlign: 'left', // right, left
        paginationPreText: '&lsaquo;',
        paginationNextText: '&rsaquo;',
        paginationSuccessivelySize: 5, // Maximum successively number of pages in a row
        paginationPagesBySide: 1, // Number of pages on each side(right, left) of the current page.
        paginationUseIntermediate: false, // Calculate intermediate pages for quick access
        search: false,
        searchOnEnterKey: false,
        strictSearch: false,
        visibleSearch: false,
        showButtonIcons: true,
        showButtonText: false,
        showSearchButton: false,
        showSearchClearButton: false,
        trimOnSearch: true,
        searchAlign: 'right',
        searchTimeOut: 500,
        searchText: '',
        customSearch: undefined,
        showHeader: true,
        showFooter: false,
        footerStyle: function footerStyle(row, index) { return {}; },
        showColumns: false,
        showColumnsToggleAll: false,
        minimumCountColumns: 1,
        showPaginationSwitch: false,
        showRefresh: false,
        showToggle: false,
        showFullscreen: false,
        smartDisplay: true,
        escape: false,
        filterOptions: { filterAlgorithm: 'and' },
        idField: undefined,
        selectItemName: 'btSelectItem',
        clickToSelect: false,
        ignoreClickToSelectOn: function ignoreClickToSelectOn(_ref) {
            var tagName = _ref.tagName;
            return ['A', 'BUTTON'].includes(tagName);
        },
        singleSelect: false,
        checkboxHeader: true,
        maintainMetaData: false,
        multipleSelectRow: false,
        uniqueId: undefined,
        cardView: false,
        detailView: false,
        detailViewIcon: true,
        detailViewByClick: false,
        detailFormatter: function detailFormatter(index, row) { return ''; },
        detailFilter: function detailFilter(index, row) { return true; },
        toolbar: undefined,
        toolbarAlign: 'left',
        buttonsToolbar: undefined,
        buttonsAlign: 'right',
        onClickAll: function onClickCell(field, value, row, $element) { return false; },
        onDblClickCell: function onDblClickCell(field, value, row, $element) { return false; },
        onClickRow: function onClickRow(item, $element) { return false; },
        onDblClickRow: function onDblClickRow(item, $element) { return false; },
        onSort: function onSort(name, order) { return false; },
        onCheck: function onCheck(row) { return false; },
        onUncheck: function onUncheck(row) {return false; },
        onCheckAll: function onUncheckAll(rows) { return false; },
        onUnCheckAll: function onUncheckAll(rows) { return false; },
        onCheckSome: function(rows) { return false; },
        onUncheckSome: function onUncheckSome(rows) { return false; },
        onLoadSuccess: function onLoadSuccess(data) { return false; },
        onLoadError: function onLoadError(status) { return false; },
        onColumnSwitch: function onColumnSwitch(field, checked) { return false; },
        onPageChange: function onPageChange(number, size) { return false; },
        onSearch: function onSearch(text) { return false; },
        onToggle: function onToggle(cardView) { return false; },
        onPreBody: function onPreBody(data) { return false; },
        onPostBody: function onPostBody() { return false; },
        onPostHeader: function onPostHeader() { return false; },
        onPostFooter: function onPostFooter() { return false; },
        onExpandRow: function onExpandRow(index, row, $detail) { return false; },
        onCollapseRow: function onCollapseRow(index, row) { return false; },
        onRefreshOptions: function onCollapseRow(index, row) { return false; },
        onRefresh: function onRefresh(params) { return false; },
        onResetView: function onResetView() { return false; },
        onScrollBody: function onScrollBody() { return false; },
    }
}

Table.prototype = {};

Table.prototype.init = function() {

};

Table.prototype.create = function() {
    return this.$elt.bootstrapTable(this.options);
};

Table.prototype.reload = function() {
    return this.$elt.bootstrapTable('refresh', {silent: true, pageNumber: 1, pageSize: 10});
};

Table.prototype.refresh = function() {
    return this.$elt.bootstrapTable('refresh', {silent: true});
};

Table.prototype.getSelections = function() {
    return this.$elt.bootstrapTable('getSelections');
};