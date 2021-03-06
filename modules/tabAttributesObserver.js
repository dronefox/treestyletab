/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Tree Style Tab.
 *
 * The Initial Developer of the Original Code is YUKI "Piro" Hiroshi.
 * Portions created by the Initial Developer are Copyright (C) 2014-2016
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): YUKI "Piro" Hiroshi <piro.outsider.reflex@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ******/

var EXPORTED_SYMBOLS = ['TabAttributesObserver']; 

Components.utils.import('resource://treestyletab-modules/constants.js');

function TabAttributesObserver(aParams) {
	this.container = aParams.container;
	this.attributes = aParams.attributes;
	if (typeof this.attributes == 'string')
		this.attributes = this.attributes.split(',');
	this.callback = aParams.callback;
	this.init();
}
TabAttributesObserver.prototype = {
	get MutationObserver()
	{
		var w = this.container.ownerDocument.defaultView;
		return w.MutationObserver || w.MozMutationObserver;
	},

	init : function TabAttributesObserver_onInit() 
	{
		if (!this.MutationObserver)
			return;
		this.observer = new this.MutationObserver((function(aMutations, aObserver) {
			this.onMutation(aMutations, aObserver);
		}).bind(this));
		this.observer.observe(this.container, {
			childList       : false,
			attributes      : true,
			subtree         : true,
			attributeFilter : [
				'label',
				'visibleLabel',
				'image'
			]
		});
	},
	onMutation : function TabAttributesObserver_onMutation(aMutations, aObserver) 
	{
		aMutations.forEach(function(aMutation) {
			switch (aMutation.type)
			{
				case 'attributes':
					this.onAttributeModified(aMutation, aObserver);
					return;
			}
		}, this);
	},

	destroy : function TabAttributesObserver_destroy()
	{
		if (this.observer) {
			this.observer.disconnect();
			delete this.observer;
		}
		delete this.container;
	},

	onAttributeModified : function TabAttributesObserver_onAttributeModified(aMutation, aObserver) 
	{
		if (this.handlingAttrChange ||
			aMutation.target.localName != 'tab')
			return;

		this.handlingAttrChange = true;

		this.callback(aMutation.target);

		var w = this.container.ownerDocument.defaultView;
		w.setTimeout((function() {
			this.handlingAttrChange = false;
		}).bind(this), 10);
	}
};
