const $ = require("jquery");
import * as ko from "knockout";

require("select2");

// This code has been copied from lines 383-387 of 
// ./node_modules/@types/knockout/index.d.ts
// As of 15/08/2019 We are no longer using @types/knockout
// because it leads to compiler errors, we might restore it when someone fixes it!
interface AllBindingsAccessor {
    (): any;
    get(name: string): any;
    has(name: string): boolean;
}

ko.bindingHandlers.select2 = {

    init: (element: Node, valueAccessor: () => any, allBindings: AllBindingsAccessor) => {

        const options = ko.toJS(valueAccessor()) || {};
        setTimeout(() => {

            $(element).select2(options);
            $(element).on("select2:unselecting", (ev: any) => {
                if (ev.params.args.originalEvent) {
                    // When unselecting (in multiple mode)
                    ev.params.args.originalEvent.stopPropagation();
                }
            });

            $(element).on("change", () => {
                const data = $(element).select2("data").map((o: any) => o.id);
                allBindings.get("selectedOptions")(data);
            });
        }, 0);

    },
};
