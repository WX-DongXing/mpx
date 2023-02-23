"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postcss_selector_parser_1 = __importDefault(require("postcss-selector-parser"));
// trans-special
exports.default = ({ id }) => {
    return {
        postcssPlugin: 'trans-special',
        Once: (root) => {
            root.each(function rewriteSelector(node) {
                if (!node.selector)
                    return;
                node.selector = (0, postcss_selector_parser_1.default)(selectors => {
                    selectors.each(selector => {
                        selector.each(n => {
                            if (/^:host$/.test(n.value)) {
                                const compoundSelectors = n.nodes;
                                n.replaceWith(postcss_selector_parser_1.default.className({
                                    value: 'host-' + id
                                }));
                                selector.insertAfter(n, compoundSelectors);
                            }
                        });
                    });
                }).processSync(node.selector);
            });
        }
    };
};
module.exports.postcss = true;
//# sourceMappingURL=trans-special.js.map