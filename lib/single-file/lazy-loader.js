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

this.lazyLoader = this.lazyLoader || (() => {

	const DATA_URI_PREFIX = "data:";
	const EMPTY_DATA_URI = "data:base64,";

	return {
		process(doc) {
			replaceSrc(doc.querySelectorAll("img[data-src]"), "src");
			replaceSrc(doc.querySelectorAll("img[data-original]"), "original");
			doc.querySelectorAll("[data-bg]").forEach(element => {
				const dataBg = element.dataset.bg;
				if (dataBg && dataBg.startsWith(DATA_URI_PREFIX) && dataBg != EMPTY_DATA_URI && !element.style.backgroundImage.includes(dataBg)) {
					element.style.backgroundImage = "url(" + element.dataset.bg + ")";
					element.removeAttribute("data-bg");
					processElement(element);
				}
			});
			doc.querySelectorAll("[data-srcset]").forEach(imgElement => {
				const srcset = imgElement.dataset.srcset;
				if (srcset && imgElement.srcset != srcset) {
					imgElement.srcset = srcset;
					imgElement.removeAttribute("data-srcset");
					processElement(imgElement);
				}
			});
			doc.querySelectorAll(".lazyload").forEach(element => {
				element.classList.add("lazypreload");
				element.classList.remove("lazyload");
			});
		},
		imageSelectors: {
			src: {
				"img[data-src]": "data-src",
				"img[data-original]": "data-original",
				"img[data-bg]": "data-bg"
			},
			srcset: {
				"[data-srcset]": "data-srcset"
			}
		}
	};

	function replaceSrc(elements, attributeName) {
		elements.forEach(element => {
			const dataSrc = element.dataset[attributeName];
			if (dataSrc && dataSrc.startsWith(DATA_URI_PREFIX) && dataSrc != EMPTY_DATA_URI && element.src != dataSrc) {
				element.src = element.dataset[attributeName];
				element.removeAttribute("data-" + attributeName);
				processElement(element);
			}
		});
	}

	function processElement(element) {
		element.removeAttribute("data-lazyload");
		element.classList.remove("b-lazy");
	}

})();