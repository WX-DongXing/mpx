declare function makeAttrsMap(attrs: any[]): {
    [key: string]: any;
};
declare function parseComponent(content: any, options: any): {
    template: null;
    script: null;
    json: null;
    styles: never[];
    customBlocks: never[];
};
declare function parse(template: any, options: any): {
    root: any;
    meta: {};
};
declare function addAttrs(el: any, attrs: any): void;
declare function stringifyWithResolveComputed(modelValue: any): string;
declare function parseMustache(raw?: string): {
    result: string;
    hasBinding: boolean;
    val: string;
    replaced: boolean;
};
declare function stringifyAttr(val: any): string | undefined;
declare function serialize(root: any): string;
declare function genNode(node: any): string;
export { parseComponent, parse, serialize, genNode, makeAttrsMap, stringifyAttr, parseMustache, stringifyWithResolveComputed, addAttrs };
