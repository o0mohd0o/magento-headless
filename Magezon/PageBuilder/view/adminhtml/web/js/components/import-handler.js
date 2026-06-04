define([
    'Magento_Catalog/js/components/import-handler'
], function (ImportHandler) {
    'use strict';

    return ImportHandler.extend({
    	updateValue: function (placeholder, component) {
            if (placeholder) {
            	var value = component.getPreview() || '';
            	if (value.indexOf('[mgz_pagebuilder]') === -1) {
            		this._super(placeholder, component);
            	} else {
            		this.values[placeholder] = '';
            		this._super('', component);
            	}
            }
    	}
    })
});