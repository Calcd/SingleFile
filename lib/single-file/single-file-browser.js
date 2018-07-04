/*
 * Copyright 2018 Gildas Lormeau
 * contact : gildas.lormeau <at> gmail.com
 * 
 * This file is part of SingleFile.
 *
 *   SingleFile is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   SingleFile is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *
 *   You should have received a copy of the GNU Lesser General Public License
 *   along with SingleFile.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global fetch, document, btoa, DOMParser, getComputedStyle, FileReader, SingleFileCore */

this.SingleFile = (() => {

	// --------
	// Download
	// --------
	const USER_AGENT = "Mozilla/5.0 (compatible; SingleFile Bot/1.0)";

	class Download {
		static async getContent(resourceURL, asDataURI) {
			const requestOptions = {
				method: "GET",
				headers: {
					"User-Agent": USER_AGENT
				}
			};
			let resourceContent;
			try {
				resourceContent = await fetch(resourceURL, requestOptions);
			} catch (e) {
				return asDataURI ? "data:base64," : "";
			}
			const contentType = resourceContent.headers.get("content-type");
			if (asDataURI) {
				try {
					const buffer = await resourceContent.arrayBuffer();
					const bytes = new Uint8Array(buffer);
					let base64Content = "";
					bytes.forEach(byte => base64Content += String.fromCharCode(byte));
					return "data:" + (contentType ? contentType + ";" : "") + "base64," + btoa(base64Content);
				} catch (e) {
					return "data:base64,";
				}
			} else {
				const matchCharset = contentType.match(/\s*;\s*charset\s*=\s*(.*)(;|$)/i);
				if (matchCharset && matchCharset[1]) {
					const fileReader = new FileReader();
					const blob = await resourceContent.blob();
					fileReader.readAsText(blob, matchCharset[1]);
					return new Promise((resolve, reject) => {
						fileReader.onload = event => resolve(event.target.result);
						fileReader.onerror = reject;
					});
				} else {
					return resourceContent.text();
				}
			}
		}
	}

	// ---
	// DOM
	// ---
	class DOM {
		static create(pageContent/*, url*/) {
			const doc = document.implementation.createHTMLDocument();
			doc.open();
			doc.write(pageContent);
			doc.close();
			return {
				DOMParser,
				getComputedStyle,
				document: doc,
				serialize: () => getDoctype(doc) + doc.documentElement.outerHTML
			};
		}
	}

	function getDoctype(doc) {
		const docType = doc.doctype;
		let docTypeString;
		if (docType) {
			docTypeString = "<!DOCTYPE " + docType.nodeName;
			if (docType.publicId) {
				docTypeString += " PUBLIC \"" + docType.publicId + "\"";
				if (docType.systemId)
					docTypeString += " \"" + docType.systemId + "\"";
			} else if (docType.systemId)
				docTypeString += " SYSTEM \"" + docType.systemId + "\"";
			if (docType.internalSubset)
				docTypeString += " [" + docType.internalSubset + "]";
			return docTypeString + ">\n";
		}
		return "";
	}

	return SingleFileCore(Download, DOM, URL);

})();