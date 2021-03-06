/**
`d2l-select-outcomes`

@demo demo/index.html
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import '@polymer/polymer/polymer-legacy.js';

import 'd2l-loading-spinner/d2l-loading-spinner.js';
import 'd2l-polymer-siren-behaviors/siren-entity-loading.js';
import 'd2l-typography/d2l-typography-shared-styles.js';
import 's-html/s-html.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="d2l-outcome">
	<template strip-whitespace="">
		<style>
			:host {
				display: block;
				width: 100%;
			}

			.d2l-outcome-wrap {
				display: flex;
				flex-direction: column-reverse;
			}

			.d2l-outcome-identifier {
				@apply --d2l-body-small-text;

				margin: 0.3rem 0 0 0;
			}

			.d2l-outcome-text {
				@apply --d2l-body-compact-text;
			}

			siren-entity-loading {
				--siren-entity-loading-min-height: 1.2rem;
			}

			d2l-loading-spinner {
				--d2l-loading-spinner-size: 1.2rem;
			}

			.d2l-outcome-wrap, .d2l-outcome-text {
				width: 100%;
			}
		</style>
		<siren-entity-loading href="[[href]]" token="[[token]]">
			<div class="d2l-outcome-wrap">
				<template is="dom-if" if="[[_hasOutcomeIdentifier(entity)]]">
					<div class="d2l-outcome-identifier">[[_getOutcomeIdentifier(entity)]]</div>
				</template>
				<div class="d2l-outcome-text">
					<s-html hidden="[[!_fromTrustedSource(entity)]]" html="[[_getDescriptionHtml(entity)]]"></s-html>
					<span hidden="[[_fromTrustedSource(entity)]]">[[entity.properties.description]]</span>
				</div>
			</div>

			<d2l-loading-spinner slot="loading"></d2l-loading-spinner>
		</siren-entity-loading>
	</template>


</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({

	is: 'd2l-outcome',

	behaviors: [
		D2L.PolymerBehaviors.Siren.EntityLoadingBehavior,
	],

	_hasOutcomeIdentifier: function(entity) {
		return !!this._getOutcomeIdentifier(entity);
	},

	_fromTrustedSource: function(entity) {
		return entity && entity.properties.source === 'asn';
	},

	_flattenList: function(doc, listElement) {
		var flattenedList = doc.createElement('span');
		flattenedList.appendChild(doc.createTextNode(' '));
		for (var i = 0; i < listElement.childNodes.length; i++) {
			var child = listElement.childNodes[i];
			if (!child.tagName || child.tagName.toLowerCase() !== 'li') {
				continue;
			}

			while (child.firstChild) {
				flattenedList.appendChild(child.firstChild);
			}
			flattenedList.appendChild(doc.createTextNode(', '));
		}

		flattenedList.replaceChild(doc.createTextNode(' '), flattenedList.lastChild);
		flattenedList.normalize();
		return flattenedList;
	},

	_getDescriptionHtml: function(entity) {
		if (!this._fromTrustedSource(entity) || !entity.properties.description) {
			return '';
		}

		var parsedHtml = new DOMParser().parseFromString(entity.properties.description, 'text/html');
		var listElements = parsedHtml.body.querySelectorAll('ul, ol, dl');

		for (var i = 0; i < listElements.length; i++) {
			var list = listElements[i];
			list.parentElement.replaceChild(this._flattenList(parsedHtml, list), list);
		}

		return parsedHtml.body.innerHTML;
	},

	_getOutcomeIdentifier: function(entity) {
		if (!entity) {
			return;
		}

		var properties = entity.properties;

		var notation = (properties.notation && properties.notation.trim()) || (properties.altNotation && properties.altNotation.trim());
		var primarySubject = null;

		if (properties.subjects && properties.subjects.length) {
			for (var i = 0; i < properties.subjects.length; i++) {
				if (properties.subjects[i] && properties.subjects[i].trim()) {
					primarySubject = properties.subjects[i];
					break;
				}
			}
		}

		var outcomeInfo = [
			primarySubject,
			properties.label && properties.label.trim(),
			properties.listId && properties.listId.trim()
		].filter(function(id) { return id; }).join(' ');

		if (outcomeInfo) {
			return notation ? (notation + ' - ' + outcomeInfo) : outcomeInfo;
		}

		return notation || '';
	}
});
